import { Response } from 'express';
import { Expense } from '../models/Expense';
import { AuthRequest } from '../middleware/authMiddleware';

const PAGE_SIZE = 10;

export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, month, page = '1' } = req.query as {
      category?: string;
      month?: string;
      page?: string;
    };

    const filter: Record<string, unknown> = { userId: req.userId };

    if (category) filter.category = category;
    if (month) {
      const [year, mon] = month.split('-').map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const skip = (pageNum - 1) * PAGE_SIZE;

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(PAGE_SIZE),
      Expense.countDocuments(filter),
    ]);

    res.status(200).json({
      expenses,
      pagination: {
        page: pageNum,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, category, date, note } = req.body as {
      amount: number;
      category: string;
      date: string;
      note?: string;
    };

    if (!amount || !category || !date) {
      res.status(400).json({ message: 'amount, category and date are required' });
      return;
    }

    const expense = await Expense.create({
      userId: req.userId,
      amount,
      category,
      date: new Date(date),
      note,
    });

    res.status(201).json({ expense });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(400).json({ message: error.message });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOne({ _id: id, userId: req.userId });
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    const { amount, category, date, note } = req.body as {
      amount?: number;
      category?: string;
      date?: string;
      note?: string;
    };

    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category as typeof expense.category;
    if (date !== undefined) expense.date = new Date(date);
    if (note !== undefined) expense.note = note;

    await expense.save();
    res.status(200).json({ expense });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(400).json({ message: error.message });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.userId });
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export const exportExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month } = req.query as { month?: string };
    const filter: Record<string, unknown> = { userId: req.userId };

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    const header = 'Date,Amount,Category,Note\n';
    const rows = expenses
      .map((e) => {
        const d = new Date(e.date).toISOString().split('T')[0];
        const note = (e.note || '').replace(/,/g, ' ');
        return `${d},${e.amount},${e.category},${note}`;
      })
      .join('\n');

    const csv = header + rows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="expenses_${month || 'all'}.csv"`
    );
    res.status(200).send(csv);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};
