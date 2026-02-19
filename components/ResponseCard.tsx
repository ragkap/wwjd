'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Situation } from '@/lib/db';
import RatingWidget from './RatingWidget';

interface ResponseCardProps {
  situation: Situation;
  showRating?: boolean;
  showShare?: boolean;
  onRatingSubmitted?: () => void;
  onTagClick?: (tag: string) => void;
}

// Helper function to highlight quoted text (Jesus's words)
function formatResponseWithQuotes(text: string): React.ReactNode[] {
  // Match text within quotation marks (double, single, and curly quotes)
  const quotePattern = /(?:^|\s)["“'']([^"”'']+)(?:["”''])/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = quotePattern.exec(text)) !== null) {
    // Add text before the quote
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++}>{text.slice(lastIndex, match.index)}</span>
      );
    }

    // Add the quoted text with special styling
    const quotedText = match[1] || match[2] || match[3] || match[4];
    parts.push(
      <span
        key={key++}
        className="text-burgundy-600 font-medium italic"
      >
        &lsquo;{quotedText}&rsquo;
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last quote
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
}

export default function ResponseCard({
  situation,
  showRating = true,
  showShare = false,
  onRatingSubmitted,
  onTagClick,
}: ResponseCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [followedTopics, setFollowedTopics] = useState<Set<string>>(new Set());
  const [followingTopic, setFollowingTopic] = useState<string | null>(null);

  // Check if guidance is saved and fetch followed topics
  useEffect(() => {
    if (session?.user) {
      if (situation.id) {
        fetch(`/api/user/saved?situationId=${situation.id}`)
          .then(res => res.json())
          .then(data => setIsSaved(data.saved))
          .catch(() => {});
      }
      // Fetch followed topics
      fetch('/api/user/topics')
        .then(res => res.json())
        .then(data => setFollowedTopics(new Set(data.topics || [])))
        .catch(() => {});
    }
  }, [session, situation.id]);

  const toggleFollowTopic = async (topic: string) => {
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

  const toggleSave = async () => {
    if (!situation.id) return;
    if (!session?.user) {
      signIn('google', { callbackUrl: window.location.href });
      return;
    }
    setIsSaving(true);
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const res = await fetch('/api/user/saved', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situationId: situation.id }),
      });
      const data = await res.json();
      setIsSaved(data.saved);
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const shareUrl = situation.id ? `${typeof window !== 'undefined' ? window.location.origin : ''}/situation/${situation.id}` : '';
  const shareText = `WWJD: "${situation.situation.slice(0, 100)}${situation.situation.length > 100 ? '...' : ''}"`;

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToTwitter = () => {
    if (!shareUrl) return;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    if (!shareUrl) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const nativeShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'What Would Jesus Do?',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-600 to-burgundy-700 px-4 sm:px-8 py-5">
        <h3 className="font-serif text-xl sm:text-2xl text-white tracking-wide">Your Situation</h3>
      </div>

      {/* Situation text */}
      <div className="px-4 sm:px-8 py-5 bg-cream-50 border-b border-gold-300/20">
        <p className="text-gray-700 italic text-lg leading-relaxed">&quot;{situation.situation}&quot;</p>
      </div>

      {/* Similar question banner */}
      {situation.matchedFrom && (
        <div className="px-4 sm:px-8 py-4 bg-blue-50 border-b border-blue-200 flex items-start gap-3">
          <svg
            className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <div>
            <p className="text-blue-800 text-sm font-medium">
              You&apos;re not alone — someone asked a similar question
            </p>
            <p className="text-blue-600 text-sm mt-1">
              &quot;{situation.matchedFrom.originalQuestion.length > 80
                ? situation.matchedFrom.originalQuestion.slice(0, 80) + '...'
                : situation.matchedFrom.originalQuestion}&quot;
            </p>
          </div>
        </div>
      )}

      {/* Care Banner for moderated content */}
      {situation.moderated && (
        <div className="px-4 sm:px-8 py-4 bg-amber-50 border-b border-amber-200 flex items-center gap-3">
          <svg
            className="w-6 h-6 text-amber-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-amber-800 text-sm">
            We care about your wellbeing. This response includes resources that may help.
          </p>
        </div>
      )}

      {/* Response */}
      <div className="px-4 sm:px-4 sm:px-4 sm:px-8 py-4 sm:py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-5">
          <svg
            className="w-7 h-7 text-gold-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            {situation.moderated ? (
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            ) : (
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            )}
          </svg>
          <h4 className="font-serif text-xl sm:text-2xl text-burgundy-700 tracking-wide">
            {situation.moderated ? 'A Message of Care' : 'What Jesus Would Do'}
          </h4>
        </div>

        <div className="prose prose-burgundy max-w-none">
          <p className="sm:mx-4 md:mx-10 text-gray-700 leading-relaxed sm:leading-loose whitespace-pre-wrap text-base sm:text-lg tracking-wide">
            {formatResponseWithQuotes(situation.response)}
          </p>
        </div>
      </div>

      {/* Scripture References */}
      {situation.verses && situation.verses.length > 0 && (
        <div className="px-4 sm:px-4 sm:px-8 py-4 sm:py-6 bg-cream-50 border-t border-gold-300/20">
          <h5 className="font-medium text-burgundy-700 mb-4 flex items-center gap-3 text-lg tracking-wide">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Scripture References
          </h5>
          <div className="space-y-3">
            {situation.verses.map((verse, index) => (
              <div
                key={index}
                className="px-5 py-4 bg-white rounded-lg border border-gold-300/30 text-gray-700 text-lg leading-relaxed tracking-wide"
              >
                {formatResponseWithQuotes(verse)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags and Save Button Row */}
      {(situation.tags && situation.tags.length > 0) || situation.id ? (
        <div className="px-4 sm:px-8 py-4 border-t border-gold-300/20 flex items-center justify-between flex-wrap gap-3">
          {/* Tags */}
          <div className="flex items-center gap-3 flex-wrap">
            {situation.tags && situation.tags.length > 0 && (
              <>
                <span className="text-sm text-gray-500">Topics:</span>
                {situation.tags.map((tag, idx) => {
                  const isFollowing = followedTopics.has(tag.toLowerCase());
                  const isToggling = followingTopic === tag;

                  return (
                    <div key={idx} className="flex items-stretch">
                      <button
                        onClick={() => {
                          if (onTagClick) {
                            onTagClick(tag);
                          } else {
                            router.push(`/?tag=${encodeURIComponent(tag)}`);
                          }
                        }}
                        className="px-3 py-1 bg-cream-100 text-burgundy-600 text-sm border border-gold-300/50 hover:bg-gold-100 cursor-pointer transition-colors rounded-l-full border-r-0"
                      >
                        {tag}
                      </button>
                      <button
                        onClick={() => toggleFollowTopic(tag)}
                        disabled={isToggling}
                        title={isFollowing ? 'Unfollow topic' : session?.user ? 'Follow topic' : 'Sign in to follow'}
                        className={`px-1.5 text-sm rounded-r-full border border-gold-300/50 transition-all duration-200 flex items-center justify-center ${
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
              </>
            )}
          </div>

          {/* Save Button - visible to all users */}
          {situation.id && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSave}
                disabled={isSaving}
                title={isSaved ? 'Remove from saved' : session?.user ? 'Save this guidance' : 'Sign in to save guidance'}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isSaved
                    ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-lg ring-2 ring-gold-300 ring-offset-2'
                    : 'bg-burgundy-600 text-white hover:bg-burgundy-700 shadow-md hover:shadow-lg hover:scale-105'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
              >
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isSaved ? 'animate-bounce-once' : 'group-hover:scale-110'
                  }`}
                  fill={isSaved ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={isSaved ? 0 : 2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <span>{isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save for Later'}</span>
              </button>
              {isSaved && session?.user && (
                <span className="text-xs text-gray-500 animate-fade-in">
                  Find in <a href="/my-guidance" className="text-burgundy-600 hover:underline font-medium">My Saved Guidance</a>
                </span>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Share Bar */}
      {showShare && situation.id && (
        <div className="px-4 sm:px-8 py-4 border-t border-gold-300/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-sm text-gray-500">Share this guidance:</span>
          <div className="flex items-center gap-2 relative">
            {/* Copy Link */}
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Share Button */}
            <button
              onClick={nativeShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-lg text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>

            {/* Share Menu Dropdown */}
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gold-300/20 py-2 z-10 min-w-[180px]">
                <button
                  onClick={shareToTwitter}
                  className="w-full px-4 py-2.5 text-left hover:bg-cream-50 flex items-center gap-3 text-gray-700 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share on X
                </button>
                <button
                  onClick={shareToFacebook}
                  className="w-full px-4 py-2.5 text-left hover:bg-cream-50 flex items-center gap-3 text-gray-700 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Share on Facebook
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rating Section */}
      {showRating && (
        <div className="px-6 py-4 border-t border-gold-300/20">
          <RatingWidget
            situationId={situation.id}
            onRatingSubmitted={onRatingSubmitted}
          />
        </div>
      )}

      {/* Rating display for list items */}
      {!showRating && situation.rating_count !== undefined && situation.rating_count > 0 && (
        <div className="px-6 py-3 border-t border-gold-300/20 bg-cream-50 flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${
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
          </div>
          <span className="text-sm text-gray-600">
            ({situation.rating_count} {situation.rating_count === 1 ? 'rating' : 'ratings'})
          </span>
        </div>
      )}
    </div>
  );
}
