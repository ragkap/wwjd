import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'What Would Jesus Do? - Biblical Guidance for Life',
    template: '%s | WWJD',
  },
  description:
    'Seek biblical guidance for life\'s challenges. Share your situation and receive thoughtful, scripture-based wisdom inspired by Jesus\'s teachings. Find comfort knowing you\'re not alone.',
  keywords: [
    'WWJD',
    'What Would Jesus Do',
    'Jesus',
    'Bible',
    'Christian guidance',
    'faith',
    'scripture',
    'biblical wisdom',
    'spiritual guidance',
    'Christian advice',
    'Gospel teachings',
    'forgiveness',
    'prayer',
  ],
  authors: [{ name: 'WWJD Community' }],
  creator: 'WWJD',
  publisher: 'WWJD',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'What Would Jesus Do?',
    title: 'What Would Jesus Do? - Biblical Guidance for Life',
    description:
      'Seek biblical guidance for life\'s challenges. Share your situation and receive thoughtful, scripture-based wisdom inspired by Jesus\'s teachings.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What Would Jesus Do? - Biblical Guidance for Life',
    description:
      'Seek biblical guidance for life\'s challenges. Share your situation and receive thoughtful, scripture-based wisdom.',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
