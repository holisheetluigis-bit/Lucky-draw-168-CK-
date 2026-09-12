// Main Application Coordinator for Lucky Draw 168

class App {
  constructor() {
    this.wheel = null;
    this.confettiCanvas = null;
    this.confettiCtx = null;
    this.particles = [];
    this.isConfettiActive = false;

    this.spinsRemaining = parseInt(localStorage.getItem('ld168_spins') || '5', 10);
    this.init();
  }

  init() {
    this.setupConfetti();
    this.setupWheel();
    this.setupUI();
    this.renderPrizeGallery('all');
    this.startLiveWinnersFeed();
    this.updateSpinsDisplay();
  }

  setupWheel() {
    this.wheel = new window.LuckyWheel('wheel-canvas', {
      onSpinStart: () => {
        const spinBtn = document.getElementById('main-spin-btn');
        if (spinBtn) spinBtn.disabled = true;
        this.updateSpinsDisplay();
      },
      onSpinEnd: (prize) => {
        const spinBtn = document.getElementById('main-spin-btn');
        if (spinBtn) spinBtn.disabled = false;
        this.onWheelLanded(prize);
      }
    });

    const spinBtn = document.getElementById('main-spin-btn');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        if (this.spinsRemaining <= 0) {
          this.showBonusSpinPrompt();
          return;
        }
        this.spinsRemaining--;
        localStorage.setItem('ld168_spins', this.spinsRemaining);
        this.updateSpinsDisplay();
        this.wheel.spin();
      });
    }

    // Spacebar shortcut
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        if (spinBtn && !spinBtn.disabled) {
          spinBtn.click();
        }
      }
    });
  }

  updateSpinsDisplay() {
    const counterEl = document.getElementById('spins-left-count');
    if (counterEl) {
      counterEl.textContent = this.spinsRemaining;
    }
  }

  showBonusSpinPrompt() {
    this.showNotification('🎁 Daily spins refreshed! +3 Free Spins added!', 'success');
    this.spinsRemaining = 3;
    localStorage.setItem('ld168_spins', this.spinsRemaining);
    this.updateSpinsDisplay();
  }

  onWheelLanded(prize) {
    if (prize.isSpecial) {
      // Mystery Vault Special Prize: opens Vespa or ADV 750cc reveal
      window.mysteryVaultManager.openVaultDialog();
    } else {
      this.handlePrizeWon(prize);
    }
  }

  handlePrizeWon(prize) {
    // Sound & Confetti
    if (prize.type === 'vehicle' || prize.value >= 500) {
      if (window.soundEngine) window.soundEngine.playGrandWin();
      this.fireConfettiBurst(75);
    } else {
      if (window.soundEngine) window.soundEngine.playFanfare();
      this.fireConfettiBurst(45);
    }

    // Check Authentication state
    if (window.authManager.isLoggedIn()) {
      // User is logged in: claim directly into wallet!
      const claimResult = window.authManager.claimPrize(prize);
      this.showClaimSuccessModal(claimResult.claim);
    } else {
      // User is NOT logged in: Gate the claim! Prompt registration!
      window.authManager.setPendingPrize(prize);
      this.openAuthClaimModal(prize);
    }
  }

  openAuthClaimModal(prize) {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    // Show pending prize banner in the modal
    const banner = document.getElementById('auth-pending-prize-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.innerHTML = `
        <div class="pending-prize-card">
          <div class="pending-icon">${prize.icon || '🎁'}</div>
          <div class="pending-info">
            <span class="pending-label">PRIZE RESERVED FOR YOU:</span>
            <strong class="pending-name">${prize.name}</strong>
            <span class="pending-val">${prize.displayValue || ('$' + prize.value)}</span>
          </div>
        </div>
        <p class="pending-notice">⚠️ <strong>Action Required:</strong> Create your account or sign in now to verify ownership and claim this prize to your wallet!</p>
      `;
    }

    this.switchAuthTab('register');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  openAuthModal(defaultTab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    const banner = document.getElementById('auth-pending-prize-banner');
    if (banner) {
      banner.style.display = 'none';
    }

    this.switchAuthTab(defaultTab);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  switchAuthTab(tab) {
    const regTabBtn = document.getElementById('tab-register-btn');
    const loginTabBtn = document.getElementById('tab-login-btn');
    const regForm = document.getElementById('register-form-view');
    const loginForm = document.getElementById('login-form-view');

    if (tab === 'register') {
      regTabBtn?.classList.add('active');
      loginTabBtn?.classList.remove('active');
      if (regForm) regForm.style.display = 'block';
      if (loginForm) loginForm.style.display = 'none';
    } else {
      loginTabBtn?.classList.add('active');
      regTabBtn?.classList.remove('active');
      if (loginForm) loginForm.style.display = 'block';
      if (regForm) regForm.style.display = 'none';
    }
  }

  showClaimSuccessModal(claim) {
    const modal = document.getElementById('claim-success-modal');
    if (!modal) return;

    const container = document.getElementById('claim-success-details');
    if (container) {
      const isVehicle = claim.type === 'vehicle';
      container.innerHTML = `
        <div class="claim-certificate-card">
          <div class="cert-watermark">VERIFIED 168</div>
          <div class="cert-header">
            <span class="cert-badge">OFFICIAL WINNER CERTIFICATE</span>
            <span class="cert-date">${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
          </div>

          <div class="cert-body">
            <div class="cert-prize-display">
              ${claim.image ? `<img src="${claim.image}" alt="${claim.prizeName}" class="cert-img" />` : `<div class="cert-emoji">${claim.icon}</div>`}
              <div class="cert-title-group">
                <h3 class="cert-title">${claim.prizeName}</h3>
                <span class="cert-value">${claim.displayValue}</span>
              </div>
            </div>

            <div class="cert-meta-grid">
              <div class="meta-item">
                <span class="meta-lbl">Winner Name:</span>
                <strong class="meta-val">${claim.claimedBy}</strong>
              </div>
              <div class="meta-item">
                <span class="meta-lbl">Voucher Code:</span>
                <strong class="meta-val code-highlight">${claim.voucherCode}</strong>
              </div>
              <div class="meta-item">
                <span class="meta-lbl">Claim Status:</span>
                <strong class="meta-val text-green">● ${claim.status}</strong>
              </div>
              <div class="meta-item">
                <span class="meta-lbl">Delivery / Payout:</span>
                <strong class="meta-val">${isVehicle ? 'VIP Showroom Handover' : 'Instant ABA Bank / Cash'}</strong>
              </div>
            </div>
          </div>

          <div class="cert-instructions">
            <p>📌 This prize is saved to your account wallet. Our agent will verify your voucher code for physical handover or instant digital transfer.</p>
          </div>
        </div>
      `;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeClaimSuccessModal() {
    const modal = document.getElementById('claim-success-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  openWalletDrawer() {
    const drawer = document.getElementById('wallet-drawer');
    if (!drawer) return;

    const user = window.authManager.getCurrentUser();
    const listContainer = document.getElementById('wallet-claims-list');
    const userNameEl = document.getElementById('wallet-user-name');
    const userPhoneEl = document.getElementById('wallet-user-phone');

    if (user && userNameEl) {
      userNameEl.textContent = user.name;
      userPhoneEl.textContent = user.phone || user.email;
    }

    if (listContainer) {
      const claims = (user && user.claimedPrizes) ? user.claimedPrizes : [];
      if (claims.length === 0) {
        listContainer.innerHTML = `
          <div class="wallet-empty-state">
            <div class="empty-icon">🎟️</div>
            <h4>No prizes claimed yet</h4>
            <p>Spin the lucky wheel now to win cash prizes, vehicles, and special mystery awards!</p>
          </div>
        `;
      } else {
        listContainer.innerHTML = claims.map(c => `
          <div class="wallet-item-card">
            <div class="item-left">
              <span class="item-icon">${c.icon || '🎁'}</span>
            </div>
            <div class="item-center">
              <h4 class="item-title">${c.prizeName}</h4>
              <span class="item-val">${c.displayValue}</span>
              <span class="item-code">Code: <code>${c.voucherCode}</code></span>
            </div>
            <div class="item-right">
              <span class="status-pill ${c.type === 'vehicle' ? 'vehicle' : 'cash'}">${c.status}</span>
            </div>
          </div>
        `).join('');
      }
    }

    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeWalletDrawer() {
    const drawer = document.getElementById('wallet-drawer');
    if (drawer) {
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  renderPrizeGallery(filter = 'all') {
    const container = document.getElementById('prize-gallery-grid');
    if (!container) return;

    let items = [...window.PRIZES];
    // Also include Vespa & ADV for full transparency
    const specialVehicles = Object.values(window.SPECIAL_PRIZES);

    let displayItems = [];
    if (filter === 'cash') {
      displayItems = items.filter(p => p.type === 'cash');
    } else if (filter === 'vehicle') {
      displayItems = [
        items.find(p => p.id === 'ford_raptor'),
        ...specialVehicles
      ].filter(Boolean);
    } else {
      displayItems = [
        ...items.filter(p => !p.isSpecial),
        ...specialVehicles
      ];
    }

    container.innerHTML = displayItems.map(item => `
      <div class="prize-card ${item.rarity.toLowerCase()} animate-card">
        <div class="prize-card-badge">${item.rarity.toUpperCase()}</div>
        ${item.image ? `
          <div class="prize-card-img-wrap">
            <img src="${item.image}" alt="${item.name}" loading="lazy" class="prize-card-img" />
          </div>
        ` : `
          <div class="prize-card-icon-wrap" style="background: radial-gradient(circle, ${item.color}33, transparent)">
            <span class="huge-emoji">${item.icon}</span>
          </div>
        `}
        <div class="prize-card-body">
          <h3 class="prize-card-title">${item.name}</h3>
          <div class="prize-card-val">${item.displayValue}</div>
          <p class="prize-card-desc">${item.description}</p>
          ${item.specs ? `
            <div class="prize-quick-specs">
              <span>⚡ ${item.specs.engine || item.specs.horsepower}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  setupUI() {
    // Sound Toggle
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.innerHTML = window.soundEngine.isMuted ? '🔇' : '🔊';
      soundBtn.addEventListener('click', () => {
        const isMuted = window.soundEngine.toggleMute();
        soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
      });
    }

    // Modal Close Buttons
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAuthModal();
        this.closeClaimSuccessModal();
        this.closeWalletDrawer();
        window.mysteryVaultManager?.closeModal();
      });
    });

    // Wallet trigger
    const openWalletBtn = document.getElementById('nav-wallet-btn');
    if (openWalletBtn) {
      openWalletBtn.addEventListener('click', () => this.openWalletDrawer());
    }

    // Mobile sticky triggers
    const mobileSpinBtn = document.getElementById('mobile-spin-trigger-btn');
    if (mobileSpinBtn) {
      mobileSpinBtn.addEventListener('click', () => {
        const heroSpinBtn = document.getElementById('main-spin-btn');
        if (heroSpinBtn && !heroSpinBtn.disabled) {
          heroSpinBtn.click();
          const wheelEl = document.querySelector('.wheel-stadium');
          if (wheelEl) wheelEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    const mobileWalletBtn = document.getElementById('mobile-wallet-trigger-btn');
    if (mobileWalletBtn) {
      mobileWalletBtn.addEventListener('click', () => this.openWalletDrawer());
    }

    // Tab buttons in Auth Modal
    document.getElementById('tab-register-btn')?.addEventListener('click', () => this.switchAuthTab('register'));
    document.getElementById('tab-login-btn')?.addEventListener('click', () => this.switchAuthTab('login'));

    // Registration Form Submit
    const regForm = document.getElementById('register-form-element');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const phoneOrEmail = document.getElementById('reg-identifier').value;
        const password = document.getElementById('reg-password').value;
        const deliveryPref = document.getElementById('reg-delivery').value;

        const res = window.authManager.register(name, phoneOrEmail, password, deliveryPref);
        if (res.success) {
          this.closeAuthModal();
          this.showNotification(`🎉 Welcome, ${res.user.name}! Your account is active.`, 'success');
          if (res.claimedPending && res.claimedPending.claimed) {
            this.showClaimSuccessModal(res.claimedPending.claim);
          }
        } else {
          this.showAuthError('reg-error-msg', res.message);
        }
      });
    }

    // Login Form Submit
    const loginForm = document.getElementById('login-form-element');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phoneOrEmail = document.getElementById('login-identifier').value;
        const password = document.getElementById('login-password').value;

        const res = window.authManager.login(phoneOrEmail, password);
        if (res.success) {
          this.closeAuthModal();
          this.showNotification(`👋 Welcome back, ${res.user.name}!`, 'success');
          if (res.claimedPending && res.claimedPending.claimed) {
            this.showClaimSuccessModal(res.claimedPending.claim);
          }
        } else {
          this.showAuthError('login-error-msg', res.message);
        }
      });
    }

    // Demo Instant Login Button for Testing
    document.getElementById('demo-quick-login-btn')?.addEventListener('click', () => {
      const res = window.authManager.login('vannak@luckydraw168.com', 'password123');
      if (res.success) {
        this.closeAuthModal();
        this.showNotification(`Logged in as demo user ${res.user.name}`, 'success');
        if (res.claimedPending && res.claimedPending.claimed) {
          this.showClaimSuccessModal(res.claimedPending.claim);
        }
      }
    });

    // Gallery Filter Tabs
    document.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const filter = e.currentTarget.dataset.filter;
        this.renderPrizeGallery(filter);
      });
    });

    // Test Mystery Box Button directly in Hero for portfolio exploration
    document.getElementById('demo-test-mystery-btn')?.addEventListener('click', () => {
      window.mysteryVaultManager.openVaultDialog();
    });

    // Test Raptor Spin Button for portfolio demo
    document.getElementById('demo-test-raptor-btn')?.addEventListener('click', () => {
      const raptorIdx = window.PRIZES.findIndex(p => p.id === 'ford_raptor');
      if (raptorIdx >= 0) {
        this.wheel.spin(raptorIdx);
      }
    });
  }

  showAuthError(elementId, msg) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }

  showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }

  startLiveWinnersFeed() {
    const feedTrack = document.getElementById('live-winners-track');
    if (!feedTrack) return;

    const sampleWinners = [
      { name: 'Sopheap T.', prize: 'Vespa 2025 Super Sport', time: '1m ago', flag: '🇰🇭' },
      { name: 'Alex K.', prize: '$500 Cash', time: '2m ago', flag: '🇰🇭' },
      { name: 'Dara C.', prize: '$1,500 Cash', time: '4m ago', flag: '🇰🇭' },
      { name: 'Borin H.', prize: 'Honda ADV 750cc', time: '7m ago', flag: '🇰🇭' },
      { name: 'Chanthy P.', prize: '$50 Cash', time: '9m ago', flag: '🇰🇭' },
      { name: 'Vannak M.', prize: 'Ford Raptor 2025', time: '12m ago', flag: '🇰🇭' },
      { name: 'Piseth R.', prize: '$150 Cash', time: '15m ago', flag: '🇰🇭' }
    ];

    feedTrack.innerHTML = sampleWinners.map(w => `
      <div class="winner-ticker-pill">
        <span class="winner-flag">${w.flag}</span>
        <strong class="winner-name">${w.name}</strong>
        <span class="winner-won">won</span>
        <span class="winner-prize-name">${w.prize}</span>
        <span class="winner-time">${w.time}</span>
      </div>
    `).join('');
  }

  setupConfetti() {
    this.confettiCanvas = document.getElementById('confetti-canvas');
    if (!this.confettiCanvas) return;
    this.confettiCtx = this.confettiCanvas.getContext('2d');

    const resizeConfetti = () => {
      this.confettiCanvas.width = window.innerWidth;
      this.confettiCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeConfetti);
    resizeConfetti();
  }

  fireConfettiBurst(count = 50) {
    if (!this.confettiCanvas || !this.confettiCtx) return;

    const colors = ['#0066FF', '#00D084', '#FF6500', '#FFA500', '#FFFFFF', '#00D2FF'];
    const w = this.confettiCanvas.width;
    const h = this.confettiCanvas.height;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: w / 2,
        y: h * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    if (!this.isConfettiActive) {
      this.isConfettiActive = true;
      this.renderConfetti();
    }
  }

  renderConfetti() {
    if (!this.confettiCtx) return;
    const ctx = this.confettiCtx;
    ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98;
      p.rotation += p.rotSpeed;
      p.alpha -= 0.009;

      if (p.alpha <= 0 || p.y > this.confettiCanvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.renderConfetti());
    } else {
      this.isConfettiActive = false;
      ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
    }
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
