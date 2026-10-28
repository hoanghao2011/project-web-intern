import Equipment from '../models/Equipment.js';
import { AppError } from '../utils/AppError.js';
import { applyStatusTransition } from './equipmentStateMachine.js';
import { getIO } from '../socket/index.js';

export async function listEquipment(query) {
  const { category, status, site, search, page = 1, limit = 20 } = query;

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (site) filter.currentSite = site;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const [items, total] = await Promise.all([
    Equipment.find(filter)
      .populate('category', 'name')
      .populate('currentSite', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Equipment.countDocuments(filter),
  ]);

  return { items, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
}

export async function getById(id) {
  const equipment = await Equipment.findById(id)
    .populate('category', 'name')
    .populate('currentSite', 'name');
  if (!equipment) throw new AppError('Không tìm thấy thiết bị', 404);
  return equipment;
}

export async function getByCode(code) {
  const equipment = await Equipment.findOne({ code })
    .populate('category', 'name')
    .populate('currentSite', 'name');
  if (!equipment) throw new AppError('Không tìm thấy thiết bị với mã này', 404);
  return equipment;
}

export async function create(data, files) {
  const payload = { ...data };
  if (!payload.code) {
    payload.code = Equipment.generateCode();
  }
  if (files?.length) {
    payload.images = files.map((f) => `/uploads/${f.filename}`);
  }
  return Equipment.create(payload);
}

export async function update(id, data, files) {
  const payload = { ...data };
  if (files?.length) {
    payload.images = files.map((f) => `/uploads/${f.filename}`);
  }

  const equipment = await Equipment.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!equipment) throw new AppError('Không tìm thấy thiết bị', 404);
  return equipment;
}

export async function remove(id) {
  const equipment = await Equipment.findByIdAndDelete(id);
  if (!equipment) throw new AppError('Không tìm thấy thiết bị', 404);
}

export async function changeStatus(id, newStatus) {
  const equipment = await Equipment.findById(id);
  if (!equipment) throw new AppError('Không tìm thấy thiết bị', 404);

  applyStatusTransition(equipment, newStatus);
  await equipment.save();

  getIO()?.emit('equipment:updated', { equipmentId: equipment._id.toString() });

  return equipment;
}
