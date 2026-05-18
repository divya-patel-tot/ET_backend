import { Router } from 'express';
import { extractExpense } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/extract', protect, extractExpense);

export default router;
