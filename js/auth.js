// Authentication & Prize Claim Gate Manager for Lucky Draw 168

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.pendingPrize = null;
    this.storageUserKey = 'ld168_auth_user';
    this.storageUsersDbKey = 'ld168_registered_users_db';
    this.storageClaimsKey = 'ld168_all_claims';
    this.init();
  }

  init() {
    // Load active session
    const savedUser = localStorage.getItem(this.storageUserKey);
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        this.currentUser = null;
      }
    }

    // Initialize users database if empty
    if (!localStorage.getItem(this.storageUsersDbKey)) {
      const demoUsers = [
        {
          id: 'usr_demo_1',
          name: 'Vannak Chen',
          email: 'vannak@luckydraw168.com',
          phone: '+855 12 888 168',
          password: 'password123',
          deliveryAddress: 'Showroom Pickup - Phnom Penh Central',
          claimedPrizes: [
            {
              id: 'claim_demo_01',
              prizeId: 'cash_150',
              prizeName: '$150 Cash',
              type: 'cash',
              value: 150,
              icon: '🧧',
              voucherCode: 'LD168-CASH-78392',
              claimedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
              status: 'Disbursed (ABA Bank)'
            }
          ]
        }
      ];
      localStorage.setItem(this.storageUsersDbKey, JSON.stringify(demoUsers));
    }

    // Check for pending prize recovery
    const savedPending = localStorage.getItem('ld168_pending_prize');
    if (savedPending) {
      try {
        this.pendingPrize = JSON.parse(savedPending);
      } catch (e) {
        this.pendingPrize = null;
      }
    }

    this.updateHeaderUI();
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getAllUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.storageUsersDbKey)) || [];
    } catch (e) {
      return [];
    }
  }

  saveUserToDb(user) {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(this.storageUsersDbKey, JSON.stringify(users));
  }

  register(name, emailOrPhone, password, deliveryPref = 'Direct Bank Transfer / Pickup') {
    if (!name || !emailOrPhone || !password) {
      return { success: false, message: 'Please fill in all required fields.' };
    }

    const users = this.getAllUsers();
    const identifier = emailOrPhone.trim().toLowerCase();
    const exists = users.some(u => u.email.toLowerCase() === identifier || u.phone === identifier);
    
    if (exists) {
      return { success: false, message: 'An account with this email or phone already exists. Please sign in.' };
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: name.trim(),
      email: identifier.includes('@') ? identifier : `${identifier}@mobile.user`,
      phone: identifier.includes('@') ? '+855 16 999 888' : identifier,
      password: password,
      deliveryAddress: deliveryPref,
      registeredAt: new Date().toISOString(),
      claimedPrizes: []
    };

    users.push(newUser);
    localStorage.setItem(this.storageUsersDbKey, JSON.stringify(users));

    // Automatically login
    this.currentUser = newUser;
    localStorage.setItem(this.storageUserKey, JSON.stringify(newUser));
    this.updateHeaderUI();

    // Finalize pending prize claim if any
    let claimResult = null;
    if (this.pendingPrize) {
      claimResult = this.claimPrize(this.pendingPrize);
      this.clearPendingPrize();
    }

    return { 
      success: true, 
      user: newUser, 
      claimedPending: claimResult 
    };
  }

  login(emailOrPhone, password) {
    if (!emailOrPhone || !password) {
      return { success: false, message: 'Please enter your login identifier and password.' };
    }

    const users = this.getAllUsers();
    const identifier = emailOrPhone.trim().toLowerCase();
    const user = users.find(u => 
      (u.email.toLowerCase() === identifier || u.phone.toLowerCase() === identifier) && 
      u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid credentials. Please verify your phone/email and password.' };
    }

    this.currentUser = user;
    localStorage.setItem(this.storageUserKey, JSON.stringify(user));
    this.updateHeaderUI();

    // Finalize pending prize claim if any
    let claimResult = null;
    if (this.pendingPrize) {
      claimResult = this.claimPrize(this.pendingPrize);
      this.clearPendingPrize();
    }

    return { 
      success: true, 
      user: user, 
      claimedPending: claimResult 
    };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.storageUserKey);
    this.updateHeaderUI();
    if (window.app && typeof window.app.showNotification === 'function') {
      window.app.showNotification('Logged out successfully', 'info');
    }
  }

  setPendingPrize(prize) {
    this.pendingPrize = prize;
    localStorage.setItem('ld168_pending_prize', JSON.stringify(prize));
  }

  getPendingPrize() {
    return this.pendingPrize;
  }

  clearPendingPrize() {
    this.pendingPrize = null;
    localStorage.removeItem('ld168_pending_prize');
  }

  claimPrize(prize) {
    if (!this.currentUser) {
      this.setPendingPrize(prize);
      return {
        claimed: false,
        requiresAuth: true,
        prize: prize
      };
    }

    // Generate verified claim certificate
    const voucherCode = `LD168-${(prize.name || 'PRIZE').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-${Math.floor(10000 + Math.random() * 90000)}`;
    const claimRecord = {
      id: 'claim_' + Date.now(),
      prizeId: prize.id,
      prizeName: prize.name,
      type: prize.type,
      value: prize.value,
      displayValue: prize.displayValue || ('$' + prize.value),
      icon: prize.icon || '🎁',
      image: prize.image || null,
      specs: prize.specs || null,
      voucherCode: voucherCode,
      claimedAt: new Date().toISOString(),
      claimedBy: this.currentUser.name,
      userPhone: this.currentUser.phone,
      status: prize.type === 'vehicle' ? 'Pending Showroom Delivery' : 'Ready for ABA / Cash Payout'
    };

    if (!this.currentUser.claimedPrizes) {
      this.currentUser.claimedPrizes = [];
    }

    this.currentUser.claimedPrizes.unshift(claimRecord);
    localStorage.setItem(this.storageUserKey, JSON.stringify(this.currentUser));
    this.saveUserToDb(this.currentUser);
    this.clearPendingPrize();
    this.updateHeaderUI();

    return {
      claimed: true,
      requiresAuth: false,
      claim: claimRecord
    };
  }

  updateHeaderUI() {
    const userBadgeContainer = document.getElementById('user-profile-badge');
    const authBtn = document.getElementById('auth-action-btn');
    const walletCountBadge = document.getElementById('wallet-count-badge');
    const walletTotalValue = document.getElementById('wallet-total-value');

    const totalClaims = this.currentUser && this.currentUser.claimedPrizes ? this.currentUser.claimedPrizes.length : 0;
    const totalValue = this.currentUser && this.currentUser.claimedPrizes ? 
      this.currentUser.claimedPrizes.reduce((sum, item) => sum + (item.value || 0), 0) : 0;

    if (walletCountBadge) {
      walletCountBadge.textContent = totalClaims;
      walletCountBadge.style.display = totalClaims > 0 ? 'inline-flex' : 'none';
    }

    if (walletTotalValue) {
      walletTotalValue.textContent = '$' + totalValue.toLocaleString();
    }

    if (this.currentUser) {
      if (userBadgeContainer) {
        userBadgeContainer.innerHTML = `
          <div class="user-pill" id="open-wallet-pill">
            <span class="avatar-circle">👤</span>
            <div class="user-meta">
              <span class="user-name">${this.currentUser.name}</span>
              <span class="user-tier">Verified Player</span>
            </div>
            <button class="logout-btn" id="logout-trigger-btn" title="Sign Out">✕</button>
          </div>
        `;
        const logoutBtn = document.getElementById('logout-trigger-btn');
        if (logoutBtn) {
          logoutBtn.onclick = (e) => {
            e.stopPropagation();
            this.logout();
          };
        }
        const openPill = document.getElementById('open-wallet-pill');
        if (openPill) {
          openPill.onclick = () => {
            if (window.app && typeof window.app.openWalletDrawer === 'function') {
              window.app.openWalletDrawer();
            }
          };
        }
      }
      if (authBtn) {
        authBtn.style.display = 'none';
      }
    } else {
      if (userBadgeContainer) {
        userBadgeContainer.innerHTML = `
          <div class="guest-pill" id="guest-auth-trigger">
            <span class="guest-dot"></span>
            <span class="guest-label">Guest Player</span>
          </div>
        `;
        const guestTrigger = document.getElementById('guest-auth-trigger');
        if (guestTrigger) {
          guestTrigger.onclick = () => {
            if (window.app && typeof window.app.openAuthModal === 'function') {
              window.app.openAuthModal('login');
            }
          };
        }
      }
      if (authBtn) {
        authBtn.style.display = 'inline-flex';
        authBtn.innerHTML = `<span>Sign In / Register</span>`;
        authBtn.onclick = () => {
          if (window.app && typeof window.app.openAuthModal === 'function') {
            window.app.openAuthModal('register');
          }
        };
      }
    }
  }
}

window.authManager = new AuthManager();
