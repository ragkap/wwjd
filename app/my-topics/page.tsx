'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';

export default function MyTopicsPage() {
  const { data: session, status } = useSession();
  const [followedTopics, setFollowedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/');
    }
  }, [status]);

  useEffect(() => {
    if (session?.user) {
      fetchFollowedTopics();
    }
  }, [session]);

  const fetchFollowedTopics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/topics');
      const data = await res.json();
      setFollowedTopics(data.topics || []);
    } catch (error) {
      console.error('Error fetching followed topics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowTopic = async (topic: string) => {
    try {
      await fetch('/api/user/topics', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      setFollowedTopics((prev) => prev.filter((t) => t !== topic));
    } catch (error) {
      console.error('Error unfollowing topic:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgundy-600"></div>
        </main>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-burgundy-700 tracking-wide mb-2">
              Topics You Follow
            </h1>
            <p className="text-gray-600">
              Get notified when new guidance is posted about topics you care about.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgundy-600"></div>
            </div>
          ) : followedTopics.length === 0 ? (
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <h3 className="font-serif text-xl text-burgundy-700 mb-2">
                No followed topics yet
              </h3>
              <p className="text-gray-600 mb-4">
                Click on any topic tag in guidance responses to follow it and get updates.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-burgundy-600 text-white rounded-xl hover:bg-burgundy-700 transition-colors"
              >
                <span>Explore Guidance</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 p-6">
              <div className="flex flex-wrap gap-3">
                {followedTopics.map((topic) => (
                  <div
                    key={topic}
                    className="flex items-center gap-2 px-4 py-2 bg-cream-100 rounded-full border border-gold-300/50"
                  >
                    <span className="text-burgundy-600 font-medium">{topic}</span>
                    <button
                      onClick={() => unfollowTopic(topic)}
                      className="p-1 hover:bg-gold-200 rounded-full transition-colors"
                      title="Unfollow topic"
                    >
                      <svg
                        className="w-4 h-4 text-gray-500 hover:text-burgundy-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
