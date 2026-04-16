import { Target } from './entities';
import { GAME_DEFAULTS } from './config';
import { lerpColor } from '@/engine/math';
import { gameColors } from '@/theme/gameColors';
import type { GameConfig } from '@/engine/types';

export class TargetPrecisionRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private theme: GameConfig['theme'];
  private dpr: number;

  // Pre-calculated gradient stops
  private gradientStops: string[] = [];
  private readonly GRADIENT_RESOLUTION = 100;

  constructor(canvas: HTMLCanvasElement, theme: GameConfig['theme']) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');
    this.ctx = ctx;
    this.canvas = canvas;
    this.theme = theme;
    this.dpr = window.devicePixelRatio || 1;
    this.preCalculateGradient();
    this.setupCanvas();
  }

  private preCalculateGradient(): void {
    const { start, mid, end } = gameColors.targetGradient;
    this.gradientStops = [];

    for (let i = 0; i <= this.GRADIENT_RESOLUTION; i++) {
      const t = i / this.GRADIENT_RESOLUTION;
      if (t <= 0.5) {
        this.gradientStops.push(lerpColor(start, mid, t * 2));
      } else {
        this.gradientStops.push(lerpColor(mid, end, (t - 0.5) * 2));
      }
    }
  }

  setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  get width(): number {
    return this.canvas.width / this.dpr;
  }

  get height(): number {
    return this.canvas.height / this.dpr;
  }

  clear(): void {
    const bg = gameColors.canvasBg[this.theme];
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawTarget(target: Target): void {
    if (!target.active) return;

    const { x, y } = target;
    const outerR = target.currentOuterRadius;
    const innerR = GAME_DEFAULTS.innerRadius;
    const progress = target.progress;

    // Outer circle with gradient color
    const colorIndex = Math.min(
      Math.floor(progress * this.GRADIENT_RESOLUTION),
      this.GRADIENT_RESOLUTION,
    );
    const color = this.gradientStops[colorIndex];

    this.ctx.beginPath();
    this.ctx.arc(x, y, outerR, 0, Math.PI * 2);
    this.ctx.fillStyle = color + '33';
    this.ctx.fill();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Inner circle (bullseye)
    const bullseyeColor = gameColors.bullseye[this.theme];
    this.ctx.beginPath();
    this.ctx.arc(x, y, innerR, 0, Math.PI * 2);
    this.ctx.fillStyle = bullseyeColor + '22';
    this.ctx.fill();
    this.ctx.strokeStyle = bullseyeColor;
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Bullseye dot (hit zone visual hint)
    this.ctx.beginPath();
    this.ctx.arc(x, y, GAME_DEFAULTS.bullseyeRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = bullseyeColor + '44';
    this.ctx.fill();

    // Countdown number
    this.ctx.fillStyle = bullseyeColor;
    this.ctx.font = 'bold 16px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(String(target.countdownNumber), x, y);
  }

  drawTargets(targets: Target[]): void {
    for (const target of targets) {
      this.drawTarget(target);
    }
  }

  drawHitEffect(x: number, y: number): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, GAME_DEFAULTS.outerRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = gameColors.hitFeedback + '33';
    this.ctx.fill();
  }

  drawLifeLostVignette(intensity: number): void {
    if (intensity <= 0) return;

    const alpha = Math.floor(intensity * 80).toString(16).padStart(2, '0');
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.width * 0.3,
      this.width / 2, this.height / 2, this.width * 0.7,
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, gameColors.lifeLostVignette + alpha);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  setTheme(theme: GameConfig['theme']): void {
    this.theme = theme;
  }
}
