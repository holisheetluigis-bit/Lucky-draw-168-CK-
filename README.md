# Lucky Draw 168 Portfolio Web Application

An interactive, responsive Lucky Draw Portfolio Website featuring dynamic canvas wheel physics, guest-to-registration claim gate, $1 - $1,500 cash prizes, Ford Raptor 2025 grand prize, and an interactive 3D Mystery Vault unbox for Vespa 2025 and Honda ADV 750cc.

## Features
- **Wheel Draw Engine**: HTML5 high-DPI canvas wheel with realistic deceleration physics, LED ring, and mechanical flapper pointer deflection.
- **Audio Synthesizer**: Native Web Audio API synthesizer for peg ticking, win fanfares, and mystery box bass drops (100% self-contained, no external MP3 dependencies).
- **Guest Registration & Claim Gate**: Visitors can spin freely as guests; winning triggers a reserved pending claim state requiring registration or login to disburse to permanent wallet.
- **Prize Pool**:
  - Cash Tiers: $1, $10, $50, $150, $500, and $1,500 Diamond Cash.
  - Grand Prize: Ford Raptor 2025 (Electric Blue Off-road Super Truck).
- **Special Mystery Prize**: Unlocks the 3D Mystery Vault, shaking and revealing either a **Vespa 2025 Super Sport** or a **Honda ADV 750cc (2025)** with complete specifications and MSRP.
- **Color Theme**: Curated palette with Royal Blue, Neon Orange, Emerald Green, and Crisp White.
- **Mobile Friendly**: Touch swipe spin gestures, fluid typography (`clamp()`), and responsive drawers.

## Tech Stack
- HTML5, CSS3 (Vanilla CSS with CSS Variables & Glassmorphism)
- Vanilla JavaScript (ES6+ Classes & Modules)
- Web Audio API & HTML5 Canvas
- Node.js local server

## Getting Started
```bash
# Run the local server
node server.js
```
Open [http://localhost:4168](http://localhost:4168) in your browser.
