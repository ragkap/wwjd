'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { Situation, SortOption, PaginatedResult } from '@/lib/db';
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
  initialSearch?: string | null;
  onSearchChange?: () => void;
}

const PAGE_SIZE = 5;

export default function SituationList({ refreshTrigger, initialSearch, onSearchChange }: SituationListProps) {
  const { data: session } = useSession();
  const [situations, setSituations] = useState<Situation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [followedTopics, setFollowedTopics] = useState<Set<string>>(new Set());
  const [followingTopic, setFollowingTopic] = useState<string | null>(null);

  // Fetch followed topics for logged-in users
  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/topics')
        .then(res => res.json())
        .then(data => setFollowedTopics(new Set(data.topics || [])))
        .catch(() => {});
    }
  }, [session]);

  const toggleFollowTopic = async (topic: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user) {
      signIn('google', { callbackUrl: window.location.href });
      return;
    }
    setFollowingTopic(topic);
    const isFollowing = followedTopics.has(topic.toLowerCase());

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch('/api/user/topics', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (res.ok) {
        setFollowedTopics(prev => {
          const newSet = new Set(prev);
          if (isFollowing) {
            newSet.delete(topic.toLowerCase());
          } else {
            newSet.add(topic.toLowerCase());
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling topic follow:', error);
    } finally {
      setFollowingTopic(null);
    }
  };

  // Handle initialSearch from parent (e.g., tag click)
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
      fetchSituations(initialSearch, 1, sortBy);
    }
  }, [initialSearch]);

  const fetchSituations = useCallback(async (
    query?: string,
    page: number = 1,
    sort: SortOption = 'recent'
  ) => {
    try {
      setIsSearching(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: PAGE_SIZE.toString(),
        sort,
      });
      if (query) {
        params.set('q', query);
      }

      const response = await fetch(`/api/situations?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch situations');
      }
      const data: PaginatedResult = await response.json();
      setSituations(data.situations);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setCurrentPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    fetchSituations(searchQuery, 1, sortBy);
  }, [refreshTrigger, fetchSituations, sortBy]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      fetchSituations(query, 1, sortBy);
      onSearchChange?.(); // Clear parent's initialSearch state
    },
    [fetchSituations, sortBy, onSearchChange]
  );

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
    fetchSituations(searchQuery, 1, newSort);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchSituations(searchQuery, newPage, sortBy);
    // Scroll to top of list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          onClick={() => fetchSituations(searchQuery, currentPage, sortBy)}
          className="mt-4 text-burgundy-600 hover:text-burgundy-700 underline text-lg"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-600 to-burgundy-700 px-4 sm:px-6 py-4">
        <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide">
          Community Guidance
        </h2>
        <p className="text-white/70 text-sm mt-1">
          Browse guidance shared by others who have faced similar challenges
        </p>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-gray-600 text-sm whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="px-4 py-2 border border-gold-300/50 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="top_rated">Highest Rated</option>
            <option value="most_rated">Most Ratings</option>
          </select>
        </div>
      </div>

      {situations.length === 0 && !isSearching && (
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

      {situations.length > 0 && (
        <div className={`relative ${isSearching ? 'opacity-60' : ''} transition-opacity`}>
          {/* Loading overlay */}
          {isSearching && (
            <div className="absolute inset-0 flex items-start justify-center pt-8 z-10">
              <svg
                className="animate-spin h-6 w-6 text-burgundy-600"
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

          {/* Results info */}
          <div className="flex items-center justify-between text-gray-600">
            <p>
              {searchQuery ? (
                <>Found {total} {total === 1 ? 'result' : 'results'} for &quot;{searchQuery}&quot;</>
              ) : (
                <>{total} {total === 1 ? 'guidance' : 'guidances'} shared</>
              )}
            </p>
            {totalPages > 1 && (
              <p className="text-sm">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          {/* Situation cards */}
          <div className="space-y-4">
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
                {/* Tags */}
                {situation.tags && situation.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {situation.tags.map((tag, idx) => {
                      const isFollowing = followedTopics.has(tag.toLowerCase());
                      const isToggling = followingTopic === tag;

                      return (
                        <div key={idx} className="flex items-stretch">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSearch(tag);
                            }}
                            className="px-2.5 py-1 bg-cream-100 hover:bg-gold-100 text-burgundy-600 text-sm border border-gold-300/50 transition-colors rounded-l-full border-r-0"
                          >
                            {tag}
                          </button>
                          <button
                            onClick={(e) => toggleFollowTopic(tag, e)}
                            disabled={isToggling}
                            title={isFollowing ? 'Unfollow topic' : session?.user ? 'Follow topic' : 'Sign in to follow'}
                            className={`px-1.5 py-1 text-sm rounded-r-full border border-gold-300/50 transition-all duration-200 flex items-center justify-center ${
                              isFollowing
                                ? 'bg-gold-400 text-white border-gold-400 hover:bg-gold-500'
                                : 'bg-cream-100 text-gray-500 hover:bg-gold-100 hover:text-burgundy-600'
                            } ${isToggling ? 'opacity-50' : ''}`}
                          >
                            {isToggling ? (
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : isFollowing ? (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gold-300/50 text-gray-700 hover:bg-cream-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first, last, current, and pages around current
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce((acc: (number | string)[], page, idx, arr) => {
                    // Add ellipsis between non-consecutive pages
                    if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) => (
                    typeof item === 'number' ? (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(item)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === item
                            ? 'bg-burgundy-600 text-white'
                            : 'border border-gold-300/50 text-gray-700 hover:bg-cream-50'
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={idx} className="px-2 text-gray-400">
                        {item}
                      </span>
                    )
                  ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gold-300/50 text-gray-700 hover:bg-cream-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
