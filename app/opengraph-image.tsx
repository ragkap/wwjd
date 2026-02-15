import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'What Would Jesus Do? - Biblical Guidance for Life';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          padding: '60px',
        }}
      >
        {/* Cross Icon */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="#D4A574"
          style={{ marginBottom: '30px' }}
        >
          <path d="M11 2v7H4v4h7v9h2v-9h7V9h-7V2z" />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: '20px',
            fontFamily: 'Georgia, serif',
          }}
        >
          What Would Jesus Do?
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            color: '#D4A574',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Biblical Guidance for Life&apos;s Journey
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '24px',
            color: '#F5E6D3',
            textAlign: 'center',
            marginTop: '40px',
            maxWidth: '800px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Seek wisdom. Find peace. You are not alone.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
