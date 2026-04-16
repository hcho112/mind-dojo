// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InputHandler } from '@/engine/input';

function createMockCanvas(): HTMLCanvasElement {
  const listeners: Record<string, EventListener[]> = {};
  return {
    addEventListener: vi.fn((type: string, listener: EventListener) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: EventListener) => {
      if (listeners[type]) {
        listeners[type] = listeners[type].filter(l => l !== listener);
      }
    }),
    getBoundingClientRect: vi.fn(() => ({
      left: 10, top: 20, width: 800, height: 600,
      right: 810, bottom: 620, x: 10, y: 20, toJSON: () => {},
    })),
    width: 800,
    height: 600,
    __listeners: listeners,
  } as unknown as HTMLCanvasElement & { __listeners: Record<string, EventListener[]> };
}

describe('InputHandler', () => {
  let canvas: HTMLCanvasElement & { __listeners: Record<string, EventListener[]> };
  let handler: InputHandler;
  let clickCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    canvas = createMockCanvas() as HTMLCanvasElement & { __listeners: Record<string, EventListener[]> };
    clickCallback = vi.fn();
    handler = new InputHandler(canvas, clickCallback);
  });

  it('attaches click and touchstart listeners to canvas', () => {
    expect(canvas.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(canvas.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
  });

  it('converts click event to canvas-relative coordinates', () => {
    const clickListener = canvas.__listeners['click'][0];
    const event = { clientX: 110, clientY: 120 } as MouseEvent;
    clickListener(event);
    expect(clickCallback).toHaveBeenCalledWith(100, 100);
  });

  it('removes listeners on destroy', () => {
    handler.destroy();
    expect(canvas.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(canvas.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
  });
});
