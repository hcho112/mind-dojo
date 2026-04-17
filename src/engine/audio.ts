export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private bgMusic: HTMLAudioElement | null = null;
  private bgMusicSrc: string = '';
  private _musicEnabled: boolean = true;
  private _sfxEnabled: boolean = true;

  preload(name: string, src: string): void {
    if (typeof window === 'undefined') return;
    const audio = new Audio(src);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
  }

  playSfx(name: string): void {
    if (!this._sfxEnabled) return;
    const original = this.sounds.get(name);
    if (!original) return;
    // Clone so overlapping plays don't cut each other off
    const clone = original.cloneNode() as HTMLAudioElement;
    clone.volume = original.volume;
    clone.play().catch(() => {});
  }

  setSfxVolume(name: string, volume: number): void {
    const audio = this.sounds.get(name);
    if (audio) audio.volume = Math.max(0, Math.min(1, volume));
  }

  initBgMusic(src: string, volume: number = 0.3): void {
    if (typeof window === 'undefined') return;
    this.bgMusicSrc = src;
    this.bgMusic = new Audio(src);
    this.bgMusic.loop = true;
    this.bgMusic.volume = volume;
    this.bgMusic.preload = 'auto';
  }

  playBgMusic(): void {
    if (!this._musicEnabled || !this.bgMusic) return;
    this.bgMusic.play().catch(() => {});
  }

  pauseBgMusic(): void {
    if (!this.bgMusic) return;
    this.bgMusic.pause();
  }

  stopBgMusic(): void {
    if (!this.bgMusic) return;
    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;
  }

  get musicEnabled(): boolean { return this._musicEnabled; }

  set musicEnabled(enabled: boolean) {
    this._musicEnabled = enabled;
    if (!enabled) {
      this.pauseBgMusic();
    }
  }

  get sfxEnabled(): boolean { return this._sfxEnabled; }

  set sfxEnabled(enabled: boolean) {
    this._sfxEnabled = enabled;
  }

  setBgMusicVolume(volume: number): void {
    if (this.bgMusic) this.bgMusic.volume = Math.max(0, Math.min(1, volume));
  }

  destroy(): void {
    this.stopBgMusic();
    this.bgMusic = null;
    this.sounds.clear();
  }
}

// Singleton instance shared across the app
export const audioManager = new AudioManager();
