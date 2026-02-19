'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="flex items-center gap-2 px-3 py-2 bg-burgundy-600 hover:bg-burgundy-700 rounded-lg transition-colors text-sm font-medium text-white whitespace-nowrap"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Sign in</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-cream-100 transition-colors"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full border-2 border-gold-300"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-burgundy-100 flex items-center justify-center text-burgundy-600 font-medium text-sm">
            {session.user?.name?.[0] || 'U'}
          </div>
        )}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gold-300/30 py-2 z-50">
            <div className="px-4 py-3 border-b border-gold-300/20">
              <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{session.user?.email}</p>
              <p className="text-xs text-gold-600 mt-1">Posting as: A Seeker (anonymous)</p>
            </div>

            <Link
              href="/my-guidance"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream-50 text-gray-700 text-sm"
            >
              <span>📚</span>
              <span>My Saved Guidance</span>
            </Link>

            <Link
              href="/my-topics"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream-50 text-gray-700 text-sm"
            >
              <span>🔔</span>
              <span>Topics I Follow</span>
            </Link>

            <Link
              href="/prayer-requests"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream-50 text-gray-700 text-sm"
            >
              <span>🙏</span>
              <span>Prayer Requests</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream-50 text-gray-700 text-sm"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </Link>

            <div className="border-t border-gold-300/20 mt-2 pt-2">
              <button
                onClick={() => {
                  setShowMenu(false);
                  signOut();
                }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream-50 text-gray-700 text-sm w-full"
              >
                <span>🚪</span>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
