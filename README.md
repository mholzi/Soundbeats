# 🎵 Soundbeats: The Ultimate Home Assistant Party Game! 🚀

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![Version](https://img.shields.io/badge/version-v0.3-blue.svg)](https://github.com/mholzi/Soundbeats)

**Turn your smart home into a music trivia battleground!** 🎤 Soundbeats is a stunning, zero-configuration party game that integrates directly into your Home Assistant dashboard. Get ready for hours of fun as teams compete to guess the release year of your favorite songs.

From installation to gameplay in under two minutes, Soundbeats is designed for instant entertainment.

![Soundbeats Gameplay GIF](https://via.placeholder.com/800x400.gif?text=GIF+of+Soundbeats+Gameplay)

---

## 🌟 Key Features

### 🎮 Effortless Gameplay
* **✨ Zero-Config Setup**: Install via HACS, add the card, and play. No YAML, no complex file edits!
* **📱 Interactive Splash Screen**: A beautiful, guided setup gets your first game running in seconds.
* **🏆 Up to 5 Teams**: Engage in epic music battles with automatic, persistent scoring.
* **🎲 High-Stakes Betting**: Confident teams can bet their points for double-or-nothing glory!
* **📊 Live Leaderboards**: Watch rankings shift in real-time on a sleek, horizontally-scrolling scoreboard.

### 🔌 Seamless Integration
* **🎧 Works with ANY Player**: Fully compatible with any Home Assistant media player that supports Spotify playback (Sonos, Google Cast, VLC, etc.).
* **🤖 No Spotify Integration Needed**: Soundbeats handles all audio playback internally. Your media player just needs to be ableto play Spotify URLs.
* **🔧 Powerful Admin Controls**: Admins can manage teams, adjust the countdown timer, and control music playback directly from the card.
* **🌐 Multi-Language Support**: Fully translated in English and German.

### ✨ Stunning User Interface
* **🎨 Animated & Modern Design**: A premium, music-themed interface with animated notes, sound waves, and glowing effects.
* **📱 Mobile-First**: Perfectly designed for passing a phone or tablet around the party.
* **🎛️ Consistent Media Controls**: Perfectly aligned Next Song and volume buttons with uniform sizing and a visually prominent Next Song button featuring an eye-catching gradient design.
* **🎉 Highscore Celebrations**: Automatic tracking and celebratory banners for new all-time and per-round highscores.
* **🔍 Built-in Diagnostics**: Quickly troubleshoot highscore and audio issues with the integrated diagnostic panel.

---

## 🚀 Installation & Setup (2 Minutes!)

Getting the party started is incredibly simple.

### 1. Installation via HACS (Recommended)
1.  **Install HACS** (if you don't have it): [Visit HACS.xyz](https://hacs.xyz/)
2.  **Add Custom Repository**:
    * Go to HACS > Integrations.
    * Click the 3-dots in the top right and select "Custom repositories".
    * Add `https://github.com/mholzi/Soundbeats` with the category "Integration".
3.  **Install Soundbeats**: Find "Soundbeats" in the list and click "Install".
4.  **Restart Home Assistant**: Navigate to **Settings > System** and click **Restart**.

### 2. Add the Integration
1.  Go to **Settings > Devices & Services**.
2.  Click **+ Add Integration**.
3.  Search for **"Soundbeats"** and click it.
4.  A success message will appear. The integration is now ready!

### 3. Add the Card to Your Dashboard
1.  Open the dashboard you want to add the game to and click the 3-dots > **Edit Dashboard**.
2.  Click **+ Add Card** and search for **"Custom: Soundbeats Card"**.
3.  The interactive splash screen will appear. Configure your game settings (number of teams, audio player, user assignment) right from the UI.
4.  Click **Launch Game** and let the fun begin!

> **Note**: This card should register its resources automatically. If it doesn't appear, you may need to add it manually. Go to **Settings > Dashboards**, click the 3-dots menu, select **Resources**, click **+ Add Resource**, and enter the following:
> * **URL**: `/home_trivia_frontend_assets/home-trivia-card.js`
> * **Resource Type**: JavaScript Module

---

## 🎮 How to Play

Soundbeats is an addictive game of musical knowledge and high-stakes betting.

### Game Flow
1.  **Team Up**: The splash screen guides you to create up to 5 teams and assign Home Assistant users.
2.  **Guess the Song**: A mystery song plays. Teams have a configurable countdown (default: 30 seconds) to guess the release year using a slider.
3.  **Place Your Bets**: Feeling confident? Use the "Place Bet" button to go for double-or-nothing!
4.  **See the Results**: Points are awarded automatically based on accuracy.
5.  **Climb the Leaderboard**: Watch the team rankings update in real-time and battle for the top spot!

### Scoring System
* **🥇 Perfect Guess**: **20 points**
* **🥈 Within ±2 Years**: **10 points**
* **🥉 Within ±5 Years**: **5 points**
* **💸 More than 5 years off**: **0 points**

### Betting System
When a team places a bet:
* **Win (Perfect Guess)**: The points for the round are **doubled** (20 becomes 40!).
* **Lose (Any other guess)**: The team gets **0 points** for the round.

---

## 📱 Playing on Multiple Devices

Each player can use their own phone or tablet for a personalized experience! The Soundbeats card automatically shows controls only for the team assigned to the logged-in user.

Here’s how to set it up:

1.  **Create Users in Home Assistant**: Go to **Settings > People > Users** and create a separate user account for each player. It's best practice to give them "User" permissions, not "Administrator".
2.  **Assign Users to Teams**: On the Soundbeats splash screen, use the dropdown menu for each team to assign one of your newly created users.
3.  **Play on Separate Devices**: When your friends log in to Home Assistant on their own devices with their accounts, the Soundbeats card will only show them the controls for their assigned team, keeping everyone else's guesses private until the reveal!

> **Pro-Tip**: To help friends connect easily, the user with admin rights (assigned to Team 1) can click the QR code icon in the top-left of the card. This will display a QR code that other players can scan with their phones to instantly open your Home Assistant address in their browser.

---

## 🏆 The Highscore System

Soundbeats automatically tracks records with zero configuration.

* **Highest Average Score**: The primary highscore tracks the team with the best **average points per round** across a full game. This is the ultimate measure of consistent performance!
* **Per-Round Records**: The system also saves the highest absolute score achieved for each individual round (e.g., the best-ever score for Round 1, Round 2, etc.).
* **Celebration Banners**: Animated, golden banners automatically appear to celebrate when a new record is broken, adding to the excitement.
* **Data Persistence**: All highscores are saved and persist through Home Assistant restarts.

---

## 🔧 Troubleshooting

* **Card Not Appearing?**
    1.  **Restart Home Assistant** after installing.
    2.  **Clear Browser Cache**: Press `Ctrl + Shift + R` or `Cmd + Shift + R`.
    3.  Verify that you added the **"Custom: Soundbeats Card"** and not something else.
* **No Music Playing?**
    1.  **Check Player Support**: Ensure your selected media player can play Spotify URLs. Sonos, Chromecasts, and VLC are excellent choices.
    2.  **Select a Player**: Make sure an audio player is selected in the Game Settings section of the card. An alert banner will appear if you try to play a song without one.
    3.  **Check Logs**: Look at **Settings > System > Logs** for any related error messages.

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
