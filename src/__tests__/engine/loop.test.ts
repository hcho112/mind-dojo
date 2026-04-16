// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '@/engine/loop';

describe('GameLoop', () => {
  let loop: GameLoop;
  let updateFn: ReturnType<typeof vi.fn>;
  let rafId: number;

  beforeEach(() => {
    rafId = 0;
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => {
      rafId++;
      return rafId;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    updateFn = vi.fn();
    loop = new GameLoop(updateFn);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts the loop and calls requestAnimationFrame', () => {
    loop.start();
    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('stops the loop and calls cancelAnimationFrame', () => {
    loop.start();
    loop.stop();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('does not call update before start', () => {
    expect(updateFn).not.toHaveBeenCalled();
  });

  it('calls update with deltaTime when frame fires', () => {
    loop.start();
    const frameCb = vi.mocked(requestAnimationFrame).mock.calls[0][0];
    frameCb(1000);
    const secondCb = vi.mocked(requestAnimationFrame).mock.calls[1][0];
    secondCb(1016);
    expect(updateFn).toHaveBeenCalledWith(16);
  });

  it('caps deltaTime to prevent spiral of death', () => {
    loop.start();
    const frameCb = vi.mocked(requestAnimationFrame).mock.calls[0][0];
    frameCb(1000);
    const secondCb = vi.mocked(requestAnimationFrame).mock.calls[1][0];
    secondCb(1500);
    expect(updateFn).toHaveBeenLastCalledWith(100);
  });

  it('does not call update when paused', () => {
    loop.start();
    loop.pause();
    const frameCb = vi.mocked(requestAnimationFrame).mock.calls[0][0];
    frameCb(1000);
    const callCountAtPause = updateFn.mock.calls.length;
    const secondCb = vi.mocked(requestAnimationFrame).mock.calls[1]?.[0];
    if (secondCb) secondCb(1016);
    expect(updateFn.mock.calls.length).toBe(callCountAtPause);
  });

  it('resumes after pause', () => {
    loop.start();
    const frameCb = vi.mocked(requestAnimationFrame).mock.calls[0][0];
    frameCb(1000);
    loop.pause();
    loop.resume();
    const nextCb = vi.mocked(requestAnimationFrame).mock.calls[vi.mocked(requestAnimationFrame).mock.calls.length - 1][0];
    nextCb(1100);
    expect(updateFn).toHaveBeenCalled();
  });
});
