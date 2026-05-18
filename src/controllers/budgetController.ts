import { Response } from 'express';
import { Budget } from '../models/Budget';
import { AuthRequest } from '../middleware/authMiddleware';

export const getBudgets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month } = req.query as { month?: string };
    const filter: Record<string, unknown> = { userId: req.userId };
    if (month) filter.month = month;

    const budgets = await Budget.find(filter);
    res.status(200).json({ budgets });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export const createBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, limit, month } = req.body as {
      category: string;
      limit: number;
      month: string;
    };

    if (!category || !limit || !month) {
      res.status(400).json({ message: 'category, limit and month are required' });
      return;
    }

    const existing = await Budget.findOne({
      userId: req.userId,
      category,
      month,
    });

    if (existing) {
      res.status(400).json({ message: 'Budget for this category and month already exists. Please update it.' });
      return;
    }

    const budget = await Budget.create({
      userId: req.userId,
      category,
      limit,
      month,
    });

    res.status(201).json({ budget });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(400).json({ message: error.message });
  }
};

export const updateBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const budget = await Budget.findOne({ _id: id, userId: req.userId });
    if (!budget) {
      res.status(404).json({ message: 'Budget not found' });
      return;
    }

    const { limit } = req.body as { limit?: number };
    if (limit !== undefined) budget.limit = limit;
    await budget.save();

    res.status(200).json({ budget });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(400).json({ message: error.message });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const budget = await Budget.findOneAndDelete({ _id: id, userId: req.userId });
    if (!budget) {
      res.status(404).json({ message: 'Budget not found' });
      return;
    }
    res.status(200).json({ message: 'Budget deleted' });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};
