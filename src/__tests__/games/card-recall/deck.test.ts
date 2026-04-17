// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createDeck, createDecks, shuffle, cardEquals } from '@/games/card-recall/CardDeck';

describe('createDeck', () => {
  it('creates a standard 52-card deck', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
  });

  it('has 13 cards per suit', () => {
    const deck = createDeck();
    const spades = deck.filter(c => c.suit === 'spades');
    const hearts = deck.filter(c => c.suit === 'hearts');
    const diamonds = deck.filter(c => c.suit === 'diamonds');
    const clubs = deck.filter(c => c.suit === 'clubs');
    expect(spades).toHaveLength(13);
    expect(hearts).toHaveLength(13);
    expect(diamonds).toHaveLength(13);
    expect(clubs).toHaveLength(13);
  });

  it('has all values in each suit', () => {
    const deck = createDeck();
    const spadeValues = deck.filter(c => c.suit === 'spades').map(c => c.value);
    expect(spadeValues).toContain('A');
    expect(spadeValues).toContain('K');
    expect(spadeValues).toContain('10');
    expect(spadeValues).toContain('2');
  });
});

describe('createDecks', () => {
  it('creates multiple decks', () => {
    const cards = createDecks(2);
    expect(cards).toHaveLength(104);
  });

  it('has duplicates with multiple decks', () => {
    const cards = createDecks(2);
    const aceOfSpades = cards.filter(c => c.suit === 'spades' && c.value === 'A');
    expect(aceOfSpades).toHaveLength(2);
  });
});

describe('shuffle', () => {
  it('returns same length', () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    expect(shuffled).toHaveLength(52);
  });

  it('contains all original cards', () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    for (const card of deck) {
      expect(shuffled.some(s => cardEquals(s, card))).toBe(true);
    }
  });

  it('does not mutate original', () => {
    const deck = createDeck();
    const original = [...deck];
    shuffle(deck);
    expect(deck).toEqual(original);
  });
});

describe('cardEquals', () => {
  it('returns true for matching cards', () => {
    expect(cardEquals({ suit: 'spades', value: 'A' }, { suit: 'spades', value: 'A' })).toBe(true);
  });

  it('returns false for different cards', () => {
    expect(cardEquals({ suit: 'spades', value: 'A' }, { suit: 'hearts', value: 'A' })).toBe(false);
    expect(cardEquals({ suit: 'spades', value: 'A' }, { suit: 'spades', value: 'K' })).toBe(false);
  });
});
