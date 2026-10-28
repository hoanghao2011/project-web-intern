import mongoose from 'mongoose';
import TransactionLog from '../models/TransactionLog.js';
import Equipment from '../models/Equipment.js';
import { AppError } from '../utils/AppError.js';
import { applyStatusTransition } from './equipmentStateMachine.js';
import { getIO } from '../socket/index.js';

export async function listTransactions(query) {
  const { equipment, type, site } = query;
  const filter = {};
  if (equipment) filter.equipment = equipment;
  if (type) filter.type = type;
  if (site) filter.$or = [{ fromSite: site }, { toSite: site }];

  return TransactionLog.find(filter)
    .populate('equipment', 'name code')
    .populate('fromSite', 'name')
    .populate('toSite', 'name')
    .populate('performedBy', 'name')
    .sort({ date: -1 })
    .limit(200);
}

// Nhập kho: tăng số lượng thiết bị, đưa về trạng thái in_stock nếu đang ở kho
export async function stockIn({ equipment: equipmentId, quantity, toSite, note, attachment }, userId) {
  const session = await mongoose.startSession();
  let result;

  await session.withTransaction(async () => {
    const equipment = await Equipment.findById(equipmentId).session(session);
    if (!equipment) throw new AppError('Không tìm thấy thiết bị', 404);

    equipment.quantity += Number(quantity);
    if (toSite) equipment.currentSite = toSite;
    await equipment.save({ session });

    const [log] = await TransactionLog.create(
      [
        {
          equipment: equipmentId,
          type: 'in',
          quantity,
          toSite: toSite || null,
          performedBy: userId,
          note,
          attachment,
        },
      ],
      { session }
    );

    result = { log, equipment };
  });

  session.endSession();

  getIO()?.emit('transaction:created', { type: 'in', equipmentId });
  getIO()?.emit('equipment:updated', { equipmentId });

  return result;
}

// Xuất kho / cấp phát cho công trình: trừ số lượng, gán site
export async function stockOut({ equipment: equipmentId, quantity, toSite, assignedTo, note, attachment }, userId) {
  const session = await mongoose.startSession();
  let result;

  await session.withTransaction(async () => {
    const equipment = await Equipment.findById(equipmentId).session(session);
    if (!equipment) throw new AppError('Không tìm thấy thiết bị', 404);

    if (equipment.quantity < Number(quantity)) {
      throw new AppError('Số lượng xuất vượt quá tồn kho hiện có', 400);
    }

    const fromSite = equipment.currentSite;
    equipment.quantity -= Number(quantity);
    if (toSite) equipment.currentSite = toSite;
    if (assignedTo) equipment.assignedTo = assignedTo;
    if (equipment.status === 'in_stock') {
      applyStatusTransition(equipment, 'active');
    }
    await equipment.save({ session });

    const [log] = await TransactionLog.create(
      [
        {
          equipment: equipmentId,
          type: 'out',
          quantity,
          fromSite: fromSite || null,
          toSite: toSite || null,
          performedBy: userId,
          note,
          attachment,
        },
      ],
      { session }
    );

    result = { log, equipment };
  });

  session.endSession();

  getIO()?.emit('transaction:created', { type: 'out', equipmentId });
  getIO()?.emit('equipment:updated', { equipmentId });

  return result;
}

// Điều chuyển giữa các công trình
export async function transfer({ equipment: equipmentId, toSite, note }, userId) {
  const session = await mongoose.startSession();
  let result;

  await session.withTransaction(async () => {
    const equipment = await Equipment.findById(equipmentId).session(session);
    if (!equipment) throw new AppError('Không tìm thấy thiết bị', 404);

    const fromSite = equipment.currentSite;
    equipment.currentSite = toSite;
    await equipment.save({ session });

    const [log] = await TransactionLog.create(
      [
        {
          equipment: equipmentId,
          type: 'transfer',
          quantity: equipment.quantity,
          fromSite: fromSite || null,
          toSite,
          performedBy: userId,
          note,
        },
      ],
      { session }
    );

    result = { log, equipment };
  });

  session.endSession();

  getIO()?.emit('transaction:created', { type: 'transfer', equipmentId });
  getIO()?.emit('equipment:updated', { equipmentId });

  return result;
}
