# 🏟️ SOL Arena

> **Provably Fair Solana Gambling Platform**
> Live at: [https://youssefalw2001.github.io/SlipAuto/](https://youssefalw2001.github.io/SlipAuto/)

---

## Games

### ⚡ The Surge
Players deposit SOL into a shared pot. Every deposit resets a countdown timer by 30 seconds. When the timer hits zero:
- **Last 10 depositors** split 70% of the pot
- **Top single depositor** wins 20%
- **House fee**: 10% (auto-sent to owner wallet)

### ⚔️ SOL Wars
Red Team vs Blue Team battles every hour. Pick a side and deposit any amount of SOL. The team with the most SOL wins — winners split the entire losing team's pot.
- **Winners share**: 90% of total pot
- **House fee**: 10% (auto-sent to owner wallet)

---

## Platform Features

| Feature | Description |
|---|---|
| 🔴 Live Win Feed | Real-time scrolling ticker of all wins |
| 🏆 Leaderboard | Daily / Weekly / All-Time with SOL prizes |
| 👥 Referrals | Earn 1% of every referee bet forever |
| 📱 Mobile Ready | Fully responsive on all screen sizes |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Build | Vite 6 |
| Icons | Lucide React |
| Deploy | GitHub Pages (auto via Actions) |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deployment

Deployed automatically to GitHub Pages on every push to `main` via GitHub Actions.

**Manual trigger:** Go to Actions tab → "Deploy SOL Arena to GitHub Pages" → Run workflow

---

## Roadmap

- [ ] Solana wallet adapter integration (Phantom, Backpack)
- [ ] On-chain smart contracts (Anchor/Rust)
- [ ] Real-time pot updates via WebSocket RPC
- [ ] Provably fair randomness (Switchboard VRF)
- [ ] Custom domain

---

## License

MIT
