'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Situation } from '@/lib/db';
import ResponseCard from '@/components/ResponseCard';

interface Props {
  situation: Situation;
}

export default function SituationPageClient({ situation }: Props) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const shareText = `WWJD: "${situation.situation.slice(0, 100)}${situation.situation.length > 100 ? '...' : ''}"`;

  const copyToClipboard = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };


  const shareToTwitter = () => {
    const currentUrl = window.location.href;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const currentUrl = window.location.href;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const currentUrl = window.location.href;
    const subject = encodeURIComponent('Biblical Guidance - What Would Jesus Do?');
    const body = encodeURIComponent(`I found this helpful guidance:\n\n"${situation.situation}"\n\nRead the full response: ${currentUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const nativeShare = async () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'What Would Jesus Do?',
          text: shareText,
          url: currentUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-cream-100 border-b border-gold-300/30">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-burgundy-600 hover:text-burgundy-700 text-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Share Bar */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow border border-gold-300/20 p-4">
            <span className="text-gray-600">Share this guidance</span>
            <div className="flex items-center gap-3 relative">
              {/* Copy Link Button */}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-cream-100 hover:bg-cream-200 rounded-lg text-gray-700 transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              {/* Share Button */}
              <button
                onClick={nativeShare}
                className="flex items-center gap-2 px-4 py-2 bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>

              {/* Share Menu Dropdown */}
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gold-300/20 py-2 z-10 min-w-[200px]">
                  <button
                    onClick={shareToTwitter}
                    className="w-full px-4 py-3 text-left hover:bg-cream-50 flex items-center gap-3 text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </button>
                  <button
                    onClick={shareToFacebook}
                    className="w-full px-4 py-3 text-left hover:bg-cream-50 flex items-center gap-3 text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Share on Facebook
                  </button>
                  <button
                    onClick={shareViaEmail}
                    className="w-full px-4 py-3 text-left hover:bg-cream-50 flex items-center gap-3 text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Share via Email
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Response Card */}
          <ResponseCard situation={situation} showRating={true} />

          {/* Back Link */}
          <div className="text-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-burgundy-600 hover:text-burgundy-700 text-lg font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Browse more community guidance
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-cream-200 border-t border-gold-300/30 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-base tracking-wide leading-relaxed">
            &quot;Trust in the Lord with all your heart and lean not on your own
            understanding.&quot;
          </p>
          <p className="text-gold-600 text-base mt-2 tracking-wider">— Proverbs 3:5</p>
        </div>
      </footer>
    </div>
  );
}
