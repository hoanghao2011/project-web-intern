import { Router } from 'express';
import { body } from 'express-validator';
import {
  getEquipmentList,
  getEquipmentById,
  getEquipmentByCode,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  changeStatus,
} from '../controllers/equipmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../config/multer.js';

const router = Router();

router.use(protect);

router.get('/', getEquipmentList);
router.get('/code/:code', getEquipmentByCode);
router.get('/:id', getEquipmentById);

router.post(
  '/',
  authorize('admin', 'manager'),
  upload.array('images', 5),
  [
    body('name').trim().notEmpty().withMessage('Tên thiết bị là bắt buộc'),
    body('category').notEmpty().withMessage('Danh mục là bắt buộc'),
  ],
  validate,
  createEquipment
);

router.put('/:id', authorize('admin', 'manager'), upload.array('images', 5), updateEquipment);
router.patch(
  '/:id/status',
  authorize('admin', 'manager', 'staff'),
  [body('status').notEmpty().withMessage('Trạng thái là bắt buộc')],
  validate,
  changeStatus
);
router.delete('/:id', authorize('admin'), deleteEquipment);

export default router;
