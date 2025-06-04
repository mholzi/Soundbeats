/**
 * Soundbeats Lovelace Card
 * A custom card for the Soundbeats Home Assistant integration
 */

class SoundbeatsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
    this.render();
  }

  render() {
    const isAdmin = this.checkAdminPermissions();
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .soundbeats-card {
          background: var(--ha-card-background, var(--paper-card-background-color, white));
          border-radius: var(--ha-card-border-radius, 4px);
          box-shadow: var(--ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12));
          padding: 16px;
          margin: 8px 0;
        }
        
        .section {
          margin-bottom: 16px;
          padding: 12px;
          border-radius: 8px;
        }
        
        .title-section {
          background: var(--primary-color, #03a9f4);
          color: var(--text-primary-color, white);
          text-align: center;
        }
        
        .team-section {
          background: var(--secondary-background-color, #f5f5f5);
          border: 1px solid var(--divider-color, #e0e0e0);
        }
        
        .admin-section {
          background: var(--error-color, #f44336);
          color: var(--text-primary-color, white);
          display: ${isAdmin ? 'block' : 'none'};
        }
        
        .section h2 {
          margin: 0 0 8px 0;
          font-size: 1.2em;
          font-weight: 500;
        }
        
        .section h3 {
          margin: 0 0 8px 0;
          font-size: 1.1em;
          font-weight: 500;
        }
        
        .section p {
          margin: 0;
          line-height: 1.5;
        }
        
        .game-status {
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
          background: var(--success-color, #4caf50);
          color: white;
          display: inline-block;
        }
        
        .admin-controls {
          margin-top: 12px;
        }
        
        .admin-button {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 8px;
          transition: background 0.3s;
        }
        
        .admin-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .icon {
          margin-right: 8px;
        }
        
        .hidden {
          display: none !important;
        }
      </style>
      
      <div class="soundbeats-card">
        <!-- Title Section - Always visible -->
        <div class="section title-section">
          <h2>
            <ha-icon icon="mdi:music-note" class="icon"></ha-icon>
            Soundbeats Party Game
          </h2>
          <p>The ultimate Home Assistant party game experience!</p>
        </div>
        
        <!-- Team Section - Always visible -->
        <div class="section team-section">
          <h3>
            <ha-icon icon="mdi:account-group" class="icon"></ha-icon>
            Team Status
          </h3>
          <p>Current game status: <span class="game-status">${this.getGameStatus()}</span></p>
          <p>Players connected: ${this.getPlayerCount()}</p>
          <p>Game mode: ${this.getGameMode()}</p>
        </div>
        
        <!-- Admin Section - Only visible to admins -->
        <div class="section admin-section ${isAdmin ? '' : 'hidden'}">
          <h3>
            <ha-icon icon="mdi:shield-account" class="icon"></ha-icon>
            Admin Controls
          </h3>
          <p>Administrative controls for managing the Soundbeats game.</p>
          <div class="admin-controls">
            <button class="admin-button" onclick="this.getRootNode().host.startNewGame()">
              <ha-icon icon="mdi:play" class="icon"></ha-icon>
              Start a new Game
            </button>
            <button class="admin-button" onclick="this.getRootNode().host.nextSong()">
              <ha-icon icon="mdi:skip-next" class="icon"></ha-icon>
              Next Song
            </button>
          </div>
        </div>
      </div>
    `;
  }

  checkAdminPermissions() {
    // Check if admin is enabled in card configuration
    return this.config && this.config.admin === true;
  }

  getGameStatus() {
    // Get game status from the sensor entity
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_game_status'];
      return entity ? entity.state : 'Unknown';
    }
    return 'Ready';
  }

  getPlayerCount() {
    // Get player count (mock data for now)
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_game_status'];
      if (entity && entity.attributes && entity.attributes.player_count) {
        return entity.attributes.player_count;
      }
    }
    return '0';
  }

  getGameMode() {
    // Get game mode (mock data for now)
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_game_status'];
      if (entity && entity.attributes && entity.attributes.game_mode) {
        return entity.attributes.game_mode;
      }
    }
    return 'Classic';
  }

  startNewGame() {
    // Call service to start a new game
    if (this.hass) {
      this.hass.callService('soundbeats', 'start_game', {});
    }
  }

  nextSong() {
    // Call service to skip to next song
    if (this.hass) {
      this.hass.callService('soundbeats', 'next_song', {});
    }
  }

  set hass(hass) {
    this._hass = hass;
    // Re-render when hass changes to update dynamic content
    if (this.shadowRoot.innerHTML) {
      this.render();
    }
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return 3; // Card height in grid units
  }

  static getConfigElement() {
    return document.createElement('soundbeats-card-editor');
  }

  static getStubConfig() {
    return {};
  }
}

// Register the custom element
customElements.define('soundbeats-card', SoundbeatsCard);

// Register the card with Lovelace
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'soundbeats-card',
  name: 'Soundbeats Card',
  description: 'A card for the Soundbeats party game integration',
  preview: true,
});

console.info(
  '%c  SOUNDBEATS-CARD  \n%c  Version 1.0.0   ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);