import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createPrayerRequest, getPrayerRequests } from '@/lib/user-db';

export async function GET() {
  try {
    const requests = await getPrayerRequests();
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error in prayer requests GET:', error);
    return NextResponse.json({ error: 'Failed to fetch prayer requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { request: prayerRequest, situationId } = await request.json();
    if (!prayerRequest) {
      return NextResponse.json({ error: 'request required' }, { status: 400 });
    }

    const id = await createPrayerRequest(session.user.id, situationId || null, prayerRequest);
    if (!id) {
      return NextResponse.json({ error: 'Failed to create prayer request' }, { status: 500 });
    }

    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('Error in prayer requests POST:', error);
    return NextResponse.json({ error: 'Failed to create prayer request' }, { status: 500 });
  }
}
