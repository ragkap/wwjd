'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-cream-100 border-b border-gold-300/30">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/" className="flex flex-col items-center hover:opacity-90 transition-opacity">
          <div className="flex items-center gap-3">
            {/* Cross Icon */}
            <svg
              className="w-8 h-8 text-burgundy-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11 2v7H4v4h7v9h2v-9h7V9h-7V2z" />
            </svg>

            <h1 className="font-serif text-3xl md:text-4xl text-burgundy-700 tracking-wide">
              What Would Jesus Do?
            </h1>

            {/* Dove Icon */}
            <svg
              className="w-8 h-8 text-burgundy-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3c-1.5 0-2.73 1.03-3.07 2.42L4 8l5 4-2 6h4v2h2v-2h4l-2-6 5-4-4.93-2.58C14.73 4.03 13.5 3 12 3zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
            </svg>
          </div>
          <p className="text-gold-600 text-sm mt-1 font-medium tracking-wider">
            Biblical Guidance for Life&apos;s Journey
          </p>
        </Link>
      </div>
    </header>
  );
}
