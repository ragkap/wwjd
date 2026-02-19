import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Save a guidance to user's collection
export async function saveGuidance(userId: number, situationId: number): Promise<boolean> {
  try {
    await sql`
      INSERT INTO saved_guidance (user_id, situation_id)
      VALUES (${userId}, ${situationId})
      ON CONFLICT (user_id, situation_id) DO NOTHING
    `;
    return true;
  } catch (error) {
    console.error('Error saving guidance:', error);
    return false;
  }
}

// Remove a saved guidance
export async function unsaveGuidance(userId: number, situationId: number): Promise<boolean> {
  try {
    await sql`
      DELETE FROM saved_guidance
      WHERE user_id = ${userId} AND situation_id = ${situationId}
    `;
    return true;
  } catch (error) {
    console.error('Error unsaving guidance:', error);
    return false;
  }
}

// Get user's saved guidance
export async function getSavedGuidance(userId: number) {
  const rows = await sql`
    SELECT
      s.id, s.situation, s.response, s.verses, s.tags, s.created_at,
      COALESCE(AVG(r.stars), 0)::float as average_rating,
      COUNT(r.id)::int as rating_count,
      sg.created_at as saved_at
    FROM saved_guidance sg
    JOIN situations s ON sg.situation_id = s.id
    LEFT JOIN ratings r ON s.id = r.situation_id
    WHERE sg.user_id = ${userId}
    GROUP BY s.id, sg.created_at
    ORDER BY sg.created_at DESC
  `;

  return rows.map(row => ({
    ...row,
    verses: typeof row.verses === 'string' ? JSON.parse(row.verses) : (row.verses || []),
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
  }));
}

// Check if user has saved a specific guidance
export async function isGuidanceSaved(userId: number, situationId: number): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM saved_guidance
    WHERE user_id = ${userId} AND situation_id = ${situationId}
  `;
  return rows.length > 0;
}

// Follow a topic
export async function followTopic(userId: number, topic: string): Promise<boolean> {
  try {
    await sql`
      INSERT INTO followed_topics (user_id, topic)
      VALUES (${userId}, ${topic.toLowerCase()})
      ON CONFLICT (user_id, topic) DO NOTHING
    `;
    return true;
  } catch (error) {
    console.error('Error following topic:', error);
    return false;
  }
}

// Unfollow a topic
export async function unfollowTopic(userId: number, topic: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM followed_topics
      WHERE user_id = ${userId} AND topic = ${topic.toLowerCase()}
    `;
    return true;
  } catch (error) {
    console.error('Error unfollowing topic:', error);
    return false;
  }
}

// Get user's followed topics
export async function getFollowedTopics(userId: number): Promise<string[]> {
  const rows = await sql`
    SELECT topic FROM followed_topics
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return rows.map(r => r.topic);
}

// Create a prayer request
export async function createPrayerRequest(
  userId: number,
  situationId: number | null,
  request: string
): Promise<number | null> {
  try {
    const rows = await sql`
      INSERT INTO prayer_requests (user_id, situation_id, request)
      VALUES (${userId}, ${situationId}, ${request})
      RETURNING id
    `;
    return rows[0]?.id || null;
  } catch (error) {
    console.error('Error creating prayer request:', error);
    return null;
  }
}

// Get prayer requests (community view)
export async function getPrayerRequests(limit: number = 20) {
  const rows = await sql`
    SELECT
      pr.id,
      pr.request,
      pr.created_at,
      pr.prayer_count,
      s.situation,
      s.id as situation_id
    FROM prayer_requests pr
    LEFT JOIN situations s ON pr.situation_id = s.id
    WHERE pr.is_active = true
    ORDER BY pr.created_at DESC
    LIMIT ${limit}
  `;
  return rows;
}

// Increment prayer count
export async function prayForRequest(requestId: number): Promise<boolean> {
  try {
    await sql`
      UPDATE prayer_requests
      SET prayer_count = prayer_count + 1
      WHERE id = ${requestId}
    `;
    return true;
  } catch (error) {
    console.error('Error incrementing prayer count:', error);
    return false;
  }
}

// Get user settings
export async function getUserSettings(userId: number) {
  const rows = await sql`
    SELECT email_digest, digest_frequency, notify_ratings, notify_prayers
    FROM users
    WHERE id = ${userId}
  `;
  return rows[0] || null;
}

// Update user settings
export async function updateUserSettings(
  userId: number,
  settings: {
    email_digest?: boolean;
    digest_frequency?: string;
    notify_ratings?: boolean;
    notify_prayers?: boolean;
  }
): Promise<boolean> {
  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (settings.email_digest !== undefined) {
      updates.push('email_digest');
      values.push(settings.email_digest);
    }
    if (settings.digest_frequency !== undefined) {
      updates.push('digest_frequency');
      values.push(settings.digest_frequency);
    }
    if (settings.notify_ratings !== undefined) {
      updates.push('notify_ratings');
      values.push(settings.notify_ratings);
    }
    if (settings.notify_prayers !== undefined) {
      updates.push('notify_prayers');
      values.push(settings.notify_prayers);
    }

    if (updates.length === 0) return true;

    // Build dynamic update - simplified for common cases
    await sql`
      UPDATE users
      SET
        email_digest = COALESCE(${settings.email_digest}, email_digest),
        digest_frequency = COALESCE(${settings.digest_frequency}, digest_frequency),
        notify_ratings = COALESCE(${settings.notify_ratings}, notify_ratings),
        notify_prayers = COALESCE(${settings.notify_prayers}, notify_prayers)
      WHERE id = ${userId}
    `;
    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return false;
  }
}
