import { NextRequest, NextResponse } from 'next/server';
import { createSituation, getAllSituations, searchSituations } from '@/lib/db';
import { getWWJDResponse } from '@/lib/claude';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    const situations = query
      ? await searchSituations(query)
      : await getAllSituations();

    return NextResponse.json(situations);
  } catch (error) {
    console.error('Error fetching situations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch situations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { situation } = body;

    if (!situation || typeof situation !== 'string') {
      return NextResponse.json(
        { error: 'Situation is required' },
        { status: 400 }
      );
    }

    if (situation.length > 400) {
      return NextResponse.json(
        { error: 'Situation must be less than 400 characters' },
        { status: 400 }
      );
    }

    // Get WWJD response from Claude
    const wwjdResponse = await getWWJDResponse(situation);

    // Save to database
    const savedSituation = await createSituation(
      situation,
      wwjdResponse.response,
      wwjdResponse.verses
    );

    return NextResponse.json(savedSituation, { status: 201 });
  } catch (error) {
    console.error('Error creating situation:', error);
    return NextResponse.json(
      { error: 'Failed to process situation' },
      { status: 500 }
    );
  }
}
