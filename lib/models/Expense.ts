import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  groupId: string;
  description: string;
  category: string;
  amount: number;
  paidBy: string;
  splitAmong: { member: string; amount: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema(
  {
    groupId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['food', 'travel', 'accommodation', 'entertainment', 'utilities', 'other'],
      default: 'other',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidBy: {
      type: String,
      required: true,
    },
    splitAmong: [
      {
        member: String,
        amount: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
