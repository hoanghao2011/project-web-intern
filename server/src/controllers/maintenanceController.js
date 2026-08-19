import MaintenanceRecord from '../models/MaintenanceRecord.js';
import Equipment from '../models/Equipment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMaintenanceRecords = asyncHandler(async (req, res) => {
  const { equipment } = req.query;
  const filter = {};
  if (equipment) filter.equipment = equipment;

  const records = await MaintenanceRecord.find(filter)
    .populate('equipment', 'name code')
    .populate('performedBy', 'name')
    .sort({ date: -1 });

  res.json(records);
});

// Danh sách thiết bị sắp/đã quá hạn bảo trì, sort theo hạn gần nhất
export const getUpcoming = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
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
  const result = equipment.map((eq) => ({
    ...eq.toObject(),
    isOverdue: eq.nextMaintenanceDate < now,
  }));

  res.json(result);
});

export const createMaintenanceRecord = asyncHandler(async (req, res) => {
  const { equipment: equipmentId, date, type, cost, description, nextDueDate } = req.body;

  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });

  const record = await MaintenanceRecord.create({
    equipment: equipmentId,
    date: date || Date.now(),
    type,
    cost,
    description,
    performedBy: req.user._id,
    nextDueDate: nextDueDate || null,
  });

  equipment.lastMaintenanceDate = record.date;
  equipment.nextMaintenanceDate = nextDueDate || null;
  if (equipment.status === 'maintenance' && type === 'repair') {
    equipment.status = 'active';
  }
  await equipment.save();

  res.status(201).json({ record, equipment });
});
