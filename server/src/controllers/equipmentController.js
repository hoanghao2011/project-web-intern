import { asyncHandler } from '../utils/asyncHandler.js';
import * as equipmentService from '../services/equipmentService.js';

export const getEquipmentList = asyncHandler(async (req, res) => {
  const result = await equipmentService.listEquipment(req.query);
  res.json(result);
});

export const getEquipmentById = asyncHandler(async (req, res) => {
  const equipment = await equipmentService.getById(req.params.id);
  res.json(equipment);
});

export const getEquipmentByCode = asyncHandler(async (req, res) => {
  const equipment = await equipmentService.getByCode(req.params.code);
  res.json(equipment);
});

export const createEquipment = asyncHandler(async (req, res) => {
  const equipment = await equipmentService.create(req.body, req.files);
  res.status(201).json(equipment);
});

export const updateEquipment = asyncHandler(async (req, res) => {
  const equipment = await equipmentService.update(req.params.id, req.body, req.files);
  res.json(equipment);
});

export const deleteEquipment = asyncHandler(async (req, res) => {
  await equipmentService.remove(req.params.id);
  res.json({ message: 'Đã xóa thiết bị' });
});

export const changeStatus = asyncHandler(async (req, res) => {
  const equipment = await equipmentService.changeStatus(req.params.id, req.body.status);
  res.json(equipment);
});
