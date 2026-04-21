import { Target } from './entities';
import { getScaledDimensions, type ScaledDimensions } from './config';
import { lerpColor } from '@/engine/math';
import { gameColors } from '@/theme/gameColors';
import type { GameConfig } from '@/engine/types';

// Neon Dojo precision palette
const PRECISION_CYAN = '#2EB8D0';   // accent-precision approximation
const DANGER_RED = '#D94040';       // accent-danger approximation
const PRECISION_CYAN_DEEP = '#1A7A8A';

export class TargetPrecisionRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private theme: GameConfig['theme'];
  private dpr: number;
  private dims!: ScaledDimensions;

  // Pre-calculated color stops: cyan → red
  private rimStops: string[] = [];
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
    this.rimStops = [];
    for (let i = 0; i <= this.GRADIENT_RESOLUTION; i++) {
      const t = i / this.GRADIENT_RESOLUTION;
      // Cyan → amber → red as target progresses
      if (t <= 0.6) {
        // Stay cyan for first 60%
        this.rimStops.push(lerpColor(PRECISION_CYAN, '#F5A623', t / 0.6));
      } else {
        // Amber → red for last 40%
        this.rimStops.push(lerpColor('#F5A623', DANGER_RED, (t - 0.6) / 0.4));
      }
    }
  }

  setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.dims = getScaledDimensions(this.width, this.height);
  }

  get width(): number {
    return this.canvas.width / this.dpr;
  }

  get height(): number {
    return this.canvas.height / this.dpr;
  }

  get scaledDimensions(): ScaledDimensions {
    return this.dims;
  }

  clear(): void {
    const bg = gameColors.canvasBg[this.theme];
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw grid overlay
    this.drawGrid();
  }

  private drawGrid(): void {
    const gridSize = 60;
    const gridColor = this.theme === 'dark'
      ? 'rgba(46, 184, 208, 0.07)'  // cyan tinted grid
      : 'rgba(46, 184, 208, 0.05)';

    this.ctx.save();

    // Draw grid lines
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Radial mask — fade grid at edges using a radial clear
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.25,
      this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.65,
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, gameColors.canvasBg[this.theme]);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.restore();
  }

  drawTarget(target: Target): void {
    if (!target.active) return;

    const { x, y } = target;
    const outerR = target.currentOuterRadius(this.dims);
    const innerR = this.dims.innerRadius;
    const progress = target.progress;
    const countdown = target.countdownNumber;

    // Get rim color based on progress (cyan → amber → red)
    const colorIndex = Math.min(
      Math.floor(progress * this.GRADIENT_RESOLUTION),
      this.GRADIENT_RESOLUTION,
    );
    const rimColor = this.rimStops[colorIndex];

    // Outer ring glow
    const glowAlpha = Math.max(0.1, 1 - progress);
    this.ctx.save();
    this.ctx.shadowColor = rimColor;
    this.ctx.shadowBlur = 20 * glowAlpha;

    // Outer ring — glowing border
    this.ctx.beginPath();
    this.ctx.arc(x, y, outerR, 0, Math.PI * 2);
    this.ctx.fillStyle = `${rimColor}18`; // very subtle fill
    this.ctx.fill();
    this.ctx.strokeStyle = rimColor;
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    this.ctx.restore();

    // Inner clickable area — visible border with fill
    this.ctx.beginPath();
    this.ctx.arc(x, y, innerR, 0, Math.PI * 2);
    this.ctx.fillStyle = `${rimColor}20`; // subtle tinted fill
    this.ctx.fill();
    this.ctx.strokeStyle = rimColor;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Center dot
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.dims.bullseyeRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = `${rimColor}55`;
    this.ctx.fill();

    // Countdown number — pixel font style
    const isDanger = countdown <= 2;
    const numColor = isDanger ? DANGER_RED : PRECISION_CYAN;
    const fontSize = Math.round(this.dims.countdownFontSize * 1.8);

    this.ctx.save();
    if (this.theme === 'dark') {
      this.ctx.shadowColor = numColor;
      this.ctx.shadowBlur = 10;
    }
    this.ctx.fillStyle = numColor;
    this.ctx.font = `700 ${fontSize}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(String(countdown), x, y);
    this.ctx.restore();
  }

  drawTargets(targets: Target[]): void {
    for (const target of targets) {
      this.drawTarget(target);
    }
  }

  drawCombo(text: string, opacity: number, scale: number, combo: number): void {
    if (opacity <= 0 || !text) return;

    const cx = this.width / 2;
    const cy = this.height / 2;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.translate(cx, cy);
    this.ctx.scale(scale, scale);

    const hue = (combo * 35) % 360;
    const color = `hsl(${hue}, 85%, 60%)`;

    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 20 + combo * 5;

    const fontSize = Math.min(this.width * 0.18, 100);
    this.ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, 0, 0);

    this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeText(text, 0, 0);

    this.ctx.restore();
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
