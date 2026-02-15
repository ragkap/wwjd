'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Situation } from '@/lib/db';
import SearchBar from './SearchBar';

// Helper function to format relative time
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;

  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

interface SituationListProps {
  refreshTrigger?: number;
}

export default function SituationList({ refreshTrigger }: SituationListProps) {
  const [situations, setSituations] = useState<Situation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchSituations = useCallback(async (query?: string) => {
    try {
      setIsSearching(true);
      const url = query
        ? `/api/situations?q=${encodeURIComponent(query)}`
        : '/api/situations';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch situations');
      }
      const data = await response.json();
      setSituations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    fetchSituations();
  }, [refreshTrigger, fetchSituations]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      fetchSituations(query);
    },
    [fetchSituations]
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <svg
          className="animate-spin h-8 w-8 text-burgundy-600 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="mt-4 text-gray-600 text-lg">Loading previous guidance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={() => fetchSituations()}
          className="mt-4 text-burgundy-600 hover:text-burgundy-700 underline text-lg"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl text-burgundy-700 tracking-wide mb-3">
          Community Guidance
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          You are not alone. Browse guidance shared by others who have faced similar challenges.
        </p>
        <SearchBar onSearch={handleSearch} />
      </div>

      {isSearching && (
        <div className="text-center py-4">
          <svg
            className="animate-spin h-6 w-6 text-burgundy-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}

      {!isSearching && situations.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gold-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          {searchQuery ? (
            <>
              <p className="text-gray-600 text-lg">
                No guidance found for &quot;{searchQuery}&quot;
              </p>
              <p className="text-gray-500 mt-2">
                Try different keywords or browse all guidance.
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-lg">No guidance has been shared yet.</p>
              <p className="text-gray-500 mt-2">
                Be the first to ask what Jesus would do!
              </p>
            </>
          )}
        </div>
      )}

      {!isSearching && situations.length > 0 && (
        <div className="space-y-4">
          {searchQuery && (
            <p className="text-gray-600 text-lg">
              Found {situations.length} {situations.length === 1 ? 'result' : 'results'} for &quot;{searchQuery}&quot;
            </p>
          )}
          {situations.map((situation) => (
            <Link
              key={situation.id}
              href={`/situation/${situation.id}`}
              className="block bg-white rounded-xl shadow border border-gold-300/20 p-6 hover:shadow-md hover:border-gold-400/40 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400 tracking-wide">
                  {formatTimeAgo(situation.created_at)}
                </span>
              </div>
              <p className="text-gray-700 line-clamp-2 text-lg leading-relaxed">
                &quot;{situation.situation}&quot;
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
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
                  {situation.rating_count !== undefined && situation.rating_count > 0 && (
                    <span className="text-sm text-gray-500 ml-1">
                      ({situation.rating_count})
                    </span>
                  )}
                </div>
                <span className="text-base text-burgundy-600 flex items-center gap-2 font-medium">
                  Read guidance
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
