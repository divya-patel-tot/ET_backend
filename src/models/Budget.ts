import mongoose, { Document, Schema, Types } from 'mongoose';
import type { ExpenseCategory } from './Expense';
import { EXPENSE_CATEGORIES } from './Expense';

export interface IBudget extends Document {
  userId: Types.ObjectId;
  category: ExpenseCategory;
  limit: number;
  month: string; // Format: "YYYY-MM"
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: EXPENSE_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    limit: {
      type: Number,
      required: [true, 'Limit is required'],
      min: [1, 'Limit must be at least 1'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
  },
  { timestamps: true }
);

// Enforce one budget per user per category per month
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);
