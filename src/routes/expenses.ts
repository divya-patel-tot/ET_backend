import { Router } from 'express';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  exportExpenses,
} from '../controllers/expenseController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/export', exportExpenses);
router.get('/', getExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
