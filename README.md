# 🎵 Soundbeats
**The Ultimate Home Assistant Party Game! 🎉**

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

Transform your Home Assistant into the perfect party companion! Soundbeats is a fully-featured music guessing game that's ready to rock in minutes. Teams compete to guess song release years with an absolutely gorgeous, animated UI that's included right out of the box.

**✨ Zero Setup Required** • **🎨 Stunning UI Included** • **🏆 Automatic Scoring** • **📱 Mobile Optimized**

---

## 🚀 Quick Installation

### Method 1: HACS (Recommended)
The easiest way to get started!

1. Install [HACS](https://hacs.xyz/) if you haven't already
2. Go to **HACS → Integrations**
3. Click the **⋮** menu → **Custom repositories**
4. Add `https://github.com/mholzi/Soundbeats` as **Integration**
5. Click **Install** and restart Home Assistant
6. Go to **Settings → Devices & Services → Add Integration**
7. Search for **"Soundbeats"** and add it!

### Method 2: Manual Installation
For the adventurous!

1. Download the `custom_components/soundbeats` folder
2. Copy to your `custom_components` directory
3. Restart Home Assistant
4. Add the integration via **Settings → Devices & Services**

---

## 🎯 How the Game Works

**Simple, addictive, and automatic!**

🎵 **Play Song** → ⏰ **30-Second Timer** → 🎯 **Guess the Year** → 🏆 **Auto-Scoring**

### Scoring System
- **🥇 20 points** - Exact year match
- **🥈 10 points** - Within 2 years  
- **🥉 5 points** - Within 5 years
- **💔 0 points** - More than 5 years off

### Special Features
- **🎲 Betting System** - Double or nothing on your guesses!
- **🏆 Live Rankings** - See who's winning in real-time
- **📈 Persistent Highscores** - Track all-time and per-round records
- **🎨 Stunning Animations** - Musical notes, sound waves, and celebration effects
- **📱 Mobile Perfect** - Looks amazing on phones, tablets, and desktop

## 🎮 Ready to Play in 3 Steps!

### Step 1: Add the Card
1. Open any Lovelace dashboard
2. Click **+ Add Card**
3. Search for **"Custom: Soundbeats Card"**
4. Add it - done! 🎉

### Step 2: Set Up Your Teams
1. **Create Home Assistant users** for each team (Settings → People)
   - ⚠️ **Important**: Only manually created users work (not auto-generated "Home Assistant" users)
2. **Assign teams** in the admin panel - each user sees only their assigned teams!
3. **Each user gets their own personalized experience** - no interference between teams

### Step 3: Start Playing!
1. **Connect a Spotify-enabled media player** (required for music playback)
2. Click **"Start New Game"** in the admin section
3. Hit **"Next Song"** and let the musical mayhem begin! 🎵

**That's it!** No YAML, no configuration files, no manual setup. Just pure party fun! 

---

## ✨ What Makes It Special

### 🎨 Gorgeous UI Included
No setup needed! The beautiful Lovelace card includes:
- **Animated header** with floating musical notes and sound waves
- **Personal team views** - each user only sees their own teams
- **Real-time leaderboards** with gold/silver/bronze styling
- **Admin controls** for game management (if you're an admin)
- **Mobile optimized** responsive design

### 👥 Smart Team Management
- **User-based teams** - assign teams to manually created Home Assistant users
- **Personal experience** - each user sees only their assigned teams
- **No interference** between different users/teams
- **⚠️ Important**: Teams can only be linked to manually created users, not auto-generated "Home Assistant" users

### 🎵 Media Player Requirements
- **Spotify-enabled media player required** for music playback
- Works with Spotify integration, Sonos, Chromecast, and more
- **Automatic song management** - no manual playlist setup needed

---

## 🔧 Quick Troubleshooting

### Card Not Showing Up?
- Restart Home Assistant after installation
- Clear browser cache and refresh
- Make sure you're adding **"Custom: Soundbeats Card"**

### Music Not Playing?
- **Check media player**: Ensure you have a Spotify-enabled media player selected
- **Check connection**: Verify your media player has internet access
- **Try different player**: Some players support different audio formats

### Teams Not Working?
- **User setup**: Teams can only be assigned to manually created Home Assistant users (not auto-generated ones)
- **Restart**: Try restarting Home Assistant if teams don't appear
- **Check assignment**: Make sure teams are properly assigned to users in the admin panel

### Still Having Issues?
Check the built-in debug section at the bottom of the card for detailed diagnostic information!

---

## 💬 Feedback & Support

Love Soundbeats? Having issues? We want to hear from you!

### 🐛 Found a Bug?
[Open an issue on GitHub](https://github.com/mholzi/Soundbeats/issues) - we fix them fast!

### 💡 Have an Idea?
Got a cool feature request? Share it in our [GitHub Issues](https://github.com/mholzi/Soundbeats/issues) - we love new ideas!

### 🌟 Enjoying the Game?
- ⭐ Star us on [GitHub](https://github.com/mholzi/Soundbeats)
- 🗣️ Tell your friends about Soundbeats
- 📱 Share screenshots of your epic parties!

### 📧 Need Help?
- Check the troubleshooting section above
- Look at the built-in debug info in the card
- [Create a support request](https://github.com/mholzi/Soundbeats/issues) with details

**We respond quickly and love making Soundbeats better for everyone!** 🎉

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Ready to turn your Home Assistant into the ultimate party machine? Install Soundbeats now and let the music games begin! 🎵🎉**
