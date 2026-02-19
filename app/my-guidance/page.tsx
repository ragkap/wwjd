'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import ResponseCard from '@/components/ResponseCard';
import { Situation } from '@/lib/db';

export default function MyGuidancePage() {
  const { data: session, status } = useSession();
  const [savedGuidance, setSavedGuidance] = useState<Situation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/');
    }
  }, [status]);

  useEffect(() => {
    if (session?.user) {
      fetchSavedGuidance();
    }
  }, [session]);

  const fetchSavedGuidance = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/saved');
      const data = await res.json();
      setSavedGuidance(data);
    } catch (error) {
      console.error('Error fetching saved guidance:', error);
    } finally {
      setIsLoading(false);
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
              Your Saved Guidance
            </h1>
            <p className="text-gray-600">
              Guidance you&apos;ve bookmarked for reflection and revisiting.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgundy-600"></div>
            </div>
          ) : savedGuidance.length === 0 ? (
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
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <h3 className="font-serif text-xl text-burgundy-700 mb-2">
                No saved guidance yet
              </h3>
              <p className="text-gray-600 mb-4">
                When you find guidance that speaks to you, click the Save button to keep it here for later.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-burgundy-600 text-white rounded-xl hover:bg-burgundy-700 transition-colors"
              >
                <span>Ask for Guidance</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {savedGuidance.map((guidance) => (
                <ResponseCard
                  key={guidance.id}
                  situation={guidance}
                  showRating={false}
                  showShare={true}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
