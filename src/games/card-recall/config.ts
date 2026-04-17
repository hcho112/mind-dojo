export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export type Suit = typeof SUITS[number];

export const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export type Value = typeof VALUES[number];

export interface Card {
  suit: Suit;
  value: Value;
}

export const SUIT_COLORS: Record<Suit, string> = {
  spades: '#1a1a2e',
  clubs: '#1a1a2e',
  hearts: '#dc2626',
  diamonds: '#dc2626',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const SUIT_ICONS: Record<Suit, string> = {
  spades: '/images/cards/spade.svg',
  hearts: '/images/cards/heart.svg',
  diamonds: '/images/cards/diamond.svg',
  clubs: '/images/cards/club.svg',
};

export const FACE_ICONS: Record<string, string> = {
  A: '/images/cards/face-a.svg',
  K: '/images/cards/face-k.svg',
  Q: '/images/cards/face-q.svg',
  J: '/images/cards/face-j.svg',
};

export function isFaceCard(value: Value): boolean {
  return value === 'A' || value === 'K' || value === 'Q' || value === 'J';
}
