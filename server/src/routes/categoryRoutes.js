import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/', getCategories);
router.post(
  '/',
  authorize('admin', 'manager'),
  [body('name').trim().notEmpty().withMessage('Tên danh mục là bắt buộc')],
  validate,
  createCategory
);
router.put('/:id', authorize('admin', 'manager'), updateCategory);
router.delete('/:id', authorize('admin', 'manager'), deleteCategory);

export default router;
