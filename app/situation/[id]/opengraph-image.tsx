import { ImageResponse } from 'next/og';
import { getSituationById } from '@/lib/db';

export const runtime = 'edge';

export const alt = 'WWJD Guidance';
export const size = {
  width: 1200,
  height: 630,
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
        situationText = situation.situation.length > 120
          ? situation.situation.slice(0, 120) + '...'
          : situation.situation;
      }
    } catch (e) {
      // Fallback to default text if DB fetch fails
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #722F37 0%, #5C262D 100%)',
          width: '100%',
          height: '100%',
          display: 'flex', // Required
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Cross Icon Container */}
        <div style={{ display: 'flex', marginBottom: '24px' }}>
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="#D4A574"
          >
            <path d="M11 2v7H4v4h7v9h2v-9h7V9h-7V2z" />
          </svg>
        </div>

        {/* WWJD Label */}
        <div
          style={{
            display: 'flex', // Required
            fontSize: '28px',
            color: '#D4A574',
            textAlign: 'center',
            marginBottom: '20px',
            fontFamily: 'sans-serif',
            letterSpacing: '0.1em',
          }}
        >
          WHAT WOULD JESUS DO?
        </div>

        {/* Situation Text */}
        <div
          style={{
            display: 'flex', // Required
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            maxWidth: '1000px',
            lineHeight: 1.3,
            fontFamily: 'serif',
            fontStyle: 'italic',
          }}
        >
          {`“${situationText}”`}
        </div>

        {/* Footer Container */}
        <div
          style={{
            display: 'flex', // Required
            position: 'absolute',
            bottom: '40px',
            fontSize: '22px',
            color: '#F5E6D3',
            fontFamily: 'sans-serif',
          }}
        >
          Seek guidance at wwjd.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}


// import { ImageResponse } from 'next/og';
// import { getSituationById } from '@/lib/db';

// export const runtime = 'edge';

// export const alt = 'WWJD Guidance';
// export const size = {
//   width: 1200,
//   height: 630,
// };
// export const contentType = 'image/png';

// export default async function Image({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   const situationId = parseInt(id, 10);

//   let situationText = 'Biblical guidance for your situation';

//   if (!isNaN(situationId)) {
//     try {
//       const situation = await getSituationById(situationId);
//       if (situation) {
//         situationText = situation.situation.length > 120
//           ? situation.situation.slice(0, 120) + '...'
//           : situation.situation;
//       }
//     } catch (e) {
//       // Use default text
//     }
//   }

//   return new ImageResponse(
//     (
//       <div
//         style={{
//           background: 'linear-gradient(135deg, #722F37 0%, #5C262D 100%)',
//           width: '100%',
//           height: '100%',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '60px',
//         }}
//       >
//         {/* Cross Icon */}
//         <svg
//           width="60"
//           height="60"
//           viewBox="0 0 24 24"
//           fill="#D4A574"
//           style={{ marginBottom: '24px' }}
//         >
//           <path d="M11 2v7H4v4h7v9h2v-9h7V9h-7V2z" />
//         </svg>

//         {/* WWJD Label */}
//         <div
//           style={{
//             fontSize: '28px',
//             color: '#D4A574',
//             textAlign: 'center',
//             marginBottom: '20px',
//             fontFamily: 'system-ui, sans-serif',
//             letterSpacing: '0.1em',
//           }}
//         >
//           WHAT WOULD JESUS DO?
//         </div>

//         {/* Situation Text */}
//         <div
//           style={{
//             fontSize: '42px',
//             fontWeight: 'bold',
//             color: '#FFFFFF',
//             textAlign: 'center',
//             maxWidth: '1000px',
//             lineHeight: 1.3,
//             fontFamily: 'Georgia, serif',
//             fontStyle: 'italic',
//           }}
//         >
//           &ldquo;{situationText}&rdquo;
//         </div>

//         {/* Footer */}
//         <div
//           style={{
//             position: 'absolute',
//             bottom: '40px',
//             fontSize: '20px',
//             color: '#F5E6D3',
//             fontFamily: 'system-ui, sans-serif',
//           }}
//         >
//           Seek guidance at wwjd.app
//         </div>
//       </div>
//     ),
//     {
//       ...size,
//     }
//   );
// }
