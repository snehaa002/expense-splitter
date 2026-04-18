import { connectDB } from '@/lib/db';
import Expense from '@/lib/models/Expense';
import { categorizeExpense, splitEqually, splitCustom } from '@/app/utils/calculations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json({ success: false, error: 'Group ID is required' }, { status: 400 });
    }

    const expenses = await Expense.find({ groupId });
    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error fetching expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      groupId,
      description,
      amount,
      paidBy,
      splitAmong,
      splitType = 'equal',
    } = body;

    if (!groupId || !description || !amount || !paidBy || !splitAmong) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Auto-categorize the expense
    const category = categorizeExpense(description);

    // Calculate splits
    let splits;
    if (splitType === 'equal') {
      if (!Array.isArray(splitAmong) || splitAmong.some(member => typeof member !== 'string')) {
        return NextResponse.json(
          { success: false, error: 'For equal split, splitAmong must be an array of member names' },
          { status: 400 }
        );
      }
      splits = splitEqually(amount, splitAmong);
    } else {
      if (
        !Array.isArray(splitAmong) ||
        splitAmong.some(
          split =>
            typeof split !== 'object' ||
            typeof split.member !== 'string' ||
            typeof split.amount !== 'number' ||
            split.amount < 0
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'For custom split, splitAmong must contain objects with member and amount',
          },
          { status: 400 }
        );
      }

      const customTotal = splitAmong.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(customTotal - amount) > 0.01) {
        return NextResponse.json(
          { success: false, error: 'Custom split total must match expense amount' },
          { status: 400 }
        );
      }

      splits = splitCustom(splitAmong);
    }

    const expense = new Expense({
      groupId,
      description,
      category,
      amount,
      paidBy,
      splitAmong: splits,
    });

    await expense.save();
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error creating expense' }, { status: 500 });
  }
}
