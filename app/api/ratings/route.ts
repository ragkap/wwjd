import { NextRequest, NextResponse } from 'next/server';
import { createRating, getSituationById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { situationId, stars, comment } = body;

    if (!situationId || typeof situationId !== 'number') {
      return NextResponse.json(
        { error: 'Valid situation ID is required' },
        { status: 400 }
      );
    }

    if (!stars || typeof stars !== 'number' || stars < 1 || stars > 5) {
      return NextResponse.json(
        { error: 'Stars must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    // Verify situation exists
    const situation = await getSituationById(situationId);
    if (!situation) {
      return NextResponse.json(
        { error: 'Situation not found' },
        { status: 404 }
      );
    }

    // Create rating
    const rating = await createRating(
      situationId,
      stars,
      comment && typeof comment === 'string' ? comment.slice(0, 500) : null
    );

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 }
    );
  }
}
