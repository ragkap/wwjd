import { NextRequest, NextResponse } from 'next/server';
import { prayForRequest } from '@/lib/user-db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = parseInt(id, 10);

    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    const success = await prayForRequest(requestId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to record prayer' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in pray POST:', error);
    return NextResponse.json({ error: 'Failed to record prayer' }, { status: 500 });
  }
}
