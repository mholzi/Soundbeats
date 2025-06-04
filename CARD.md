# Soundbeats Lovelace Card

The Soundbeats integration automatically provides a custom Lovelace card for managing your party game.

## Card Features

The Soundbeats card displays three main sections:

### 1. Title Section (Always Visible)
- Displays the Soundbeats branding and description
- Visible to all users

### 2. Team Section (Always Visible)
- Shows current game status
- Displays player count
- Shows game mode
- Visible to all users

### 3. Admin Section (Admin Only)
- Administrative controls for managing the game
- Start, Stop, and Reset game buttons
- Only visible to users with admin privileges

## Usage

Once the Soundbeats integration is installed and configured, the card is automatically available in Lovelace without any additional setup.

### Adding the Card to Your Dashboard

1. Edit your Lovelace dashboard
2. Add a new card
3. Select "Custom: Soundbeats Card" from the card types
4. Save your dashboard

The card will automatically connect to your `sensor.soundbeats_game_status` entity and display real-time information.

### Admin Features

If you are logged in as an admin user, you will see additional controls to:
- **Start Game**: Begin a new game session
- **Stop Game**: End the current game session  
- **Reset Game**: Reset the game to its initial state

## No Additional Setup Required

The card is fully integrated into the custom integration and requires no additional configuration files, resources, or manual setup steps.