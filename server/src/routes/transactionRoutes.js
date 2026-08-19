import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTransactions,
  stockIn,
  stockOut,
  transfer,
} from '../controllers/transactionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

const quantityValidation = [
  body('equipment').notEmpty().withMessage('Thiết bị là bắt buộc'),
  body('quantity').isInt({ min: 1 }).withMessage('Số lượng phải lớn hơn 0'),
];

router.get('/', getTransactions);
router.post('/stock-in', authorize('admin', 'manager', 'staff'), quantityValidation, validate, stockIn);
router.post('/stock-out', authorize('admin', 'manager', 'staff'), quantityValidation, validate, stockOut);
router.post(
  '/transfer',
  authorize('admin', 'manager', 'staff'),
  [body('equipment').notEmpty(), body('toSite').notEmpty().withMessage('Công trình đích là bắt buộc')],
  validate,
  transfer
);

export default router;
