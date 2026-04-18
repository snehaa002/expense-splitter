import { connectDB } from '@/lib/db';
import Group from '@/lib/models/Group';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const groups = await Group.find();
    return NextResponse.json({ success: true, data: groups });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error fetching groups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, description, members } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Group name is required' }, { status: 400 });
    }

    const group = new Group({
      name,
      description,
      members: members || [],
    });

    await group.save();
    return NextResponse.json({ success: true, data: group }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error creating group' }, { status: 500 });
  }
}
