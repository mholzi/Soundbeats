/**
 * Soundbeats Lovelace Card
 * A custom card for the Soundbeats Home Assistant integration
 */

class SoundbeatsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // Initialize expander state - both sections collapsed by default
    this.gameSettingsExpanded = false;
    this.teamManagementExpanded = false;
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
          margin: 8px;
        }
        
        .section {
          margin-bottom: 16px;
          padding: 12px;
          border-radius: 8px;
        }
        
        .title-section {
          background: linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, rgba(3, 169, 244, 0.8) 50%, var(--accent-color, #ff5722) 100%);
          color: var(--text-primary-color, white);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .title-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
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

        
        .teams-container {
          margin-top: 16px;
        }
        
        .team-item {
          background: var(--card-background-color, white);
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 8px;
          margin-bottom: 12px;
          overflow: hidden;
        }
        
        .team-header {
          background: linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, rgba(3, 169, 244, 0.8) 50%, var(--accent-color, #ff5722) 100%);
          color: var(--text-primary-color, white);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          min-height: 38px;
        }
        
        /* Ranking-based header colors */
        .team-header.rank-1 {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%);
          color: #000;
        }
        
        .team-header.rank-2 {
          background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 50%, #909090 100%);
          color: #000;
        }
        
        .team-header.rank-3 {
          background: linear-gradient(135deg, #CD7F32 0%, #B8860B 50%, #A0522D 100%);
          color: #fff;
        }
        
        .team-header.rank-other {
          background: linear-gradient(135deg, #6c757d 0%, #5a6268 50%, #495057 100%);
          color: #fff;
        }
        
        .rank-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          margin-right: 12px;
          position: relative;
          z-index: 2;
          flex-shrink: 0;
        }
        
        .rank-badge ha-icon {
          color: #333;
          --mdc-icon-size: 24px;
        }
        
        .team-header.rank-1 .rank-badge {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
        }
        
        .team-header.rank-2 .rank-badge {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 8px rgba(192, 192, 192, 0.5);
        }
        
        .team-header.rank-3 .rank-badge {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 8px rgba(205, 127, 50, 0.5);
        }
        
        .team-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .team-content {
          padding: 12px 16px;
          background: var(--card-background-color, #f8f9fa);
          border-top: 1px solid var(--divider-color, #e0e0e0);
        }
        
        .team-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 200px;
        }
        
        .team-name {
          font-weight: 500;
          position: relative;
          z-index: 1;
          flex: 1;
        }
        
        .team-header.rank-1 .team-name,
        .team-header.rank-2 .team-name {
          color: #000;
        }
        
        .team-header.rank-3 .team-name,
        .team-header.rank-other .team-name {
          color: var(--text-primary-color, white);
        }
        
        .team-points {
          background: rgba(255, 255, 255, 0.2);
          color: var(--text-primary-color, white);
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.9em;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          z-index: 1;
        }
        
        .team-header.rank-1 .team-points,
        .team-header.rank-2 .team-points {
          background: rgba(0, 0, 0, 0.1);
          color: #000;
          border: 1px solid rgba(0, 0, 0, 0.2);
        }
        
        .team-header.rank-3 .team-points,
        .team-header.rank-other .team-points {
          background: rgba(255, 255, 255, 0.2);
          color: var(--text-primary-color, white);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .team-participating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.9em;
          color: var(--secondary-text-color);
        }
        
        .year-guess-section {
          margin-top: 8px;
        }
        
        .year-guess-label {
          display: block;
          font-weight: 500;
          color: var(--primary-text-color);
          margin-bottom: 8px;
          font-size: 0.9em;
        }
        
        .year-guess-control {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .year-slider {
          flex: 1;
          height: 6px;
          background: var(--divider-color, #e0e0e0);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }
        
        .year-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: var(--primary-color, #03a9f4);
          border-radius: 50%;
          cursor: pointer;
        }
        
        .year-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: var(--primary-color, #03a9f4);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        
        .year-value {
          min-width: 50px;
          text-align: center;
          font-weight: 500;
          color: var(--primary-color, #03a9f4);
          font-size: 0.9em;
        }
        
        .betting-section {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        
        .bet-button {
          background: var(--primary-color, #03a9f4);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9em;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          text-transform: uppercase;
        }
        
        .bet-button:hover {
          background: var(--primary-color-dark, #0288d1);
          transform: translateY(-1px);
        }
        
        .bet-button.betting-active {
          background: var(--warning-color, #ff9800);
          animation: pulse-betting 2s infinite;
        }
        
        .bet-button.betting-active:hover {
          background: var(--warning-color-dark, #f57c00);
        }
        
        @keyframes pulse-betting {
          0%, 100% { 
            box-shadow: 0 0 5px var(--warning-color, #ff9800);
          }
          50% { 
            box-shadow: 0 0 15px var(--warning-color, #ff9800);
          }
        }
        
        .betting-info {
          font-size: 0.8em;
          color: var(--warning-color, #ff9800);
          font-weight: bold;
        }
        
        .bet-result-section {
          margin-top: 12px;
        }
        
        .no-song-message {
          margin-top: 12px;
          padding: 12px;
          text-align: center;
          font-style: italic;
          color: var(--secondary-text-color, #666);
          background: var(--secondary-background-color, #f5f5f5);
          border-radius: 8px;
        }
        
        .bet-result {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 8px;
        }
        
        .bet-result.bet-win {
          background: var(--success-color, #4caf50);
          color: white;
        }
        
        .bet-result.bet-loss {
          background: var(--error-color, #f44336);
          color: white;
        }
        
        .result-icon {
          font-size: 1.5em;
        }
        
        .result-text {
          flex: 1;
        }
        
        .result-details {
          font-size: 0.9em;
          opacity: 0.9;
          margin-top: 4px;
        }
        
        .result-info {
          padding: 8px;
          background: var(--divider-color, #e0e0e0);
          border-radius: 4px;
          font-size: 0.9em;
          text-align: center;
        }
        
        .team-controls {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        
        .team-input {
          padding: 4px 8px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
          font-size: 0.9em;
          width: 80px;
        }
        
        .team-button {
          padding: 4px 8px;
          background: var(--primary-color, #03a9f4);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8em;
        }
        
        .team-button:hover {
          background: var(--primary-color-dark, #0288d1);
        }
        
        .participating-checkbox {
          margin-right: 4px;
        }
        
        .team-management-item {
          background: var(--card-background-color, white);
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .team-management-info {
          display: flex;
          align-items: center;
          min-width: 80px;
        }
        
        .team-management-label {
          font-weight: 500;
          color: var(--primary-text-color);
        }
        
        .team-management-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          flex: 1;
        }
        
        .participation-control {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--primary-text-color);
          cursor: pointer;
        }
        
        .game-settings {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .setting-label {
          font-weight: 500;
          color: var(--primary-text-color);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .setting-control {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .timer-slider {
          flex: 1;
          height: 6px;
          background: var(--divider-color, #e0e0e0);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }
        
        .timer-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: var(--primary-color, #03a9f4);
          border-radius: 50%;
          cursor: pointer;
        }
        
        .timer-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: var(--primary-color, #03a9f4);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        
        .timer-value {
          min-width: 60px;
          text-align: center;
          font-weight: 500;
          color: var(--primary-color, #03a9f4);
        }
        
        .audio-player-select {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
          background: var(--card-background-color, white);
          color: var(--primary-text-color);
          font-size: 14px;
        }
        
        .countdown-section {
          background: var(--warning-color, #ff9800);
          color: var(--text-primary-color, white);
          text-align: center;
          position: relative;
        }
        
        .countdown-timer {
          font-size: 2em;
          font-weight: bold;
          margin: 8px 0;
        }
        
        .countdown-progress {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          overflow: hidden;
          margin: 8px 0;
        }
        
        .countdown-progress-bar {
          height: 100%;
          background: var(--text-primary-color, white);
          transition: width 1s linear;
        }
        
        .song-section {
          background: linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, rgba(3, 169, 244, 0.1) 100%);
          border: 2px solid var(--primary-color, #03a9f4);
        }
        
        .song-card {
          text-align: center;
          padding: 16px;
        }
        
        .song-image {
          width: 150px;
          height: 150px;
          border-radius: 8px;
          margin: 0 auto 16px;
          display: block;
          object-fit: cover;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .song-name {
          font-size: 1.5em;
          font-weight: bold;
          margin: 8px 0;
          color: var(--primary-text-color);
        }
        
        .song-artist {
          font-size: 1.2em;
          margin: 8px 0;
          color: var(--secondary-text-color);
        }
        
        .song-year {
          font-size: 1.1em;
          font-weight: bold;
          margin: 8px 0;
          color: var(--primary-color, #03a9f4);
        }

        .expandable-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
        }

        .expandable-header:hover {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          margin: -4px;
          padding: 4px;
        }

        .expander-icon {
          transition: transform 0.3s ease;
          font-size: 1.2em;
        }

        .expander-icon.expanded {
          transform: rotate(180deg);
        }

        .expandable-content {
          overflow: hidden;
          transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
        }

        .expandable-content.collapsed {
          max-height: 0;
          opacity: 0;
        }

        .expandable-content.expanded {
          max-height: 1000px;
          opacity: 1;
        }
        
        /* Teams Overview Section Styles */
        .teams-overview-section {
          background: linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, rgba(3, 169, 244, 0.05) 100%);
          border: 1px solid var(--primary-color, #03a9f4);
        }
        
        .overview-description {
          font-size: 0.9em;
          color: var(--secondary-text-color, #666);
          margin-bottom: 12px;
          font-style: italic;
        }
        
        .teams-overview-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .overview-team-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 8px;
          background: var(--card-background-color, white);
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        
        .overview-team-item.rank-1 {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
          color: #1A1A1A;
          border-color: #FFD700;
          box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
        }
        
        .overview-team-item.rank-2 {
          background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 50%, #808080 100%);
          color: #1A1A1A;
          border-color: #C0C0C0;
          box-shadow: 0 4px 8px rgba(192, 192, 192, 0.3);
        }
        
        .overview-team-item.rank-3 {
          background: linear-gradient(135deg, #CD7F32 0%, #B8860B 50%, #A0522D 100%);
          color: white;
          border-color: #CD7F32;
          box-shadow: 0 4px 8px rgba(205, 127, 50, 0.3);
        }
        
        .overview-team-item.rank-other {
          background: linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 50%, #D0D0D0 100%);
          color: var(--primary-text-color, #333);
          border-color: #E0E0E0;
        }
        
        .overview-rank-badge {
          margin-right: 12px;
          font-size: 1.5em;
          display: flex;
          align-items: center;
        }
        
        .overview-team-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .overview-team-name {
          font-weight: bold;
          font-size: 1.1em;
        }
        
        .overview-team-points {
          font-weight: bold;
          font-size: 1em;
        }
        
        .overview-team-badges {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .overview-bet-badge {
          background: var(--warning-color, #ff9800);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 4px;
          animation: pulse-bet-overview 2s infinite;
        }
        
        @keyframes pulse-bet-overview {
          0%, 100% { 
            box-shadow: 0 0 5px var(--warning-color, #ff9800);
          }
          50% { 
            box-shadow: 0 0 15px var(--warning-color, #ff9800);
          }
        }
        
        .overview-guess-info {
          font-size: 0.9em;
          color: var(--secondary-text-color, #666);
          font-style: italic;
        }
        
        .overview-empty {
          text-align: center;
          padding: 20px;
          color: var(--secondary-text-color, #666);
          font-style: italic;
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
        
        <!-- Countdown Section - Only visible when timer is running -->
        <div class="section countdown-section ${this.getCountdownCurrent() > 0 ? '' : 'hidden'}">
          <h3>
            <ha-icon icon="mdi:timer-sand" class="icon"></ha-icon>
            Song Timer
          </h3>
          <div class="countdown-timer">${this.getCountdownCurrent()}s</div>
          <div class="countdown-progress">
            <div class="countdown-progress-bar" style="width: ${this.getCountdownProgressPercent()}%"></div>
          </div>
        </div>
        
        <!-- Song Section - Only visible when countdown is 0 and song is selected -->
        <div class="section song-section ${this.getCountdownCurrent() === 0 && this.getCurrentSong() && this.getRoundCounter() > 0 ? '' : 'hidden'}">
          <h3>
            <ha-icon icon="mdi:music" class="icon"></ha-icon>
            Current Song
          </h3>
          ${this.getCurrentSong() ? `
            <div class="song-card">
              <img src="${this.getCurrentSong().entity_picture}" alt="Song Cover" class="song-image" />
              <div class="song-name">${this.getCurrentSong().song_name}</div>
              <div class="song-artist">${this.getCurrentSong().artist}</div>
              <div class="song-year">${this.getCurrentSong().year}</div>
            </div>
          ` : ''}
        </div>
        
        <!-- Teams Overview Section - Always visible -->
        <div class="section teams-overview-section">
          <h3>
            <ha-icon icon="mdi:trophy-outline" class="icon"></ha-icon>
            Teams Overview
          </h3>
          <p class="overview-description">
            ${this.getCountdownCurrent() > 0 ? 'Leaderboard during guessing round' : this.getRoundCounter() > 0 ? 'Final results from last round' : 'Teams ready for next game'}
          </p>
          
          <div class="teams-overview-container">
            ${this.renderOtherTeamsOverview()}
          </div>
        </div>
        
        <!-- Team Section - Always visible -->
        <div class="section team-section">
          <h3>
            <ha-icon icon="mdi:account-group" class="icon"></ha-icon>
            Team Status
          </h3>
          
          <div class="teams-container">
            ${this.renderTeams()}
          </div>
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

        <!-- Game Settings Section - Only visible to admins -->
        <div class="section admin-section ${isAdmin ? '' : 'hidden'}">
          <div class="expandable-header" onclick="this.getRootNode().host.toggleGameSettings()">
            <h3>
              <ha-icon icon="mdi:cog" class="icon"></ha-icon>
              Game Settings
            </h3>
            <ha-icon icon="mdi:chevron-down" class="expander-icon ${this.gameSettingsExpanded ? 'expanded' : ''}"></ha-icon>
          </div>
          <div class="expandable-content ${this.gameSettingsExpanded ? 'expanded' : 'collapsed'}">
            <p>Configure game settings that persist across resets.</p>
            <div class="game-settings">
              <div class="setting-item">
                <div class="setting-label">
                  <ha-icon icon="mdi:timer-outline" class="icon"></ha-icon>
                  Countdown Timer Length
                </div>
                <div class="setting-control">
                  <input 
                    type="range" 
                    class="timer-slider" 
                    min="5" 
                    max="300" 
                    step="5" 
                    value="${this.getCountdownTimerLength()}"
                    oninput="this.getRootNode().host.updateCountdownTimerLength(this.value); this.nextElementSibling.textContent = this.value + 's';"
                  />
                  <span class="timer-value">${this.getCountdownTimerLength()}s</span>
                </div>
              </div>
              <div class="setting-item">
                <div class="setting-label">
                  <ha-icon icon="mdi:speaker" class="icon"></ha-icon>
                  Audio Player
                </div>
                <div class="setting-control">
                  <select 
                    class="audio-player-select" 
                    onchange="this.getRootNode().host.updateAudioPlayer(this.value)"
                  >
                    <option value="">Select an audio player...</option>
                    ${this.getMediaPlayers().map(player => 
                      `<option value="${player.entity_id}" ${this.getSelectedAudioPlayer() === player.entity_id ? 'selected' : ''}>
                        ${player.name}
                      </option>`
                    ).join('')}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Management Section - Only visible to admins -->
        <div class="section admin-section ${isAdmin ? '' : 'hidden'}">
          <div class="expandable-header" onclick="this.getRootNode().host.toggleTeamManagement()">
            <h3>
              <ha-icon icon="mdi:account-group-outline" class="icon"></ha-icon>
              Team Management
            </h3>
            <ha-icon icon="mdi:chevron-down" class="expander-icon ${this.teamManagementExpanded ? 'expanded' : ''}"></ha-icon>
          </div>
          <div class="expandable-content ${this.teamManagementExpanded ? 'expanded' : 'collapsed'}">
            <p>Configure team names and participation status.</p>
            <div class="team-management-container">
              ${this.renderTeamManagement()}
            </div>
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



  getGameMode() {
    // Get game mode from the dedicated sensor entity
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_game_mode'];
      return entity ? entity.state : 'Classic';
    }
    return 'Classic';
  }

  getRoundCounter() {
    // Get round counter from the dedicated sensor entity
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_round_counter'];
      return entity ? parseInt(entity.state, 10) : 0;
    }
    return 0;
  }

  getTeams() {
    // Get teams data from individual team sensor entities
    if (this.hass && this.hass.states) {
      const teams = {};
      for (let i = 1; i <= 5; i++) {
        const teamKey = `team_${i}`;
        const entityId = `sensor.soundbeats_team_${i}`;
        const entity = this.hass.states[entityId];
        if (entity) {
          teams[teamKey] = {
            name: entity.state,
            points: entity.attributes && entity.attributes.points !== undefined ? entity.attributes.points : 0,
            participating: entity.attributes && entity.attributes.participating !== undefined ? entity.attributes.participating : true,
            year_guess: entity.attributes && entity.attributes.year_guess !== undefined ? entity.attributes.year_guess : 1990,
            betting: entity.attributes && entity.attributes.betting !== undefined ? entity.attributes.betting : false,
            last_round_betting: entity.attributes && entity.attributes.last_round_betting !== undefined ? entity.attributes.last_round_betting : false
          };
        } else {
          // Fallback to default if entity doesn't exist yet
          teams[teamKey] = {
            name: `Team ${i}`,
            points: 0,
            participating: true,
            year_guess: 1990,
            betting: false,
            last_round_betting: false
          };
        }
      }
      return teams;
    }
    // Return default teams if no data available
    const defaultTeams = {};
    for (let i = 1; i <= 5; i++) {
      const teamKey = `team_${i}`;
      defaultTeams[teamKey] = {
        name: `Team ${i}`,
        points: 0,
        participating: true,
        year_guess: 1990,
        betting: false,
        last_round_betting: false
      };
    }
    return defaultTeams;
  }

  getTeamRankings() {
    // Calculate team rankings based on points among participating teams
    const teams = this.getTeams();
    const participatingTeams = Object.entries(teams)
      .filter(([teamId, team]) => team.participating)
      .map(([teamId, team]) => ({ teamId, ...team }))
      .sort((a, b) => b.points - a.points); // Sort by points descending
    
    const rankings = {};
    let medalRank = 1; // Tracks current medal level (1=gold, 2=silver, 3=bronze)
    let lastPoints = null;
    
    participatingTeams.forEach((team) => {
      // If points changed, advance to next medal level
      if (lastPoints !== null && team.points !== lastPoints) {
        medalRank++;
      }
      
      // Cap medal rank at 3 (bronze), everything else gets rank 4+ for 'rank-other'
      rankings[team.teamId] = medalRank <= 3 ? medalRank : 4;
      lastPoints = team.points;
    });
    
    return rankings;
  }

  renderTeamManagement() {
    const teams = this.getTeams();
    
    return Object.entries(teams).map(([teamId, team]) => `
      <div class="team-management-item" data-team="${teamId}">
        <div class="team-management-info">
          <span class="team-management-label">Team ${teamId.split('_')[1]}:</span>
        </div>
        <div class="team-management-controls">
          <input type="text" class="team-input" placeholder="Team Name" value="${team.name}" 
                 oninput="this.getRootNode().host.updateTeamName('${teamId}', this.value)">
          <label class="participation-control">
            <input type="checkbox" class="participating-checkbox" ${team.participating ? 'checked' : ''} 
                   onchange="this.getRootNode().host.updateTeamParticipating('${teamId}', this.checked)">
            <span>Active</span>
          </label>
        </div>
      </div>
    `).join('');
  }

  renderTeams() {
    const teams = this.getTeams();
    const rankings = this.getTeamRankings();
    const isCountdownRunning = this.getCountdownCurrent() > 0;
    const currentYear = new Date().getFullYear();
    const currentRound = this.getRoundCounter();
    
    return Object.entries(teams)
      .filter(([teamId, team]) => team.participating)
      .map(([teamId, team]) => {
        const rank = rankings[teamId] || 0;
        // If round counter is 0, all teams use rank-other background
        const rankClass = currentRound === 0 ? 'rank-other' :
                         rank === 1 ? 'rank-1' : 
                         rank === 2 ? 'rank-2' : 
                         rank === 3 ? 'rank-3' : 'rank-other';
        const rankIcon = `mdi:numeric-${rank}-circle`;
        
        return `
      <div class="team-item" data-team="${teamId}">
        <div class="team-header ${rankClass}">
          <div class="rank-badge">
            <ha-icon icon="${rankIcon}"></ha-icon>
          </div>
          <span class="team-name">${team.name}</span>
          <span class="team-points">${team.points} pts</span>
        </div>
        <div class="team-content">
          ${isCountdownRunning ? `
            <div class="year-guess-section">
              <label class="year-guess-label">Guess the year this song was published:</label>
              <div class="year-guess-control">
                <input type="range" class="year-slider" min="1950" max="${currentYear}" value="${team.year_guess}" 
                       oninput="this.nextElementSibling.textContent = this.value; this.getRootNode().host.updateTeamYearGuess('${teamId}', this.value)">
                <span class="year-value">${team.year_guess}</span>
              </div>
              <div class="betting-section">
                <button class="bet-button ${team.betting ? 'betting-active' : ''}" 
                        onclick="this.getRootNode().host.toggleTeamBetting('${teamId}', ${!team.betting})">
                  <ha-icon icon="mdi:${team.betting ? 'cards-diamond' : 'cards-diamond-outline'}" class="icon"></ha-icon>
                  ${team.betting ? 'BETTING!' : 'Place Bet'}
                </button>
                ${team.betting ? '<span class="betting-info">Win: 20pts | Lose: 0pts</span>' : ''}
              </div>
            </div>
          ` : this.getRoundCounter() === 0 ? `
            <div class="no-song-message">No Song played yet.</div>
          ` : this.getCurrentSong() ? `
            <div class="bet-result-section">
              ${this.renderBetResult(teamId, team)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
      }).join('');
  }

  updateTeamName(teamId, name) {
    // Call service to update team name
    if (this.hass && name.trim()) {
      this.hass.callService('soundbeats', 'update_team_name', {
        team_id: teamId,
        name: name.trim()
      });
    }
  }

  updateTeamPoints(teamId, points) {
    // Call service to update team points
    if (this.hass && !isNaN(points)) {
      this.hass.callService('soundbeats', 'update_team_points', {
        team_id: teamId,
        points: parseInt(points, 10)
      });
    }
  }

  updateTeamParticipating(teamId, participating) {
    // Call service to update team participating status
    if (this.hass) {
      this.hass.callService('soundbeats', 'update_team_participating', {
        team_id: teamId,
        participating: participating
      });
      
      // Trigger immediate UI refresh to hide/show team cards
      setTimeout(() => {
        this.recreateTeamsSection();
      }, 100);
    }
  }

  updateTeamYearGuess(teamId, yearGuess) {
    // Call service to update team year guess
    if (this.hass) {
      this.hass.callService('soundbeats', 'update_team_year_guess', {
        team_id: teamId,
        year_guess: parseInt(yearGuess, 10)
      });
    }
  }

  toggleTeamBetting(teamId, betting) {
    // Call service to toggle team betting
    if (this.hass) {
      this.hass.callService('soundbeats', 'update_team_betting', {
        team_id: teamId,
        betting: betting
      });
    }
  }

  renderBetResult(teamId, team) {
    const currentSong = this.getCurrentSong();
    if (!currentSong || !currentSong.year) {
      return '';
    }
    
    const songYear = parseInt(currentSong.year, 10);
    const teamGuess = team.year_guess;
    const wasBetting = team.last_round_betting;
    
    if (!wasBetting) {
      return `<div class="result-info">Guess: ${teamGuess} | Actual: ${songYear}</div>`;
    }
    
    const wasCorrect = Math.abs(songYear - teamGuess) === 0;
    
    return `
      <div class="bet-result ${wasCorrect ? 'bet-win' : 'bet-loss'}">
        <ha-icon icon="mdi:${wasCorrect ? 'trophy' : 'close-circle'}" class="result-icon"></ha-icon>
        <div class="result-text">
          <strong>${wasCorrect ? 'BET WON!' : 'BET LOST!'}</strong>
          <div class="result-details">
            Your guess: ${teamGuess} | Actual year: ${songYear}
            <br>Points earned: ${wasCorrect ? '20' : '0'}
          </div>
        </div>
      </div>
    `;
  }

  renderOtherTeamsOverview() {
    const teams = this.getTeams();
    const rankings = this.getTeamRankings();
    const isCountdownRunning = this.getCountdownCurrent() > 0;
    const currentRound = this.getRoundCounter();
    
    // Get all participating teams sorted by points descending
    const sortedTeams = Object.entries(teams)
      .filter(([teamId, team]) => team.participating)
      .map(([teamId, team]) => ({ teamId, ...team }))
      .sort((a, b) => b.points - a.points);
    
    if (sortedTeams.length === 0) {
      return '<div class="overview-empty">No participating teams</div>';
    }
    
    return sortedTeams.map((team, index) => {
      const rank = rankings[team.teamId] || (index + 1);
      const rankClass = currentRound === 0 ? 'rank-other' :
                       rank === 1 ? 'rank-1' : 
                       rank === 2 ? 'rank-2' : 
                       rank === 3 ? 'rank-3' : 'rank-other';
      const rankIcon = `mdi:numeric-${rank}-circle`;
      
      return `
        <div class="overview-team-item ${rankClass}">
          <div class="overview-rank-badge">
            <ha-icon icon="${rankIcon}"></ha-icon>
          </div>
          <div class="overview-team-info">
            <span class="overview-team-name">${team.name}</span>
            <span class="overview-team-points">${team.points} pts</span>
          </div>
          <div class="overview-team-badges">
            ${isCountdownRunning && team.betting ? `
              <div class="overview-bet-badge">
                <ha-icon icon="mdi:cards-diamond"></ha-icon>
                <span>BETTING</span>
              </div>
            ` : ''}
            ${!isCountdownRunning && currentRound > 0 ? `
              <div class="overview-guess-info">
                Guess: ${team.year_guess}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
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

  getCountdownTimerLength() {
    // Get countdown timer length from the dedicated sensor entity
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_countdown_timer'];
      if (entity && entity.state !== undefined) {
        return parseInt(entity.state, 10);
      }
    }
    return 30; // Default value
  }

  getCountdownCurrent() {
    // Get current countdown value from the dedicated sensor entity
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_countdown_current'];
      if (entity && entity.state !== undefined) {
        return parseInt(entity.state, 10);
      }
    }
    return 0; // Default value
  }

  getCountdownProgressPercent() {
    // Calculate countdown progress as percentage
    const current = this.getCountdownCurrent();
    const total = this.getCountdownTimerLength();
    if (total <= 0) return 0;
    return Math.round((current / total) * 100);
  }

  getCurrentSong() {
    // Get current song information with year and url exclusively from sensor, media info from media player
    if (this.hass && this.hass.states) {
      const currentSongEntity = this.hass.states['sensor.soundbeats_current_song'];
      if (currentSongEntity && currentSongEntity.attributes) {
        // Always get year and url from sensor attributes (exclusive source)
        const year = currentSongEntity.attributes.year || '';
        const url = currentSongEntity.attributes.url || '';
        
        // Get media player info if available
        let song_name = 'Unknown Title';
        let artist = 'Unknown Artist';
        let entity_picture = '';
        
        if (currentSongEntity.state !== 'None') {
          const mediaPlayerEntityId = currentSongEntity.state;
          const mediaPlayerEntity = this.hass.states[mediaPlayerEntityId];
          
          if (mediaPlayerEntity && mediaPlayerEntity.attributes) {
            const attributes = mediaPlayerEntity.attributes;
            song_name = attributes.media_title || 'Unknown Title';
            artist = attributes.media_artist || 'Unknown Artist';
            entity_picture = attributes.entity_picture || '';
          }
        }
        
        return {
          song_name: song_name,
          artist: artist,
          year: year,
          entity_picture: entity_picture,
          url: url
        };
      }
    }
    
    // Return dummy values if sensor entity or attributes are missing/unavailable
    // This ensures the card always displays sensible defaults even if backend is misconfigured
    return {
      song_name: 'Unknown Title',
      artist: 'Unknown Artist',
      year: '',
      entity_picture: '',
      url: ''
    };
  }

  getCurrentSongUrl() {
    // Get current song URL from the sensor attributes
    if (this.hass && this.hass.states) {
      const currentSongEntity = this.hass.states['sensor.soundbeats_current_song'];
      if (currentSongEntity && currentSongEntity.attributes) {
        return currentSongEntity.attributes.url || null;
      }
    }
    return null;
  }

  getCurrentSongMediaContentType() {
    // Get current song media content type from the sensor attributes
    if (this.hass && this.hass.states) {
      const currentSongEntity = this.hass.states['sensor.soundbeats_current_song'];
      if (currentSongEntity && currentSongEntity.attributes) {
        return currentSongEntity.attributes.media_content_type || null;
      }
    }
    return null;
  }

  getCurrentSongMediaPlayer() {
    // Get current song media player from the sensor state
    if (this.hass && this.hass.states) {
      const currentSongEntity = this.hass.states['sensor.soundbeats_current_song'];
      if (currentSongEntity && currentSongEntity.state !== 'None') {
        return currentSongEntity.state;
      }
    }
    return null;
  }

  getCurrentSongSensorState() {
    // Get current song sensor state and attributes for debugging
    if (this.hass && this.hass.states) {
      const currentSongEntity = this.hass.states['sensor.soundbeats_current_song'];
      if (currentSongEntity) {
        const attributes = currentSongEntity.attributes || {};
        return `State: ${currentSongEntity.state}, Attributes: ${JSON.stringify(attributes)}`;
      }
      return 'Sensor not found';
    }
    return 'HASS not available';
  }

  getSelectedAudioPlayer() {
    // Get selected audio player from the current song sensor state
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_current_song'];
      if (entity && entity.state && entity.state !== 'None') {
        return entity.state;
      }
    }
    return null;
  }

  getMediaPlayers() {
    // Get all available media player entities from Home Assistant
    const mediaPlayers = [];
    if (this.hass && this.hass.states) {
      Object.keys(this.hass.states).forEach(entityId => {
        if (entityId.startsWith('media_player.')) {
          const entity = this.hass.states[entityId];
          // Only include media players that are not unavailable
          if (entity.state !== 'unavailable') {
            mediaPlayers.push({
              entity_id: entityId,
              name: entity.attributes.friendly_name || entityId.split('.')[1].replace(/_/g, ' ')
            });
          }
        }
      });
    }
    return mediaPlayers;
  }

  updateCountdownTimerLength(timerLength) {
    // Call service to update countdown timer length
    if (this.hass) {
      this.hass.callService('soundbeats', 'update_countdown_timer_length', {
        timer_length: parseInt(timerLength)
      });
    }
  }

  updateAudioPlayer(audioPlayer) {
    // Call service to update audio player
    if (this.hass) {
      this.hass.callService('soundbeats', 'update_audio_player', {
        audio_player: audioPlayer
      });
    }
  }

  toggleGameSettings() {
    this.gameSettingsExpanded = !this.gameSettingsExpanded;
    // Update only the expander elements to preserve input states
    this.updateExpanderState();
  }

  toggleTeamManagement() {
    this.teamManagementExpanded = !this.teamManagementExpanded;
    // Update only the expander elements to preserve input states
    this.updateExpanderState();
  }

  updateExpanderState() {
    // Ensure shadowRoot is available before trying to update elements
    if (!this.shadowRoot || !this.shadowRoot.querySelector) {
      return;
    }
    
    // Update the Game Settings section
    const gameSettingsHeader = this.shadowRoot.querySelector('.section.admin-section .expandable-header');
    if (gameSettingsHeader) {
      const gameSettingsIcon = gameSettingsHeader.querySelector('.expander-icon');
      const gameSettingsContent = gameSettingsHeader.nextElementSibling;
      
      if (gameSettingsIcon) {
        gameSettingsIcon.className = `expander-icon ${this.gameSettingsExpanded ? 'expanded' : ''}`;
      }
      if (gameSettingsContent) {
        gameSettingsContent.className = `expandable-content ${this.gameSettingsExpanded ? 'expanded' : 'collapsed'}`;
      }
    }

    // Update the Team Management section
    const teamManagementHeader = this.shadowRoot.querySelectorAll('.section.admin-section .expandable-header')[1];
    if (teamManagementHeader) {
      const teamManagementIcon = teamManagementHeader.querySelector('.expander-icon');
      const teamManagementContent = teamManagementHeader.nextElementSibling;
      
      if (teamManagementIcon) {
        teamManagementIcon.className = `expander-icon ${this.teamManagementExpanded ? 'expanded' : ''}`;
      }
      if (teamManagementContent) {
        teamManagementContent.className = `expandable-content ${this.teamManagementExpanded ? 'expanded' : 'collapsed'}`;
      }
    }
  }

  updateDisplayValues() {
    // Update only display elements, not input fields to preserve user editing state
    
    // Update countdown display
    this.updateCountdownDisplay();
    
    // Update song display
    this.updateSongDisplay();
    
    // Update team display values (but not input fields)
    this.updateTeamDisplayValues();
    
    // Update teams overview description and content
    this.updateTeamsOverviewDisplay();
    
    // Update timer display value only if slider is not being actively used
    this.updateTimerDisplayValue();
    
    // Update dropdown options without changing selected value if not focused
    this.updateAudioPlayerOptions();
  }

  updateCountdownDisplay() {
    const countdownSection = this.shadowRoot.querySelector('.countdown-section');
    const countdownTimer = this.shadowRoot.querySelector('.countdown-timer');
    const countdownProgressBar = this.shadowRoot.querySelector('.countdown-progress-bar');
    
    const currentCountdown = this.getCountdownCurrent();
    const isRunning = currentCountdown > 0;
    
    // Check if countdown state changed (0 to non-zero or vice versa)
    // This affects whether year sliders should be shown
    if (this._lastCountdownState !== isRunning) {
      this._lastCountdownState = isRunning;
      this.recreateTeamsSection();
    }
    
    // Show/hide countdown section based on whether timer is running
    if (countdownSection) {
      if (isRunning) {
        countdownSection.classList.remove('hidden');
      } else {
        countdownSection.classList.add('hidden');
      }
    }
    
    // Update countdown timer display
    if (countdownTimer) {
      countdownTimer.textContent = `${currentCountdown}s`;
    }
    
    // Update progress bar
    if (countdownProgressBar) {
      const progressPercent = this.getCountdownProgressPercent();
      countdownProgressBar.style.width = `${progressPercent}%`;
    }
  }

  updateSongDisplay() {
    const songSection = this.shadowRoot.querySelector('.song-section');
    const currentCountdown = this.getCountdownCurrent();
    const currentSong = this.getCurrentSong();
    
    // Show/hide song section based on whether countdown is 0 and song is available
    if (songSection) {
      if (currentCountdown === 0 && currentSong) {
        songSection.classList.remove('hidden');
        
        // Update song information
        const songImage = songSection.querySelector('.song-image');
        const songName = songSection.querySelector('.song-name');
        const songArtist = songSection.querySelector('.song-artist');
        const songYear = songSection.querySelector('.song-year');
        
        if (songImage) songImage.src = currentSong.entity_picture;
        if (songName) songName.textContent = currentSong.song_name;
        if (songArtist) songArtist.textContent = currentSong.artist;
        if (songYear) songYear.textContent = currentSong.year;
      } else {
        songSection.classList.add('hidden');
      }
    }
  }

  updateTeamDisplayValues() {
    const teams = this.getTeams();
    const teamsContainer = this.shadowRoot.querySelector('.teams-container');
    const teamManagementContainer = this.shadowRoot.querySelector('.team-management-container');
    
    if (!teamsContainer) return;
    
    // Check if any input field in team management is currently focused - if so, block recreation
    const isUserEditing = teamManagementContainer && 
      (teamManagementContainer.contains(document.activeElement) && 
       (document.activeElement.type === 'text' || document.activeElement.type === 'checkbox'));
    
    Object.entries(teams).forEach(([teamId, team]) => {
      const teamItem = teamsContainer.querySelector(`[data-team="${teamId}"]`);
      if (!teamItem) {
        // Team item doesn't exist, need to add it - but only if user is not editing
        if (!isUserEditing) {
          this.recreateTeamsSection();
        }
        return;
      }
      
      // Update display values only
      const nameDisplay = teamItem.querySelector('.team-name');
      const pointsDisplay = teamItem.querySelector('.team-points');
      
      if (nameDisplay) nameDisplay.textContent = team.name;
      if (pointsDisplay) pointsDisplay.textContent = `${team.points} pts`;
      
      // Update input values in team management section only if they're not focused (being edited)
      if (teamManagementContainer) {
        const managementItem = teamManagementContainer.querySelector(`[data-team="${teamId}"]`);
        if (managementItem) {
          const nameInput = managementItem.querySelector('input[type="text"]');
          const participatingInput = managementItem.querySelector('input[type="checkbox"]');
          
          if (nameInput && document.activeElement !== nameInput) {
            nameInput.value = team.name;
          }
          if (participatingInput && document.activeElement !== participatingInput) {
            participatingInput.checked = team.participating;
          }
        }
      }
    });
  }

  updateTeamsOverviewDisplay() {
    // Update the overview description and content
    const overviewDescription = this.shadowRoot.querySelector('.overview-description');
    const teamsOverviewContainer = this.shadowRoot.querySelector('.teams-overview-container');
    
    if (overviewDescription) {
      const countdownCurrent = this.getCountdownCurrent();
      const roundCounter = this.getRoundCounter();
      
      let descriptionText;
      if (countdownCurrent > 0) {
        descriptionText = 'Leaderboard during guessing round';
      } else if (roundCounter > 0) {
        descriptionText = 'Final results from last round';
      } else {
        descriptionText = 'Teams ready for next game';
      }
      
      overviewDescription.textContent = descriptionText;
    }
    
    if (teamsOverviewContainer) {
      teamsOverviewContainer.innerHTML = this.renderOtherTeamsOverview();
    }
  }

  updateTimerDisplayValue() {
    const timerSlider = this.shadowRoot.querySelector('.timer-slider');
    const timerValue = this.shadowRoot.querySelector('.timer-value');
    const currentValue = this.getCountdownTimerLength();
    
    // Only update if slider is not being actively used
    if (timerSlider && document.activeElement !== timerSlider) {
      timerSlider.value = currentValue;
    }
    if (timerValue) {
      timerValue.textContent = `${currentValue}s`;
    }
  }

  updateAudioPlayerOptions() {
    const select = this.shadowRoot.querySelector('.audio-player-select');
    if (!select || document.activeElement === select) return;
    
    const currentSelection = this.getSelectedAudioPlayer();
    const mediaPlayers = this.getMediaPlayers();
    
    // Clear and rebuild options
    select.innerHTML = '<option value="">Select an audio player...</option>';
    mediaPlayers.forEach(player => {
      const option = document.createElement('option');
      option.value = player.entity_id;
      option.textContent = player.name;
      option.selected = currentSelection === player.entity_id;
      select.appendChild(option);
    });
  }

  recreateTeamsSection() {
    // Only recreate if teams structure has changed significantly
    const teamsContainer = this.shadowRoot.querySelector('.teams-container');
    const teamManagementContainer = this.shadowRoot.querySelector('.team-management-container');
    
    // Block recreation if user is actively editing any input field
    const isUserEditing = teamManagementContainer && 
      (teamManagementContainer.contains(document.activeElement) && 
       (document.activeElement.type === 'text' || document.activeElement.type === 'checkbox'));
       
    if (isUserEditing) {
      return; // Don't recreate while user is editing
    }
    
    if (teamsContainer) {
      // Save focus state before recreation
      let focusedElement = null;
      let focusedTeam = null;
      let focusedType = null;
      let isManagementSection = false;
      
      if (document.activeElement && (teamsContainer.contains(document.activeElement) || 
          (teamManagementContainer && teamManagementContainer.contains(document.activeElement)))) {
        focusedElement = document.activeElement;
        isManagementSection = teamManagementContainer && teamManagementContainer.contains(document.activeElement);
        const teamItem = focusedElement.closest('[data-team]');
        if (teamItem) {
          focusedTeam = teamItem.getAttribute('data-team');
          if (focusedElement.type === 'text') focusedType = 'text';
          else if (focusedElement.type === 'checkbox') focusedType = 'checkbox';
        }
      }
      
      // Recreate the teams
      teamsContainer.innerHTML = this.renderTeams();
      
      // Also recreate the teams overview section
      const teamsOverviewContainer = this.shadowRoot.querySelector('.teams-overview-container');
      if (teamsOverviewContainer) {
        teamsOverviewContainer.innerHTML = this.renderOtherTeamsOverview();
      }
      
      if (teamManagementContainer) {
        teamManagementContainer.innerHTML = this.renderTeamManagement();
      }
      
      // Restore focus if possible
      if (focusedTeam && focusedType) {
        const targetContainer = isManagementSection ? teamManagementContainer : teamsContainer;
        if (targetContainer) {
          const newTeamItem = targetContainer.querySelector(`[data-team="${focusedTeam}"]`);
          if (newTeamItem) {
            const newFocusElement = newTeamItem.querySelector(`input[type="${focusedType}"]`);
            if (newFocusElement) {
              // Use setTimeout to ensure the element is ready
              setTimeout(() => {
                newFocusElement.focus();
                // Restore cursor position for text inputs
                if (focusedType === 'text' && focusedElement) {
                  newFocusElement.setSelectionRange(focusedElement.selectionStart, focusedElement.selectionEnd);
                }
              }, 0);
            }
          }
        }
      }
    }
  }

  set hass(hass) {
    this._hass = hass;
    // Only update dynamic content without full re-render to preserve input states
    if (this.shadowRoot.innerHTML) {
      this.updateDisplayValues();
    } else {
      // Initial render only
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