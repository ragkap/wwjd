import { ImageResponse } from 'next/og';
import { getSituationById } from '@/lib/db';

export const runtime = 'edge';

export const alt = 'WWJD Guidance';
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const situationId = parseInt(id, 10);

  let situationText = 'Biblical guidance for your situation';

  if (!isNaN(situationId)) {
    try {
      const situation = await getSituationById(situationId);
      if (situation) {
        situationText = situation.situation.length > 100
          ? situation.situation.slice(0, 100) + '...'
          : situation.situation;
      }
    } catch (e) {
      // Use default text
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #722F37 0%, #5C262D 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '50px',
        }}
      >
        {/* Cross Icon */}
        <svg
          width="50"
          height="50"
          viewBox="0 0 24 24"
          fill="#D4A574"
          style={{ marginBottom: '20px' }}
        >
          <path d="M11 2v7H4v4h7v9h2v-9h7V9h-7V2z" />
        </svg>

        {/* WWJD Label */}
        <div
          style={{
            fontSize: '24px',
            color: '#D4A574',
            textAlign: 'center',
            marginBottom: '16px',
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: '0.1em',
          }}
        >
          WHAT WOULD JESUS DO?
        </div>

        {/* Situation Text */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.3,
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
          }}
        >
          &ldquo;{situationText}&rdquo;
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
