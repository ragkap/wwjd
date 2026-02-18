'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Situation } from '@/lib/db';

interface RelatedGuidanceProps {
  currentSituation: string;
  currentId?: number | null;
}

export default function RelatedGuidance({ currentSituation, currentId }: RelatedGuidanceProps) {
  const [related, setRelated] = useState<Situation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        // Extract key words for search
        const words = currentSituation
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 3)
          .slice(0, 3); // Take first 3 meaningful words

        if (words.length === 0) {
          setLoading(false);
          return;
        }

        // Search using the first meaningful word
        const response = await fetch(`/api/situations?q=${encodeURIComponent(words[0])}&pageSize=10`);
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        const situations: Situation[] = data.situations || [];

        // Filter out the current situation and limit to 3
        const filtered = situations
          .filter(s => s.id !== currentId)
          .slice(0, 3);

        setRelated(filtered);
      } catch (error) {
        console.error('Error fetching related guidance:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [currentSituation, currentId]);

  if (loading || related.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 overflow-hidden">
      <div className="px-8 py-5 border-b border-gold-300/20">
        <h3 className="font-serif text-xl text-burgundy-700 tracking-wide flex items-center gap-3">
          <svg
            className="w-6 h-6 text-gold-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Others Have Asked
        </h3>
        <p className="text-gray-600 text-sm mt-1">
          You&apos;re not alone in your journey. See how others have sought guidance.
        </p>
      </div>

      <div className="divide-y divide-gold-300/20">
        {related.map((situation) => (
          <Link
            key={situation.id}
            href={`/situation/${situation.id}`}
            className="block px-8 py-5 hover:bg-cream-50 transition-colors"
          >
            <p className="text-gray-700 font-medium mb-2 line-clamp-2">
              &quot;{situation.situation}&quot;
            </p>
            <p className="text-gray-500 text-sm line-clamp-2">
              {situation.response.slice(0, 120)}...
            </p>
            {situation.rating_count !== undefined && situation.rating_count > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-3 h-3 ${
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
                <span className="text-xs text-gray-500">
                  ({situation.rating_count})
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
