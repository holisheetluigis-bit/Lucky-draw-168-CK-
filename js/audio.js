// Web Audio API Synthesizer for Lucky Draw 168
// 100% self-contained, no external audio files, zero latency, works on mobile & desktop

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('ld168_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('ld168_muted', this.isMuted ? 'true' : 'false');
    return this.isMuted;
  }

  playTick(velocity = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch slightly rises with higher spin speed
      const baseFreq = 780 + Math.min(velocity * 120, 600);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch (e) {
      console.warn('Audio tick error', e);
    }
  }

  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Audio click error', e);
    }
  }

  playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [
        { f: 523.25, t: 0.0, d: 0.12 }, // C5
        { f: 659.25, t: 0.12, d: 0.12 }, // E5
        { f: 783.99, t: 0.24, d: 0.12 }, // G5
        { f: 1046.50, t: 0.36, d: 0.40 } // C6
      ];

      notes.forEach(note => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + note.t;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, startTime);

        gain.gain.setValueAtTime(0.22, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + note.d);
      });
    } catch (e) {
      console.warn('Audio fanfare error', e);
    }
  }

  playGrandWin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const chords = [
        [523.25, 659.25, 783.99],   // C Major
        [587.33, 739.99, 880.00],   // D Major
        [659.25, 830.61, 987.77],   // E Major
        [1046.50, 1318.51, 1567.98] // High C Major
      ];

      chords.forEach((chord, idx) => {
        const startTime = this.ctx.currentTime + (idx * 0.18);
        chord.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, startTime);

          const duration = idx === chords.length - 1 ? 0.7 : 0.22;
          gain.gain.setValueAtTime(0.08, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      });
    } catch (e) {
      console.warn('Audio grand win error', e);
    }
  }

  playMysteryChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const steps = [440, 554.37, 659.25, 830.61, 880, 1108.73, 1318.51];
      steps.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + (idx * 0.08);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (e) {
      console.warn('Audio mystery error', e);
    }
  }

  playOpenVault() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Sub boom
      const boom = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(140, now);
      boom.frequency.exponentialRampToValueAtTime(32, now + 0.8);
      boomGain.gain.setValueAtTime(0.45, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      boom.connect(boomGain);
      boomGain.connect(this.ctx.destination);
      boom.start(now);
      boom.stop(now + 0.8);

      // Shimmer sweep
      const shimmer = this.ctx.createOscillator();
      const shimmerGain = this.ctx.createGain();
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(300, now + 0.1);
      shimmer.frequency.exponentialRampToValueAtTime(2400, now + 0.7);
      shimmerGain.gain.setValueAtTime(0.01, now + 0.1);
      shimmerGain.gain.linearRampToValueAtTime(0.2, now + 0.4);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(this.ctx.destination);
      shimmer.start(now + 0.1);
      shimmer.stop(now + 0.85);
    } catch (e) {
      console.warn('Audio open vault error', e);
    }
  }
}

window.soundEngine = new SoundEngine();
