import { NextRequest, NextResponse } from 'next/server';
import { getSituationById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const situationId = parseInt(id, 10);

    if (isNaN(situationId)) {
      return NextResponse.json(
        { error: 'Invalid situation ID' },
        { status: 400 }
      );
    }

    const situation = await getSituationById(situationId);

    if (!situation) {
      return NextResponse.json(
        { error: 'Situation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(situation);
  } catch (error) {
    console.error('Error fetching situation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch situation' },
      { status: 500 }
    );
  }
}
