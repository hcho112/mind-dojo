export type ClickCallback = (x: number, y: number) => void;

export class InputHandler {
  private canvas: HTMLCanvasElement;
  private callback: ClickCallback;

  constructor(canvas: HTMLCanvasElement, callback: ClickCallback) {
    this.canvas = canvas;
    this.callback = callback;
    this.canvas.addEventListener('click', this.handleClick);
    this.canvas.addEventListener('touchstart', this.handleTouch);
  }

  destroy(): void {
    this.canvas.removeEventListener('click', this.handleClick);
    this.canvas.removeEventListener('touchstart', this.handleTouch);
  }

  private handleClick = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.callback(x, y);
  };

  private handleTouch = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.callback(x, y);
  };
}
