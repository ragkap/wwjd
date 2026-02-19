import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { followTopic, unfollowTopic, getFollowedTopics } from '@/lib/user-db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const topics = await getFollowedTopics(session.user.id);
    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Error in topics GET:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic } = await request.json();
    if (!topic) {
      return NextResponse.json({ error: 'topic required' }, { status: 400 });
    }

    const success = await followTopic(session.user.id, topic);
    if (!success) {
      return NextResponse.json({ error: 'Failed to follow topic' }, { status: 500 });
    }

    return NextResponse.json({ following: true });
  } catch (error) {
    console.error('Error in topics POST:', error);
    return NextResponse.json({ error: 'Failed to follow topic' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic } = await request.json();
    if (!topic) {
      return NextResponse.json({ error: 'topic required' }, { status: 400 });
    }

    const success = await unfollowTopic(session.user.id, topic);
    if (!success) {
      return NextResponse.json({ error: 'Failed to unfollow topic' }, { status: 500 });
    }

    return NextResponse.json({ following: false });
  } catch (error) {
    console.error('Error in topics DELETE:', error);
    return NextResponse.json({ error: 'Failed to unfollow topic' }, { status: 500 });
  }
}
