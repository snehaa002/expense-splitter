import { connectDB } from '@/lib/db';
import Group from '@/lib/models/Group';
import Expense from '@/lib/models/Expense';
import { calculateBalances, calculateSettlements } from '@/app/utils/calculations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const group = await Group.findById(id);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    const expenses = await Expense.find({ groupId: id });
    const balances = calculateBalances(expenses);
    const settlements = calculateSettlements(balances);

    return NextResponse.json({
      success: true,
      data: {
        group,
        expenses,
        balances,
        settlements,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error fetching group' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { name, description, members } = body;

    const group = await Group.findByIdAndUpdate(
      id,
      { name, description, members },
      { new: true }
    );

    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: group });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error updating group' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    await Group.findByIdAndDelete(id);
    await Expense.deleteMany({ groupId: id });

    return NextResponse.json({ success: true, message: 'Group deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error deleting group' }, { status: 500 });
  }
}
