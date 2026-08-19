import TransactionLog from '../models/TransactionLog.js';
import Equipment from '../models/Equipment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getTransactions = asyncHandler(async (req, res) => {
  const { equipment, type, site } = req.query;
  const filter = {};
  if (equipment) filter.equipment = equipment;
  if (type) filter.type = type;
  if (site) filter.$or = [{ fromSite: site }, { toSite: site }];

  const logs = await TransactionLog.find(filter)
    .populate('equipment', 'name code')
    .populate('fromSite', 'name')
    .populate('toSite', 'name')
    .populate('performedBy', 'name')
    .sort({ date: -1 })
    .limit(200);

  res.json(logs);
});

// Nhập kho: tăng số lượng thiết bị, đưa về trạng thái in_stock nếu đang ở kho
export const stockIn = asyncHandler(async (req, res) => {
  const { equipment: equipmentId, quantity, toSite, note, attachment } = req.body;

  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });

  equipment.quantity += Number(quantity);
  if (toSite) equipment.currentSite = toSite;
  await equipment.save();

  const log = await TransactionLog.create({
    equipment: equipmentId,
    type: 'in',
    quantity,
    toSite: toSite || null,
    performedBy: req.user._id,
    note,
    attachment,
  });

  res.status(201).json({ log, equipment });
});

// Xuất kho / cấp phát cho công trình: trừ số lượng, gán site
export const stockOut = asyncHandler(async (req, res) => {
  const { equipment: equipmentId, quantity, toSite, assignedTo, note, attachment } = req.body;

  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });

  if (equipment.quantity < Number(quantity)) {
    return res.status(400).json({ message: 'Số lượng xuất vượt quá tồn kho hiện có' });
  }

  const fromSite = equipment.currentSite;
  equipment.quantity -= Number(quantity);
  if (toSite) equipment.currentSite = toSite;
  if (assignedTo) equipment.assignedTo = assignedTo;
  if (equipment.status === 'in_stock') equipment.status = 'active';
  await equipment.save();

  const log = await TransactionLog.create({
    equipment: equipmentId,
    type: 'out',
    quantity,
    fromSite: fromSite || null,
    toSite: toSite || null,
    performedBy: req.user._id,
    note,
    attachment,
  });

  res.status(201).json({ log, equipment });
});

// Điều chuyển giữa các công trình
export const transfer = asyncHandler(async (req, res) => {
  const { equipment: equipmentId, toSite, note } = req.body;

  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });

  const fromSite = equipment.currentSite;
  equipment.currentSite = toSite;
  await equipment.save();

  const log = await TransactionLog.create({
    equipment: equipmentId,
    type: 'transfer',
    quantity: equipment.quantity,
    fromSite: fromSite || null,
    toSite,
    performedBy: req.user._id,
    note,
  });

  res.status(201).json({ log, equipment });
});
