import { Router } from 'express';
import { body } from 'express-validator';
import {
  getSites,
  getSite,
  createSite,
  updateSite,
  deleteSite,
} from '../controllers/siteController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/', getSites);
router.get('/:id', getSite);
router.post(
  '/',
  authorize('admin', 'manager'),
  [body('name').trim().notEmpty().withMessage('Tên công trình là bắt buộc')],
  validate,
  createSite
);
router.put('/:id', authorize('admin', 'manager'), updateSite);
router.delete('/:id', authorize('admin', 'manager'), deleteSite);

export default router;
