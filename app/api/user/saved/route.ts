import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveGuidance, unsaveGuidance, getSavedGuidance, isGuidanceSaved } from '@/lib/user-db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const situationId = searchParams.get('situationId');

    // If situationId provided, check if saved
    if (situationId) {
      const saved = await isGuidanceSaved(session.user.id, parseInt(situationId, 10));
      return NextResponse.json({ saved });
    }

    // Otherwise, get all saved guidance
    const savedGuidance = await getSavedGuidance(session.user.id);
    return NextResponse.json(savedGuidance);
  } catch (error) {
    console.error('Error in saved guidance GET:', error);
    return NextResponse.json({ error: 'Failed to fetch saved guidance' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { situationId } = await request.json();
    if (!situationId) {
      return NextResponse.json({ error: 'situationId required' }, { status: 400 });
    }

    const success = await saveGuidance(session.user.id, situationId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to save guidance' }, { status: 500 });
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('Error in saved guidance POST:', error);
    return NextResponse.json({ error: 'Failed to save guidance' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { situationId } = await request.json();
    if (!situationId) {
      return NextResponse.json({ error: 'situationId required' }, { status: 400 });
    }

    const success = await unsaveGuidance(session.user.id, situationId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to unsave guidance' }, { status: 500 });
    }

    return NextResponse.json({ saved: false });
  } catch (error) {
    console.error('Error in saved guidance DELETE:', error);
    return NextResponse.json({ error: 'Failed to unsave guidance' }, { status: 500 });
  }
}
