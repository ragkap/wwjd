'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import SituationForm from '@/components/SituationForm';
import ResponseCard from '@/components/ResponseCard';
import RelatedGuidance from '@/components/RelatedGuidance';
import SituationList from '@/components/SituationList';
import { Situation } from '@/lib/db';

export default function Home() {
  const [currentResponse, setCurrentResponse] = useState<Situation | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tagSearch, setTagSearch] = useState<string | null>(null);

  const handleResponse = (situation: Situation) => {
    setCurrentResponse(situation);
    // Only refresh the community list if this was a new saved response
    // (not moderated and not matched from existing)
    if (!situation.moderated && !situation.matchedFrom) {
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleRatingSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTagClick = (tag: string) => {
    setTagSearch(tag);
    // Scroll to community section
    document.getElementById('community-guidance')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4 space-y-10">
          {/* Submission Form */}
          <SituationForm onResponse={handleResponse} />

          {/* Current Response */}
          {currentResponse && (
            <div className="animate-fade-in space-y-6">
              <ResponseCard
                situation={currentResponse}
                showRating={!currentResponse.moderated}
                showShare={!currentResponse.moderated && !!currentResponse.id}
                onRatingSubmitted={handleRatingSubmitted}
                onTagClick={handleTagClick}
              />
              {/* Related Guidance - show for non-moderated responses */}
              {!currentResponse.moderated && (
                <RelatedGuidance
                  currentSituation={currentResponse.situation}
                  currentId={currentResponse.id}
                />
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gold-300/50" />
            <svg
              className="w-6 h-6 text-gold-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11 2v7H4v4h7v9h2v-9h7V9h-7V2z" />
            </svg>
            <div className="flex-1 h-px bg-gold-300/50" />
          </div>

          {/* Previous Situations */}
          <div id="community-guidance">
            <SituationList
              refreshTrigger={refreshTrigger}
              initialSearch={tagSearch}
              onSearchChange={() => setTagSearch(null)}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-cream-200 border-t border-gold-300/30 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-base tracking-wide leading-relaxed">
            &quot;<em>Trust in the Lord with all your heart and lean not on your own
            understanding.</em>&quot; <span className="text-base mt-2 tracking-wider">— Proverbs 3:5</span>
          </p>          
          <p className="text-gold-600 text-sm mt-2 tracking-wider">Vibe coded with ❤️ by <a className="underline" href="https://www.linkedin.com/in/ragkap/">@ragkap</a></p>
        </div>
      </footer>
    </div>
  );
}
