'use client';

import { Situation } from '@/lib/db';
import RatingWidget from './RatingWidget';

interface ResponseCardProps {
  situation: Situation;
  showRating?: boolean;
  onRatingSubmitted?: () => void;
}

// Helper function to highlight quoted text (Jesus's words)
function formatResponseWithQuotes(text: string): React.ReactNode[] {
  // Match text within quotation marks (double, single, and curly quotes)
  const quotePattern = /(?:^|\s)["“'']([^"”'']+)(?:["”''])/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = quotePattern.exec(text)) !== null) {
    // Add text before the quote
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++}>{text.slice(lastIndex, match.index)}</span>
      );
    }

    // Add the quoted text with special styling
    const quotedText = match[1] || match[2] || match[3] || match[4];
    parts.push(
      <span
        key={key++}
        className="text-burgundy-600 font-medium italic"
      >
        &lsquo;{quotedText}&rsquo;
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last quote
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
}

export default function ResponseCard({
  situation,
  showRating = true,
  onRatingSubmitted,
}: ResponseCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-600 to-burgundy-700 px-8 py-5">
        <h3 className="font-serif text-2xl text-white tracking-wide">Your Situation</h3>
      </div>

      {/* Situation text */}
      <div className="px-8 py-5 bg-cream-50 border-b border-gold-300/20">
        <p className="text-gray-700 italic text-lg leading-relaxed">&quot;{situation.situation}&quot;</p>
      </div>

      {/* Response */}
      <div className="px-8 py-8">
        <div className="flex items-center gap-3 mb-5">
          <svg
            className="w-7 h-7 text-gold-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <h4 className="font-serif text-2xl text-burgundy-700 tracking-wide">
            What Jesus Would Do
          </h4>
        </div>

        <div className="prose prose-burgundy max-w-none">
          <p className="mx-4 md:mx-10 text-gray-700 leading-loose whitespace-pre-wrap text-lg tracking-wide">
            {formatResponseWithQuotes(situation.response)}
          </p>
        </div>
      </div>

      {/* Scripture References */}
      {situation.verses && situation.verses.length > 0 && (
        <div className="px-8 py-6 bg-cream-50 border-t border-gold-300/20">
          <h5 className="font-medium text-burgundy-700 mb-4 flex items-center gap-3 text-lg tracking-wide">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Scripture References
          </h5>
          <div className="space-y-3">
            {situation.verses.map((verse, index) => (
              <div
                key={index}
                className="px-5 py-4 bg-white rounded-lg border border-gold-300/30 text-gray-700 text-lg leading-relaxed tracking-wide"
              >
                {formatResponseWithQuotes(verse)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating Section */}
      {showRating && (
        <div className="px-6 py-4 border-t border-gold-300/20">
          <RatingWidget
            situationId={situation.id}
            onRatingSubmitted={onRatingSubmitted}
          />
        </div>
      )}

      {/* Rating display for list items */}
      {!showRating && situation.rating_count !== undefined && situation.rating_count > 0 && (
        <div className="px-6 py-3 border-t border-gold-300/20 bg-cream-50 flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(situation.average_rating || 0)
                    ? 'text-gold-500'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({situation.rating_count} {situation.rating_count === 1 ? 'rating' : 'ratings'})
          </span>
        </div>
      )}
    </div>
  );
}
