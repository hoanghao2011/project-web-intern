import { Router } from 'express';
import {
  getSummary,
  getStatusDistribution,
  getCategoryDistribution,
  getSiteDistribution,
  getMonthlyTrend,
  getAverageAge,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/status-distribution', getStatusDistribution);
router.get('/category-distribution', getCategoryDistribution);
router.get('/site-distribution', getSiteDistribution);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/average-age', getAverageAge);

export default router;
