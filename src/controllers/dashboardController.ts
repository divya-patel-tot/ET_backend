import { Response } from 'express';
import { Expense } from '../models/Expense';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Total spending this month
    const monthlyAgg = await Expense.aggregate([
      {
        $match: {
          userId: new (require('mongoose').Types.ObjectId)(req.userId),
          date: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalThisMonth = monthlyAgg[0]?.total ?? 0;

    // Spending by category this month
    const categoryAgg = await Expense.aggregate([
      {
        $match: {
          userId: new (require('mongoose').Types.ObjectId)(req.userId),
          date: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);
    const byCategory = categoryAgg.map((c) => ({ category: c._id as string, total: c.total as number }));

    // Monthly trend — last 6 months
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const trendAgg = await Expense.aggregate([
      {
        $match: {
          userId: new (require('mongoose').Types.ObjectId)(req.userId),
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const monthlyTrend = trendAgg.map((t) => ({
      month: `${t._id.year as number}-${String(t._id.month as number).padStart(2, '0')}`,
      total: t.total as number,
    }));

    // Recent 5 expenses
    const recentExpenses = await Expense.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      totalThisMonth,
      byCategory,
      monthlyTrend,
      recentExpenses,
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};
