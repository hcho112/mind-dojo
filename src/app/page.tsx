import { redirect } from 'next/navigation';
import { DEFAULT_GAME } from '@/games/registry';

export default function Home() {
  redirect(`/game/${DEFAULT_GAME}`);
}
