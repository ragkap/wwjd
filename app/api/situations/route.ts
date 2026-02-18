import { NextRequest, NextResponse } from 'next/server';
import { createSituation, getAllSituations, searchSituations, findSimilarSituation, getPaginatedSituations, SortOption } from '@/lib/db';
import { getWWJDResponse } from '@/lib/claude';
import { moderateContent } from '@/lib/moderation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sort = (searchParams.get('sort') || 'recent') as SortOption;

    // Validate sort option
    const validSorts: SortOption[] = ['recent', 'top_rated', 'most_rated'];
    const validatedSort = validSorts.includes(sort) ? sort : 'recent';

    // Use paginated function
    const result = await getPaginatedSituations(page, pageSize, validatedSort, query);

    return NextResponse.json(result);
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

    // Check content moderation using OpenAI Moderation API
    const moderationResult = await moderateContent(situation);
    if (!moderationResult.allowed) {
      // Return compassionate guidance without saving to database
      return NextResponse.json({
        id: null,
        situation: situation,
        response: moderationResult.guidance,
        verses: [],
        created_at: new Date().toISOString(),
        moderated: true,
        category: moderationResult.category,
      });
    }

    // Check for similar existing questions before generating a new response
    const similarSituation = await findSimilarSituation(situation);
    if (similarSituation) {
      // Return the existing response with a note that it's from a similar question
      return NextResponse.json({
        ...similarSituation,
        matchedFrom: {
          id: similarSituation.id,
          originalQuestion: similarSituation.situation,
        },
      });
    }

    // Get WWJD response from OpenAI
    const wwjdResponse = await getWWJDResponse(situation);

    // Save to database
    const savedSituation = await createSituation(
      situation,
      wwjdResponse.response,
      wwjdResponse.verses,
      wwjdResponse.tags
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
