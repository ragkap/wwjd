'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';

interface UserSettings {
  email_digest: boolean;
  digest_frequency: string;
  notify_ratings: boolean;
  notify_prayers: boolean;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<UserSettings>({
    email_digest: false,
    digest_frequency: 'weekly',
    notify_ratings: true,
    notify_prayers: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/');
    }
  }, [status]);

  useEffect(() => {
    if (session?.user) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (res.ok) {
        setSaveMessage('Settings saved');
        setTimeout(() => setSaveMessage(null), 2000);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsSaving(false);
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
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-burgundy-700 tracking-wide mb-2">
              Settings
            </h1>
            <p className="text-gray-600">
              Manage your notification preferences and account settings.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-burgundy-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Account Info */}
              <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 p-6">
                <h2 className="font-serif text-xl text-burgundy-700 mb-4">Account</h2>
                <div className="flex items-center gap-4">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{session.user?.name}</p>
                    <p className="text-sm text-gray-500">{session.user?.email}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Your posts always appear as &quot;A Seeker&quot; - your identity stays private
                </p>
              </div>

              {/* Email Notifications */}
              <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 p-6">
                <h2 className="font-serif text-xl text-burgundy-700 mb-4">Email Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Email Digest</p>
                      <p className="text-sm text-gray-500">
                        Receive a summary of new guidance on topics you follow
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.email_digest}
                        onChange={(e) => updateSetting('email_digest', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy-600"></div>
                    </label>
                  </div>

                  {settings.email_digest && (
                    <div className="pl-4 border-l-2 border-gold-300/50">
                      <p className="text-sm font-medium text-gray-700 mb-2">Frequency</p>
                      <select
                        value={settings.digest_frequency}
                        onChange={(e) => updateSetting('digest_frequency', e.target.value)}
                        className="px-3 py-2 border border-gold-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gold-300/30">
                    <div>
                      <p className="font-medium text-gray-800">Rating Notifications</p>
                      <p className="text-sm text-gray-500">
                        Get notified when your saved guidance receives new ratings
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notify_ratings}
                        onChange={(e) => updateSetting('notify_ratings', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gold-300/30">
                    <div>
                      <p className="font-medium text-gray-800">Prayer Notifications</p>
                      <p className="text-sm text-gray-500">
                        Get notified when someone prays for your prayer requests
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notify_prayers}
                        onChange={(e) => updateSetting('notify_prayers', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy-600"></div>
                    </label>
                  </div>
                </div>

                {saveMessage && (
                  <p className="mt-4 text-sm text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {saveMessage}
                  </p>
                )}
              </div>

              {/* Sign Out */}
              <div className="bg-white rounded-2xl shadow-lg border border-gold-300/20 p-6">
                <h2 className="font-serif text-xl text-burgundy-700 mb-4">Account Actions</h2>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
