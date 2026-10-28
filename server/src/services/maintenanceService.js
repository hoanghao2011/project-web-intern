import mongoose from 'mongoose';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import Equipment from '../models/Equipment.js';
import { AppError } from '../utils/AppError.js';
import { applyStatusTransition } from './equipmentStateMachine.js';
import { getIO } from '../socket/index.js';

export async function listRecords(query) {
  const { equipment } = query;
  const filter = {};
  if (equipment) filter.equipment = equipment;

  return MaintenanceRecord.find(filter)
    .populate('equipment', 'name code')
    .populate('performedBy', 'name')
    .sort({ date: -1 });
}

// Danh sách thiết bị sắp/đã quá hạn bảo trì, sort theo hạn gần nhất
export async function getUpcoming(days = 30) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + Number(days));

  const equipment = await Equipment.find({
    nextMaintenanceDate: { $ne: null, $lte: threshold },
    status: { $ne: 'liquidated' },
  })
    .populate('category', 'name')
    .populate('currentSite', 'name')
    .sort({ nextMaintenanceDate: 1 });

  const now = new Date();
  return equipment.map((eq) => ({
    ...eq.toObject(),
    isOverdue: eq.nextMaintenanceDate < now,
  }));
}

export async function createRecord({ equipment: equipmentId, date, type, cost, description, nextDueDate }, userId) {
  const session = await mongoose.startSession();
  let result;
  let statusChanged = false;

  await session.withTransaction(async () => {
    const equipment = await Equipment.findById(equipmentId).session(session);
    if (!equipment) throw new AppError('Không tìm thấy thiết bị', 404);

    const [record] = await MaintenanceRecord.create(
      [
        {
          equipment: equipmentId,
          date: date || Date.now(),
          type,
          cost,
          description,
          performedBy: userId,
          nextDueDate: nextDueDate || null,
        },
      ],
      { session }
    );

    equipment.lastMaintenanceDate = record.date;
    equipment.nextMaintenanceDate = nextDueDate || null;
    if (equipment.status === 'maintenance' && type === 'repair') {
      applyStatusTransition(equipment, 'active');
      statusChanged = true;
    }
    await equipment.save({ session });

    result = { record, equipment };
  });

  session.endSession();

  getIO()?.emit('maintenance:created', { equipmentId });
  if (statusChanged) {
    getIO()?.emit('equipment:updated', { equipmentId });
  }

  return result;
}
