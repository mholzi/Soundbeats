# 🎵 Soundbeats: The Ultimate Home Assistant Party Game! 🚀

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![Version](https://img.shields.io/badge/version-v0.5.1-blue.svg)](https://github.com/mholzi/Soundbeats)

**Turn your smart home into a music trivia battleground!** 🎤 Soundbeats brings stunning, zero-config party gaming straight to your Home Assistant dashboard. Teams battle to guess song release years – install, play, and dominate in under 2 minutes!

![Soundbeats Gameplay GIF](https://via.placeholder.com/800x400.gif?text=GIF+of+Soundbeats+Gameplay)

---

## 🌟 Key Features

🎮 **Zero-Config Setup** - Install via HACS, add the card, play. No YAML, no hassle!
📱 **Interactive Splash Screen** - Guided setup gets your first game running in seconds
🏆 **Up to 5 Teams** - Epic music battles with automatic, persistent scoring
🎲 **High-Stakes Betting** - Double-or-nothing glory for confident teams!
📊 **Live Leaderboards** - Watch rankings shift in real-time

🎧 **Universal Player Support** - Works with ANY Home Assistant media player (Sonos, Google Cast, VLC, etc.)
🤖 **No Spotify Integration** - Just needs players that can handle Spotify URLs
🔧 **Powerful Admin Controls** - Manage teams, timers, and music from the card
🌐 **Multi-Language** - Fully translated English & German

🎨 **Stunning Mobile-First UI** - Premium design with animated notes and glowing effects
🎉 **Highscore Celebrations** - Automatic tracking with golden celebration banners
🔍 **Built-in Diagnostics** - Troubleshoot audio and scoring issues instantly

---

## 🚀 Quick Setup (2 Minutes!)

### Install via HACS
1. **Add Custom Repository** in HACS > Integrations: `https://github.com/mholzi/Soundbeats`
2. **Install Soundbeats** and **restart Home Assistant**
3. **Add Integration**: Settings > Devices & Services > "+ Add Integration" > "Soundbeats"
4. **Add Card**: Dashboard > Edit > "+ Add Card" > "Custom: Soundbeats Card"
5. **Configure & Play!** Follow the splash screen setup and click "Launch Game"

> **Tip**: If the card doesn't appear, manually add the resource at Settings > Dashboards > Resources: `/home_trivia_frontend_assets/home-trivia-card.js`

---

## 🎮 How to Play

**The ultimate music knowledge showdown with high-stakes betting!**

### Game Flow
1. **Team Up** - Create up to 5 teams and assign users
2. **Listen & Guess** - Mystery song plays, teams guess the release year (30s countdown)
3. **Bet or Play Safe** - Feeling confident? Hit "Place Bet" for double-or-nothing!
4. **Score & Climb** - Points awarded automatically, leaderboards update live

### Scoring
🥇 **Perfect Guess**: 20 points  
🥈 **Within ±2 Years**: 10 points  
🥉 **Within ±5 Years**: 5 points  
💸 **Miss**: 0 points

**Betting**: Win = **Double Points** | Lose = **Zero Points**

---

## 📱 Multi-Device Play

**Everyone gets their own secret controls!**

1. **Create Users**: Settings > People > Users (give them "User" permissions)
2. **Assign to Teams**: Use splash screen dropdowns to assign users to teams  
3. **Personal Gaming**: Each player sees only their team's controls when logged in

> **Pro-Tip**: Team 1 admin can click the QR code icon to help friends connect instantly!


---

## 🏆 Highscore System

**Automatic record tracking with golden celebration banners!**

📈 **Average Score** - Main highscore tracks best average per-round performance  
🎯 **Per-Round Records** - Individual round bests (Round 1, Round 2, etc.)  
🎉 **Animated Celebrations** - Golden banners for new records  
💾 **Persistent Data** - Survives Home Assistant restarts

---

## 🧪 Testing Features

**Developer & Demo Tools**

**Toggle Splash Screen**: Force splash screen for testing/demos
- **Usage**: Settings > Developer Tools > Services > `soundbeats.toggle_splash`
- **Cycles**: Missing config → Ready state → Normal behavior

---

## 🔧 Quick Fixes

**Card Missing?** Restart HA → Clear browser cache → Verify "Custom: Soundbeats Card" was added  
**No Audio?** Check media player supports Spotify URLs → Select player in settings → Check HA logs

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
