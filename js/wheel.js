// Canvas Wheel Engine with Realistic Physics, High-DPI, LED Ring & Mechanical Flapper

class LuckyWheel {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.slices = window.PRIZES || [];
    this.numSlices = this.slices.length;
    this.sliceAngle = (Math.PI * 2) / this.numSlices;

    this.currentAngle = 0;
    this.isSpinning = false;
    this.spinStartTime = 0;
    this.spinDuration = 5500; // 5.5 seconds
    this.startAngle = 0;
    this.targetAngle = 0;
    this.lastPegIndex = -1;

    this.flapperDeflection = 0; // Degrees deflection of pointer
    this.flapperVelocity = 0;

    this.pointerAngle = (Math.PI * 3) / 2; // 12 o'clock
    this.ledBlinkPhase = 0;

    this.onSpinStart = options.onSpinStart || (() => {});
    this.onSpinEnd = options.onSpinEnd || (() => {});

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setupInteractions();
    this.render();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const size = Math.min(parent.clientWidth, 480);
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    this.width = size;
    this.height = size;
    this.centerX = size / 2;
    this.centerY = size / 2;
    this.radius = size * 0.44;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.render();
  }

  setupInteractions() {
    // Click on canvas center hub spins
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - this.centerX;
      const dy = y - this.centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // If clicked inside center button or anywhere when not spinning
      if (!this.isSpinning) {
        this.spin();
      }
    });

    // Touch swipe support
    let touchStartY = 0;
    let touchStartX = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      if (this.isSpinning) return;
      if (e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 30) {
          this.spin();
        }
      }
    }, { passive: true });
  }

  spin(targetIndex = null) {
    if (this.isSpinning) return;

    this.isSpinning = true;
    this.onSpinStart();

    // Determine winning slice based on chances if not manually passed
    if (targetIndex === null) {
      targetIndex = this.selectWinningSliceIndex();
    }

    this.winningIndex = targetIndex;
    const winningSlice = this.slices[targetIndex];

    // Calculate target angle
    // At pointerAngle (12 o'clock, 3pi/2), the slice at angle index should be centered:
    // angle = pointerAngle - (index * sliceAngle + sliceAngle / 2)
    const baseOffset = this.pointerAngle - (targetIndex * this.sliceAngle + this.sliceAngle / 2);

    // Number of full revolutions (6 to 8 full spins for excitement)
    const fullRevolutions = 7 + Math.floor(Math.random() * 2);
    const jitter = (Math.random() - 0.5) * (this.sliceAngle * 0.4); // organic slight offset from exact center

    this.startAngle = this.currentAngle % (Math.PI * 2);
    this.targetAngle = this.startAngle + (fullRevolutions * Math.PI * 2) + ((baseOffset - this.startAngle) % (Math.PI * 2)) + jitter;
    if (this.targetAngle < this.startAngle + (fullRevolutions * Math.PI * 2)) {
      this.targetAngle += Math.PI * 2;
    }

    this.spinStartTime = performance.now();
    this.lastPegIndex = -1;
    this.animateSpin();
  }

  selectWinningSliceIndex() {
    // Weighted random selection
    const totalWeight = this.slices.reduce((sum, s) => sum + (s.chance || 0.1), 0);
    let randomVal = Math.random() * totalWeight;

    for (let i = 0; i < this.slices.length; i++) {
      if (randomVal < (this.slices[i].chance || 0.1)) {
        return i;
      }
      randomVal -= (this.slices[i].chance || 0.1);
    }
    return 0;
  }

  easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }

  animateSpin() {
    const now = performance.now();
    const elapsed = now - this.spinStartTime;
    const progress = Math.min(elapsed / this.spinDuration, 1);
    const eased = this.easeOutQuint(progress);

    this.currentAngle = this.startAngle + (this.targetAngle - this.startAngle) * eased;

    // Calculate peg collision with top pointer for mechanical audio & visual deflection
    const currentPeg = Math.floor(((this.pointerAngle - this.currentAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) / this.sliceAngle);
    if (currentPeg !== this.lastPegIndex && progress < 0.98) {
      this.lastPegIndex = currentPeg;
      const speedFactor = (1 - progress);
      if (window.soundEngine) {
        window.soundEngine.playTick(speedFactor);
      }
      this.flapperDeflection = 22 * speedFactor; // deflect flapper
    }

    // Spring back flapper needle
    this.flapperDeflection *= 0.82;
    this.updateFlapperVisual(this.flapperDeflection);

    // Blink LED bulbs around bezel
    this.ledBlinkPhase += 0.08 + (1 - progress) * 0.15;

    this.render();

    if (progress < 1) {
      requestAnimationFrame(() => this.animateSpin());
    } else {
      this.isSpinning = false;
      this.flapperDeflection = 0;
      this.updateFlapperVisual(0);
      const wonPrize = this.slices[this.winningIndex];
      this.onSpinEnd(wonPrize);
    }
  }

  updateFlapperVisual(degrees) {
    const flapperEl = document.getElementById('wheel-flapper');
    if (flapperEl) {
      flapperEl.style.transform = `rotate(${degrees}deg)`;
    }
  }

  render() {
    const ctx = this.ctx;
    const cx = this.centerX;
    const cy = this.centerY;
    const r = this.radius;

    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Outer Glowing Shadow and Bezel
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 24, 0, Math.PI * 2);
    ctx.fillStyle = '#07111e';
    ctx.shadowColor = '#0066FF';
    ctx.shadowBlur = 28;
    ctx.fill();
    ctx.restore();

    // Outer Metallic Ring
    ctx.save();
    const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ringGrad.addColorStop(0, '#FFA500'); // Gold/Orange
    ringGrad.addColorStop(0.3, '#00D084'); // Emerald Green
    ringGrad.addColorStop(0.7, '#0066FF'); // Electric Blue
    ringGrad.addColorStop(1, '#FFFFFF'); // Crisp White shine
    ctx.beginPath();
    ctx.arc(cx, cy, r + 18, 0, Math.PI * 2);
    ctx.lineWidth = 14;
    ctx.strokeStyle = ringGrad;
    ctx.stroke();
    ctx.restore();

    // 2. Draw LED Bulbs on Bezel
    const numLeds = 24;
    for (let i = 0; i < numLeds; i++) {
      const ledAngle = (i * (Math.PI * 2) / numLeds) + (this.isSpinning ? this.currentAngle * 0.2 : 0);
      const ledX = cx + Math.cos(ledAngle) * (r + 18);
      const ledY = cy + Math.sin(ledAngle) * (r + 18);

      const colorPhase = Math.floor((i + this.ledBlinkPhase) % 4);
      const ledColors = ['#00D084', '#FF6500', '#0066FF', '#FFFFFF'];
      const activeColor = ledColors[colorPhase];

      ctx.save();
      ctx.beginPath();
      ctx.arc(ledX, ledY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = activeColor;
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }

    // 3. Draw Slices
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.currentAngle);

    for (let i = 0; i < this.numSlices; i++) {
      const startA = i * this.sliceAngle;
      const endA = startA + this.sliceAngle;
      const midA = startA + this.sliceAngle / 2;
      const slice = this.slices[i];

      // Slice background with dynamic gradient
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, startA, endA);
      ctx.closePath();

      const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.12, slice.color);
      grad.addColorStop(1, slice.accentColor || slice.color);
      ctx.fillStyle = grad;
      ctx.fill();

      // Border between slices
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.stroke();
      ctx.restore();

      // Slice Content (Text & Icons)
      ctx.save();
      ctx.rotate(midA);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Icon / Emoji
      ctx.font = 'bold 20px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText(slice.icon, r * 0.88, 0);

      // Label text
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 6;
      ctx.font = '900 15px "Outfit", "Plus Jakarta Sans", -apple-system, sans-serif';
      ctx.fillText(slice.label, r * 0.72, 0);

      ctx.restore();

      // Pegs along the rim
      ctx.save();
      const pegAngle = startA;
      const pegX = Math.cos(pegAngle) * (r - 2);
      const pegY = Math.sin(pegAngle) * (r - 2);
      ctx.beginPath();
      ctx.arc(pegX, pegY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FFA500';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // restore wheel rotation

    // 4. Center Hub (SPIN Button)
    ctx.save();
    // Center Outer Shadow
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = '#061325';
    ctx.shadowColor = '#FF6500';
    ctx.shadowBlur = 18;
    ctx.fill();

    // Center Gold Bezel
    const centerGrad = ctx.createLinearGradient(cx - 40, cy - 40, cx + 40, cy + 40);
    centerGrad.addColorStop(0, '#FF6500');
    centerGrad.addColorStop(0.5, '#FFA500');
    centerGrad.addColorStop(1, '#00D084');

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.24, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = centerGrad;
    ctx.stroke();

    // Center Inner Core
    const innerGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, r * 0.22);
    innerGrad.addColorStop(0, '#0066FF');
    innerGrad.addColorStop(1, '#07162c');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = innerGrad;
    ctx.fill();

    // Center Text "SPIN"
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.shadowColor = '#00D2FF';
    ctx.shadowBlur = 10;
    ctx.fillText('SPIN', cx, cy - 2);

    ctx.font = 'bold 9px "Outfit", sans-serif';
    ctx.fillStyle = '#FFB703';
    ctx.fillText('168 LUCKY', cx, cy + 14);

    ctx.restore();
  }
}

window.LuckyWheel = LuckyWheel;
