import Equipment, { STATUS_TRANSITIONS } from '../models/Equipment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getEquipmentList = asyncHandler(async (req, res) => {
  const { category, status, site, search, page = 1, limit = 20 } = req.query;

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

  res.json({
    items,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

export const getEquipmentById = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findById(req.params.id)
    .populate('category', 'name')
    .populate('currentSite', 'name');
  if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
  res.json(equipment);
});

export const getEquipmentByCode = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findOne({ code: req.params.code })
    .populate('category', 'name')
    .populate('currentSite', 'name');
  if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị với mã này' });
  res.json(equipment);
});

export const createEquipment = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (!data.code) {
    data.code = Equipment.generateCode();
  }
  if (req.files?.length) {
    data.images = req.files.map((f) => `/uploads/${f.filename}`);
  }

  const equipment = await Equipment.create(data);
  res.status(201).json(equipment);
});

export const updateEquipment = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.files?.length) {
    data.images = req.files.map((f) => `/uploads/${f.filename}`);
  }

  const equipment = await Equipment.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
  res.json(equipment);
});

export const deleteEquipment = asyncHandler(async (req, res) => {
  const equipment = await Equipment.findByIdAndDelete(req.params.id);
  if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
  res.json({ message: 'Đã xóa thiết bị' });
});

export const changeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });

  const allowed = STATUS_TRANSITIONS[equipment.status] || [];
  if (!allowed.includes(status)) {
    return res.status(400).json({
      message: `Không thể chuyển trạng thái từ "${equipment.status}" sang "${status}"`,
      allowedNext: allowed,
    });
  }

  equipment.status = status;
  await equipment.save();
  res.json(equipment);
});
