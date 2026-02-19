'use client';

import { useState, useRef, useEffect } from 'react';
import { Situation } from '@/lib/db';

interface SituationFormProps {
  onResponse: (situation: Situation) => void;
}

export default function SituationForm({ onResponse }: SituationFormProps) {
  const [situation, setSituation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Detect if user is on Mac for showing correct shortcut hint
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (situation.trim() && !isLoading) {
        formRef.current?.requestSubmit();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!situation.trim()) {
      setError('Please describe your situation');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/situations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ situation: situation.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get response');
      }

      const data = await response.json();
      onResponse(data);
      setSituation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 p-4 sm:p-8 md:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <h2 className="font-serif text-2xl sm:text-3xl text-burgundy-700 tracking-wide">
          Share Your Situation
        </h2>
        <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 bg-cream-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Posted anonymously
        </span>
      </div>
      <p className="text-gray-600 mb-6 text-base leading-relaxed">
        Describe the challenge or decision you&apos;re facing, and receive
        biblical guidance on what Jesus would do.
      </p>

      <form ref={formRef} onSubmit={handleSubmit}>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="For example: I'm struggling to forgive someone who hurt me deeply..."
          className="w-full h-32 p-5 border border-gold-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent resize-none text-gray-700 placeholder-gray-400 text-lg leading-relaxed"
          maxLength={400}
          disabled={isLoading}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 gap-3">
          <div className="flex items-center gap-4">
            <span className="text-sm sm:text-base text-gray-500 tracking-wide">
              {situation.length}/400 characters
            </span>
            <span className="text-sm text-gray-400 hidden md:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                {isMac ? '⌘' : 'Ctrl'}
              </kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                Enter
              </kbd>
              <span className="ml-1">to submit</span>
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !situation.trim()}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-burgundy-600 text-white font-medium rounded-xl hover:bg-burgundy-700 focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg tracking-wide"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                <span>Seeking Guidance...</span>
              </>
            ) : (
              <>
                <span>Ask for Guidance</span>
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
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
