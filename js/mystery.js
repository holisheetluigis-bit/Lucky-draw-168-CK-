// Interactive Mystery Box Unboxing Experience for Special Prize
// Unlocks Vespa 2025 or Honda ADV 750cc with dynamic reveal animations

class MysteryVaultManager {
  constructor() {
    this.modalEl = null;
    this.revealedPrize = null;
    this.isOpening = false;
  }

  init() {
    this.modalEl = document.getElementById('mystery-modal');
  }

  openVaultDialog() {
    this.init();
    if (!this.modalEl) return;

    this.revealedPrize = null;
    this.isOpening = false;

    // Reset view to closed glowing chest
    const container = document.getElementById('mystery-modal-content');
    if (container) {
      container.innerHTML = `
        <div class="mystery-box-stage">
          <div class="mystery-badge-glow">🌟 MYTHIC SPECIAL DROP 🌟</div>
          <h2 class="mystery-title">YOU UNLOCKED THE SPECIAL PRIZE!</h2>
          <p class="mystery-subtitle">A legendary machine awaits inside this sealed vault. Tap below to crack it open!</p>
          
          <div class="mystery-chest-wrapper" id="mystery-chest-target">
            <div class="chest-aura"></div>
            <img src="assets/images/mystery_box.jpg" alt="Mystery Vault Box" class="mystery-chest-img" />
            <div class="tap-hint-badge">
              <span class="finger-icon">👆</span> TAP TO OPEN
            </div>
          </div>

          <div class="mystery-prizes-preview">
            <span class="preview-label">Possible Contents:</span>
            <div class="preview-tags">
              <span class="tag vespa-tag">🛵 Vespa 2025 Super Sport</span>
              <span class="or-separator">OR</span>
              <span class="tag adv-tag">🏍️ Honda ADV 750cc Adventure</span>
            </div>
          </div>
        </div>
      `;

      const chestTarget = document.getElementById('mystery-chest-target');
      if (chestTarget) {
        chestTarget.onclick = () => this.triggerUnbox();
      }
    }

    if (window.soundEngine) {
      window.soundEngine.playMysteryChime();
    }

    this.modalEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  triggerUnbox() {
    if (this.isOpening) return;
    this.isOpening = true;

    const chestTarget = document.getElementById('mystery-chest-target');
    if (chestTarget) {
      chestTarget.classList.add('shaking-critical');
    }

    if (window.soundEngine) {
      window.soundEngine.playTick(1.5);
    }

    // Determine revealed vehicle (50% Vespa 2025, 50% Honda ADV 750cc)
    const options = ['vespa_2025', 'adv_750cc'];
    const selectedKey = options[Math.floor(Math.random() * options.length)];
    this.revealedPrize = window.SPECIAL_PRIZES[selectedKey];

    setTimeout(() => {
      if (window.soundEngine) {
        window.soundEngine.playOpenVault();
        window.soundEngine.playGrandWin();
      }
      if (window.app && typeof window.app.fireConfettiBurst === 'function') {
        window.app.fireConfettiBurst(60);
      }
      this.renderVehicleReveal(this.revealedPrize);
    }, 1300);
  }

  renderVehicleReveal(vehicle) {
    const container = document.getElementById('mystery-modal-content');
    if (!container) return;

    container.innerHTML = `
      <div class="reveal-stage animate-fade-scale">
        <div class="reveal-halo"></div>
        <div class="reveal-badge">🎉 SPECIAL PRIZE REVEALED! 🎉</div>
        <h2 class="vehicle-title">${vehicle.name}</h2>
        <div class="vehicle-edition-pill">${vehicle.specs.edition}</div>

        <div class="vehicle-showcase-frame">
          <img src="${vehicle.image}" alt="${vehicle.name}" class="vehicle-hero-img" />
          <div class="price-tag-floating">MSRP Value: ${vehicle.specs.msrp}</div>
        </div>

        <div class="specs-grid">
          <div class="spec-card">
            <span class="spec-icon">⚡</span>
            <div class="spec-info">
              <span class="spec-label">Engine / Power</span>
              <strong class="spec-val">${vehicle.specs.engine}</strong>
            </div>
          </div>
          <div class="spec-card">
            <span class="spec-icon">🛡️</span>
            <div class="spec-info">
              <span class="spec-label">Safety & Braking</span>
              <strong class="spec-val">${vehicle.specs.brakes || vehicle.specs.transmission}</strong>
            </div>
          </div>
          <div class="spec-card">
            <span class="spec-icon">🎨</span>
            <div class="spec-info">
              <span class="spec-label">Official Edition</span>
              <strong class="spec-val">${vehicle.specs.finish || vehicle.specs.driveModes}</strong>
            </div>
          </div>
        </div>

        <p class="claim-instruction-text">
          Congratulations! This vehicle has been reserved for you. Claim now to receive official registration & delivery paperwork!
        </p>

        <div class="reveal-action-row">
          <button class="claim-vehicle-btn" id="claim-special-vehicle-btn">
            <span>CLAIM ${vehicle.displayValue} NOW 🏆</span>
          </button>
        </div>
      </div>
    `;

    const claimBtn = document.getElementById('claim-special-vehicle-btn');
    if (claimBtn) {
      claimBtn.onclick = () => {
        this.closeModal();
        if (window.app && typeof window.app.handlePrizeWon === 'function') {
          window.app.handlePrizeWon(vehicle);
        }
      };
    }
  }

  closeModal() {
    if (this.modalEl) {
      this.modalEl.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

window.mysteryVaultManager = new MysteryVaultManager();
