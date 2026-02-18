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
    <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 p-8 md:p-10">
      <h2 className="font-serif text-3xl text-burgundy-700 mb-3 tracking-wide">
        Share Your Situation
      </h2>
      <p className="text-gray-600 mb-8 text-lg leading-relaxed">
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

        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-4">
            <span className="text-base text-gray-500 tracking-wide">
              {situation.length}/400 characters
            </span>
            <span className="text-sm text-gray-400 hidden sm:inline-flex items-center gap-1">
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
            className="px-8 py-4 bg-burgundy-600 text-white font-medium rounded-xl hover:bg-burgundy-700 focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3 text-lg tracking-wide"
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
