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
  const [showSparkle, setShowSparkle] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    <div className="bg-gradient-to-br from-burgundy-700 to-burgundy-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Hero Header */}
      <div className="text-center px-5 sm:px-8 md:px-10 pt-6 sm:pt-8 md:pt-10 pb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full mb-4">
          <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
          <span className="text-white/90 text-sm font-medium">Get Biblical Wisdom</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white tracking-wide mb-3">
          What&apos;s On Your Heart?
        </h2>
        <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
          Share your challenge or decision, and receive thoughtful guidance rooted in Scripture.
        </p>
      </div>

      <div className="px-5 sm:px-8 md:px-10 pb-6 sm:pb-8 md:pb-10">
        <form ref={formRef} onSubmit={handleSubmit}>
          <div>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="For example: I'm struggling to forgive someone who hurt me deeply..."
              className="w-full h-32 sm:h-40 p-4 sm:p-5 border-2 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 resize-none bg-white text-gray-700 placeholder-gray-400 text-base sm:text-lg leading-relaxed transition-all"
              maxLength={400}
              disabled={isLoading}
            />
            {/* Anonymous badge - below textarea */}
            <div className="flex items-center justify-end gap-1.5 text-xs text-white/60 mt-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your submission is anonymous
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>{situation.length}/400</span>
              <span className="hidden md:inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-xs font-mono text-white/70">
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                +
                <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-xs font-mono text-white/70">
                  Enter
                </kbd>
              </span>
            </div>

            <button
              ref={buttonRef}
              type="submit"
              disabled={isLoading || !situation.trim()}
              onClick={() => {
                if (situation.trim() && !isLoading) {
                  setShowSparkle(true);
                  setTimeout(() => setShowSparkle(false), 700);
                }
              }}
              className="group relative w-full sm:w-auto px-8 sm:px-12 py-4 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 text-burgundy-900 font-bold rounded-xl hover:from-gold-500 hover:via-gold-600 hover:to-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-burgundy-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-[0_4px_20px_rgba(212,165,116,0.5)] hover:shadow-[0_6px_30px_rgba(212,165,116,0.7)] hover:scale-[1.03] active:scale-[0.97] overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

              {/* Sparkle particles */}
              {showSparkle && (
                <>
                  <span className="absolute top-1 left-4 w-2 h-2 bg-white rounded-full animate-sparkle-1" />
                  <span className="absolute top-2 right-6 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-sparkle-2" />
                  <span className="absolute bottom-2 left-8 w-1 h-1 bg-white rounded-full animate-sparkle-3" />
                  <span className="absolute bottom-1 right-4 w-2 h-2 bg-yellow-100 rounded-full animate-sparkle-4" />
                  <span className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-white rounded-full animate-sparkle-5" />
                </>
              )}

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
                  <span className="relative">Seeking Guidance...</span>
                </>
              ) : (
                <>
                  {/* Praying hands icon */}
                  <span className="relative text-xl group-hover:animate-bounce-gentle">🙏</span>
                  <span className="relative">Ask for Guidance</span>
                  <svg
                    className="relative w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100/90 border border-red-300 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
