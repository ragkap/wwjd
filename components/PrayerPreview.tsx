'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

interface PrayerRequest {
  id: number;
  request: string;
  created_at: string;
  prayer_count: number;
}

export default function PrayerPreview() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prayedFor, setPrayedFor] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  const fetchPrayerRequests = async () => {
    try {
      const res = await fetch('/api/prayer-requests?limit=10');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const prayFor = async (requestId: number) => {
    if (prayedFor.has(requestId)) return;

    try {
      await fetch(`/api/prayer-requests/${requestId}/pray`, { method: 'POST' });
      setPrayedFor((prev) => new Set([...prev, requestId]));
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, prayer_count: r.prayer_count + 1 } : r
        )
      );
    } catch (error) {
      console.error('Error praying for request:', error);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 overflow-hidden">
        <div className="bg-gradient-to-r from-burgundy-600 to-burgundy-700 px-4 sm:px-6 py-4">
          <div className="h-6 bg-white/20 rounded w-32 animate-pulse"></div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-600 to-burgundy-700 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl text-white tracking-wide">
              Prayer Wall
            </h3>
            <p className="text-white/70 text-sm mt-1">
              Lift up others in prayer and share your own requests
            </p>
          </div>
          <Link
            href="/prayer-requests"
            className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1"
          >
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Prayer Requests */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-cream-50 rounded-xl border border-gold-300/30 p-3 hover:shadow-md transition-shadow"
            >
              <p className="text-gray-700 text-sm line-clamp-2 mb-2">
                "{request.request}"
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {formatTimeAgo(request.created_at)}
                </span>
                <button
                  onClick={() => prayFor(request.id)}
                  disabled={prayedFor.has(request.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all duration-200 ${
                    prayedFor.has(request.id)
                      ? 'bg-gold-100 text-gold-700'
                      : 'bg-white hover:bg-gold-100 text-burgundy-600 hover:scale-105'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill={prayedFor.has(request.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{request.prayer_count}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-4 text-center">
          {session?.user ? (
            <Link
              href="/prayer-requests"
              className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Share a Prayer Request</span>
            </Link>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/prayer-requests' })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <span>Sign in to Share a Prayer Request</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
