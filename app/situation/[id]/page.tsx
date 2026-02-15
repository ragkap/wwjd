import { Metadata } from 'next';
import { getSituationById } from '@/lib/db';
import { notFound } from 'next/navigation';
import SituationPageClient from './SituationPageClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const situationId = parseInt(id, 10);

  if (isNaN(situationId)) {
    return {
      title: 'Not Found',
    };
  }

  const situation = await getSituationById(situationId);

  if (!situation) {
    return {
      title: 'Not Found',
    };
  }

  const truncatedSituation =
    situation.situation.length > 100
      ? situation.situation.slice(0, 100) + '...'
      : situation.situation;

  const truncatedResponse =
    situation.response.length > 155
      ? situation.response.slice(0, 155) + '...'
      : situation.response;

  return {
    title: truncatedSituation,
    description: truncatedResponse,
    openGraph: {
      title: `WWJD: ${truncatedSituation}`,
      description: truncatedResponse,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `WWJD: ${truncatedSituation}`,
      description: truncatedResponse,
    },
  };
}

export default async function SituationPage({ params }: Props) {
  const { id } = await params;
  const situationId = parseInt(id, 10);

  if (isNaN(situationId)) {
    notFound();
  }

  const situation = await getSituationById(situationId);

  if (!situation) {
    notFound();
  }

  return <SituationPageClient situation={situation} />;
}
