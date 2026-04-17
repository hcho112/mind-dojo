import { SUITS, VALUES, type Card } from './config';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value });
    }
  }
  return deck;
}

export function createDecks(count: number): Card[] {
  const cards: Card[] = [];
  for (let i = 0; i < count; i++) {
    cards.push(...createDeck());
  }
  return cards;
}

// Fisher-Yates shuffle
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function cardEquals(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.value === b.value;
}

export function cardToString(card: Card): string {
  const symbols: Record<string, string> = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
  return `${card.value}${symbols[card.suit]}`;
}
