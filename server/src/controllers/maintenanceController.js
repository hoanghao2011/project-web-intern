import { asyncHandler } from '../utils/asyncHandler.js';
import * as maintenanceService from '../services/maintenanceService.js';

export const getMaintenanceRecords = asyncHandler(async (req, res) => {
  const records = await maintenanceService.listRecords(req.query);
  res.json(records);
});

export const getUpcoming = asyncHandler(async (req, res) => {
  const result = await maintenanceService.getUpcoming(req.query.days);
  res.json(result);
});

export const createMaintenanceRecord = asyncHandler(async (req, res) => {
  const result = await maintenanceService.createRecord(req.body, req.user._id);
  res.status(201).json(result);
});
