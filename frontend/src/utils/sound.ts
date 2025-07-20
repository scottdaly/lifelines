import { Howl } from 'howler';

// Simple sound effects using Web Audio API as fallback
class SoundManager {
  private typeSound: Howl | null = null;
  private clickSound: Howl | null = null;
  private context: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize Web Audio context as fallback
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.context = new AudioContext();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Generate simple typing sound
  playTypeSound() {
    if (!this.enabled) return;
    
    try {
      if (this.context && this.context.state === 'running') {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = 800 + Math.random() * 200; // 800-1000 Hz
        gainNode.gain.value = 0.05; // Very quiet
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.02);
        oscillator.stop(this.context.currentTime + 0.02);
      }
    } catch (e) {
      // Silently fail if audio doesn't work
    }
  }

  // Generate simple click sound
  playClickSound() {
    if (!this.enabled) return;
    
    try {
      if (this.context && this.context.state === 'running') {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = 1200;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);
        oscillator.stop(this.context.currentTime + 0.05);
      }
    } catch (e) {
      // Silently fail if audio doesn't work
    }
  }

  // Resume audio context (needed for some browsers)
  async resume() {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }
}

export const soundManager = new SoundManager();