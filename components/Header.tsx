'use client';

import { useRouter } from 'next/navigation';
import UserMenu from './UserMenu';

export default function Header() {
  const router = useRouter();

  const handleLogoClick = () => {
    // Force navigation to clean home page (no query params)
    router.push('/');
    // If already on home, this ensures state resets by triggering a re-render
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="bg-cream-100 border-b border-gold-300/30">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Spacer for centering - hidden on mobile */}
          <div className="w-10 sm:w-24 hidden sm:block" />

          <button onClick={handleLogoClick} className="flex flex-col items-center hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cross Icon */}
              <svg
                className="w-5 h-5 sm:w-8 sm:h-8 text-burgundy-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11 2v7H4v4h7v9h2v-9h7V9h-7V2z" />
              </svg>

              <h1 className="font-serif text-xl sm:text-2xl md:text-4xl text-burgundy-700 tracking-wide text-center">
                What Would Jesus Do?
              </h1>

              {/* Dove Icon - hidden on mobile */}
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-burgundy-600 hidden sm:block"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3c-1.5 0-2.73 1.03-3.07 2.42L4 8l5 4-2 6h4v2h2v-2h4l-2-6 5-4-4.93-2.58C14.73 4.03 13.5 3 12 3zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
              </svg>
            </div>
            <p className="text-gold-600 text-xs sm:text-sm mt-1 font-medium tracking-wider">
              Biblical Guidance for Life&apos;s Journey
            </p>
          </button>

          {/* User Menu */}
          <div className="w-10 sm:w-24 flex justify-end">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
