# YOINK.GG — Master Design System & Project Steering

> Auto-loaded by Kiro on every session. Generated from ui-ux-pro-max skill +
> project history. Do NOT override without explicit user instruction.

---

## Product Identity

**Name:** YOINK.GG  
**Type:** Crypto gambling platform — Player vs. House (PvH) engine with PvP feel  
**Stack:** React 19 + Vite + Tailwind v4 + Framer Motion + Supabase + Solana  
**Repo:** youssefalw2001/SlipAuto  
**Deploy:** GitHub Pages (auto-deploy on merge to `main`)

---

## Game Model (DO NOT change without explicit instruction)

- **Engine:** PvH — players yoink against a shared Arena Pool, not real wallets
- **Feel:** PvP — ghost wallets look and behave like real players
- **Revenue:** 10% rake off every entry (taken before RNG resolves)
- **House edge:** ~4% on pool payouts (sustains pool long-term)
- **Three outcome tiers:**
  - Regular Win (46%) — 1.4× bet — label: "YOINKED"
  - Big Win (5%) — 5× bet — label: "BIG YOINK"
  - Jackpot (1%) — 12× bet — label: "JACKPOT"
  - Loss (48%) — 0 — label: "ESCAPED"
- **Viral mechanic:** auto-share prompt on Big Win + Jackpot; live feed broadcasts jackpots to all players
- **Pool health:** min 10 SOL floor; max payout caps scale with pool size

---

## Design System (from ui-ux-pro-max + project history)

### Style
**Dark Mode (OLED)** — deep black base, gold as the single primary accent,
emerald for success, red only for loss/danger. Minimal glow. High contrast.
Cyberpunk UI secondary influence for the arena/game screens.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-y-base` | `#0a0a0f` | Page background |
| `--color-y-card` | `#0f1117` | Card fill |
| `--color-y-gold` | `#ffd700` | Primary accent — brand, CTAs, wins |
| `--color-y-gold-soft` | `#ffe266` | Hover / lighter gold |
| `--color-y-emerald` | `#00e676` | Success, live indicators |
| `--color-y-red` | `#ff1744` | Loss, danger, risk |
| `--color-y-violet` | `#7000ff` | Predator tier, mystery |
| `--color-y-cyan` | `#00f5ff` | Tech/data accents |
| `--color-y-blue` | `#4da3ff` | Info, neutral |
| `--color-y-muted` | `#8892a4` | Secondary text (Koinara slate) |
| `--color-y-dim` | `#3a3f4f` | Disabled / tertiary |

**Rules:**
- Gold = value, brand, wins. Never use gold for losses or warnings.
- Red = loss, danger, risk ONLY. Never use red for wins or brand moments.
- Orange (`#ff4d00`) is RETIRED — do not use.
- Bluish purple (`#6060a0`) is RETIRED — do not use. Use `#8892a4` instead.

### Typography

| Role | Font | Notes |
|---|---|---|
| Display / Headers | Space Grotesk 700 | Self-hosted via @fontsource |
| Body / UI | Space Grotesk 400/500 | Self-hosted via @fontsource |
| Numbers / Mono | JetBrains Mono 400/700 | All SOL amounts, wallet addresses |

**Rules:**
- Bebas Neue is RETIRED — do not re-introduce.
- DM Sans is RETIRED — do not re-introduce.
- All SOL balances and wallet addresses MUST use JetBrains Mono.
- Headers use Space Grotesk, NOT all-caps tracking unless intentional.

---

## Card & Component Patterns

### Premium Card (Koinara-style)
```css
border-radius: 24px;
border: 1px solid rgba(255,255,255,0.09);
background: linear-gradient(160deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(8,10,17,0.78);
box-shadow: 0 18px 48px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.08);
backdrop-filter: blur(14px); /* max 16px — higher causes jank */
```

### Gold-bordered card
Add `border-color: rgba(255,215,0,0.24)` and `box-shadow: ..., 0 0 28px rgba(255,215,0,0.10)`.

### PremiumIcon system
Use `<PremiumIcon icon={LucideIcon} tone={hexColor} size={N} rounded={N} />` for ALL icons
that previously were emojis. **No emojis allowed anywhere in the active app.**

### Wallet Cards (Arena tiers)
- Dust (<0.5 SOL): dashed zinc border, 60% opacity
- Common (0.5–1.5 SOL): emerald border + glow
- Predator (1.5–3 SOL): violet/cyan dual border, animated glow
- King (3+ SOL): gold/red border, flame particles, pulse animation

---

## Performance Rules

- `backdrop-filter` blur max: **16px** on hero cards, **14px** on regular cards, **NONE** on wallet cards or small chrome
- `mix-blend-mode` on full-screen layers: **PROHIBITED** (causes full recomposite every frame)
- Continuous `box-shadow` animations: add `will-change: transform` to GPU-promote
- Perpetual spinning/scrolling elements: add `will-change: transform`
- `prefers-reduced-motion`: must be respected — disable all perpetual animations
- Film grain: hidden on mobile (performance), no blend mode on desktop

---

## Layout & UX Rules (from ui-ux-pro-max)

- No emojis as icons — use Lucide SVG icons always
- `cursor-pointer` on all clickable elements
- Hover states: smooth transitions 150–300ms
- Focus states visible for keyboard nav
- Responsive breakpoints: 375px, 768px, 1024px, 1440px
- `prefers-reduced-motion` respected on all animations
- Light backgrounds: **prohibited** — this is always dark mode

---

## Page Structure

### Landing (`/` default)
- Single viewport. No scrolling walls of text.
- Badge → Wordmark → One-line hook → Single CTA → Slim stat strip → 3-step icons
- Ambient: soft gold radial pool + slow-rotating crosshair ring (CSS only)
- Chrome (LiveFeed, GlobalStats) hidden on landing

### Arena (`/yoink`)
- Slim arena bar (LIVE badge, hunters count, stolen SOL, rounds) — NOT a hero
- No explainer cards in the Arena — those live on Landing
- Wallet grid leads immediately
- Attack panel on the right (desktop) / sticky bottom bar (mobile)

### Pages
- Crates, Wheel, Leaderboard, Referrals: full Koinara premium-card style
- Each page has a `PremiumIcon` section header

---

## Navigation

- Logo click → Landing page
- Nav: **Arena | Crates | Leaderboard | Referrals** (4 items — Swap Wheel removed)
- "NEW" badge: gold background, dark text
- Active nav: gold underline glow
- Mobile: slide-down overlay, same gold active state

---

## Git / PR Rules

- **Never push to `main` directly** — always branch → PR → merge
- Branch naming: `feat/`, `visual/`, `perf/`, `fix/`
- After user merges a PR, always create a **new branch** for the next batch of work
- GitHub Pages deploys automatically on merge to `main`
- Build must pass (`npm run build`) before any PR is opened

---

## What NOT to Do

- Do not modify `useEffect` hooks handling data fetching
- Do not modify `onClick` handlers triggering transactions
- Do not modify Supabase queries or schema without explicit instruction
- Do not reuse a merged PR branch — always open a new one
- Do not use orange `#ff4d00` — it's retired in favor of gold
- Do not use emoji in any active component
- Do not add `mix-blend-mode` to full-screen fixed layers
- Do not stack more than 3 `backdrop-filter` blur elements visible simultaneously

---

## Current Open Work

- **PR #22** (feat/landing-and-arena-focus) — may still be open, check before branching
- **Next build:** Arena Pool backend — ghost wallet generator, pool accounting, rake split, jackpot tier resolver
- **After that:** Jackpot reveal upgrade, auto-share prompt, live feed broadcasting

---

## Quick Reference — SOL Revenue Math

```
Daily revenue = depositors × actions × avg_bet × (rake + edge)
             = 500 × 8 × 0.3 × (10% + 4%)
             = 500 × 8 × 0.3 × 0.14
             = 168 SOL/day (~$25,200/day at $150 SOL)
```

Seed capital needed: ~10 SOL. Max payout capped at 2 SOL at launch.
