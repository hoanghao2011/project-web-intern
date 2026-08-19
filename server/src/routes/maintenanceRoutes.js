import { Router } from 'express';
import { body } from 'express-validator';
import {
  getMaintenanceRecords,
  getUpcoming,
  createMaintenanceRecord,
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/', getMaintenanceRecords);
router.get('/upcoming', getUpcoming);
router.post(
  '/',
  authorize('admin', 'manager', 'staff'),
  [
    body('equipment').notEmpty().withMessage('Thiết bị là bắt buộc'),
    body('type').isIn(['periodic', 'repair']).withMessage('Loại bảo trì không hợp lệ'),
  ],
  validate,
  createMaintenanceRecord
);

export default router;
