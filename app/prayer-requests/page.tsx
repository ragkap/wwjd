'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';

interface PrayerRequest {
  id: number;
  request: string;
  created_at: string;
  prayer_count: number;
  situation?: string;
  situation_id?: number;
}

export default function PrayerRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRequest, setNewRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prayedFor, setPrayedFor] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  const fetchPrayerRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/prayer-requests');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitPrayerRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.trim() || !session?.user) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/prayer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: newRequest.trim() }),
      });
      if (res.ok) {
        setNewRequest('');
        fetchPrayerRequests();
      }
    } catch (error) {
      console.error('Error submitting prayer request:', error);
    } finally {
      setIsSubmitting(false);
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-burgundy-700 tracking-wide mb-2">
              Community Prayer Requests
            </h1>
            <p className="text-gray-600">
              Share your prayer needs and lift up others in prayer.
            </p>
          </div>

          {/* Submit new prayer request */}
          {session?.user ? (
            <form onSubmit={submitPrayerRequest} className="mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 p-6">
                <h3 className="font-serif text-xl text-burgundy-700 mb-4">
                  Share a Prayer Request
                </h3>
                <textarea
                  value={newRequest}
                  onChange={(e) => setNewRequest(e.target.value)}
                  placeholder="Share what's on your heart..."
                  className="w-full h-24 p-4 border border-gold-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">
                    {newRequest.length}/500 characters
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newRequest.trim()}
                    className="px-6 py-2.5 bg-burgundy-600 text-white font-medium rounded-xl hover:bg-burgundy-700 focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Your request will be shared anonymously
                </p>
              </div>
            </form>
          ) : (
            <div className="bg-cream-100 rounded-2xl border border-gold-300/30 p-6 mb-8 text-center">
              <p className="text-gray-700">
                <a href="/api/auth/signin" className="text-burgundy-600 hover:underline font-medium">
                  Sign in
                </a>{' '}
                to share your own prayer request.
              </p>
            </div>
          )}

          {/* Prayer requests list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgundy-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 p-8 text-center">
              <svg
                className="w-16 h-16 mx-auto text-gold-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="font-serif text-xl text-burgundy-700 mb-2">
                No prayer requests yet
              </h3>
              <p className="text-gray-600">
                Be the first to share a prayer request with the community.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl shadow-lg border border-gold-300/20 p-6"
                >
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    {request.request}
                  </p>
                  {request.situation && (
                    <div className="mb-4 p-3 bg-cream-50 rounded-lg border border-gold-300/30">
                      <p className="text-sm text-gray-600">
                        Related to: <span className="italic">&quot;{request.situation.slice(0, 100)}...&quot;</span>
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </span>
                    <button
                      onClick={() => prayFor(request.id)}
                      disabled={prayedFor.has(request.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                        prayedFor.has(request.id)
                          ? 'bg-gold-100 text-gold-700'
                          : 'bg-cream-100 hover:bg-gold-100 text-burgundy-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>
                        {prayedFor.has(request.id) ? 'Prayed' : 'Pray'} ({request.prayer_count})
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
