'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLastPlayedGame } from '@/storage/preferences';
import { DEFAULT_GAME } from '@/games/registry';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const lastPlayed = getLastPlayedGame();
    router.replace(`/game/${lastPlayed || DEFAULT_GAME}`);
  }, [router]);

  return null;
}
