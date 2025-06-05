/**
 * Soundbeats Lovelace Card
 * A custom card for the Soundbeats Home Assistant integration
 */

class SoundbeatsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._clientCountdownTimer = null;
    this._lastServerCountdown = 0;
    this._lastServerUpdate = 0;
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
        
        .teams-container {
          margin-top: 16px;
        }
        
        .team-item {
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
        
        .team-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 200px;
        }
        
        .team-name {
          font-weight: 500;
          color: var(--primary-text-color);
        }
        
        .team-points {
          background: var(--primary-color, #03a9f4);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.9em;
          font-weight: 500;
        }
        
        .team-participating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.9em;
          color: var(--secondary-text-color);
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
        
        <!-- Team Section - Always visible -->
        <div class="section team-section">
          <h3>
            <ha-icon icon="mdi:account-group" class="icon"></ha-icon>
            Team Status
          </h3>
          <p>Current game status: <span class="game-status">${this.getGameStatus()}</span></p>
          <p>Players connected: ${this.getPlayerCount()}</p>
          <p>Game mode: ${this.getGameMode()}</p>
          
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
          <h3>
            <ha-icon icon="mdi:cog" class="icon"></ha-icon>
            Game Settings
          </h3>
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

        <!-- Team Management Section - Only visible to admins -->
        <div class="section admin-section ${isAdmin ? '' : 'hidden'}">
          <h3>
            <ha-icon icon="mdi:account-group-outline" class="icon"></ha-icon>
            Team Management
          </h3>
          <p>Configure team names and participation status.</p>
          <div class="team-management-container">
            ${this.renderTeamManagement()}
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
    // Get player count from the dedicated sensor entity
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_player_count'];
      return entity ? entity.state : '0';
    }
    return '0';
  }

  getGameMode() {
    // Get game mode from the dedicated sensor entity
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_game_mode'];
      return entity ? entity.state : 'Classic';
    }
    return 'Classic';
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
            participating: entity.attributes && entity.attributes.participating !== undefined ? entity.attributes.participating : true
          };
        } else {
          // Fallback to default if entity doesn't exist yet
          teams[teamKey] = {
            name: `Team ${i}`,
            points: 0,
            participating: true
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
        participating: true
      };
    }
    return defaultTeams;
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
                 onchange="this.getRootNode().host.updateTeamName('${teamId}', this.value)">
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
    
    return Object.entries(teams).map(([teamId, team]) => `
      <div class="team-item" data-team="${teamId}">
        <div class="team-info">
          <span class="team-name">${team.name}</span>
          <span class="team-points">${team.points} pts</span>
          <span class="team-participating">
            <ha-icon icon="${team.participating ? 'mdi:check-circle' : 'mdi:circle-outline'}"></ha-icon>
            ${team.participating ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    `).join('');
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
    }
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

  getCountdownProgressPercent(currentCountdown = null) {
    // Calculate countdown progress as percentage
    const current = currentCountdown !== null ? currentCountdown : this.getCurrentCountdownValue();
    const total = this.getCountdownTimerLength();
    if (total <= 0) return 0;
    return Math.round((current / total) * 100);
  }

  getCurrentCountdownValue() {
    // Get the current countdown value, accounting for client-side timer
    const serverCountdown = this.getCountdownCurrent();
    
    if (serverCountdown <= 0) {
      return 0;
    }
    
    // Calculate client-side countdown based on time elapsed since last server update
    const elapsed = Math.floor((Date.now() - this._lastServerUpdate) / 1000);
    const clientCountdown = Math.max(0, this._lastServerCountdown - elapsed);
    
    return clientCountdown;
  }

  startClientCountdownTimer() {
    if (this._clientCountdownTimer) {
      return; // Already running
    }
    
    this._clientCountdownTimer = setInterval(() => {
      const currentCountdown = this.getCurrentCountdownValue();
      
      // Update display
      const countdownTimer = this.shadowRoot.querySelector('.countdown-timer');
      const countdownProgressBar = this.shadowRoot.querySelector('.countdown-progress-bar');
      
      if (countdownTimer) {
        countdownTimer.textContent = `${currentCountdown}s`;
      }
      
      if (countdownProgressBar) {
        const progressPercent = this.getCountdownProgressPercent(currentCountdown);
        countdownProgressBar.style.width = `${progressPercent}%`;
      }
      
      // Stop timer if countdown reaches zero
      if (currentCountdown <= 0) {
        this.stopClientCountdownTimer();
        
        // Hide countdown section
        const countdownSection = this.shadowRoot.querySelector('.countdown-section');
        if (countdownSection) {
          countdownSection.classList.add('hidden');
        }
      }
    }, 100); // Update every 100ms for smooth animation
  }

  stopClientCountdownTimer() {
    if (this._clientCountdownTimer) {
      clearInterval(this._clientCountdownTimer);
      this._clientCountdownTimer = null;
    }
  }

  getSelectedAudioPlayer() {
    // Get selected audio player from the dedicated sensor entity
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_audio_player'];
      if (entity && entity.state && entity.state !== 'None') {
        return entity.state;
      }
    }
    return null;
  }

  getMediaPlayers() {
    // Get all media player entities from Home Assistant
    const mediaPlayers = [];
    if (this.hass && this.hass.states) {
      Object.keys(this.hass.states).forEach(entityId => {
        if (entityId.startsWith('media_player.')) {
          const entity = this.hass.states[entityId];
          mediaPlayers.push({
            entity_id: entityId,
            name: entity.attributes.friendly_name || entityId.split('.')[1].replace(/_/g, ' ')
          });
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

  updateDisplayValues() {
    // Update only display elements, not input fields to preserve user editing state
    
    // Update game status display
    const gameStatusEl = this.shadowRoot.querySelector('.game-status');
    if (gameStatusEl) {
      gameStatusEl.textContent = this.getGameStatus();
    }
    
    // Update player count
    const playerCountText = this.shadowRoot.querySelector('.team-section p:nth-of-type(2)');
    if (playerCountText) {
      playerCountText.textContent = `Players connected: ${this.getPlayerCount()}`;
    }
    
    // Update game mode
    const gameModeText = this.shadowRoot.querySelector('.team-section p:nth-of-type(3)');
    if (gameModeText) {
      gameModeText.textContent = `Game mode: ${this.getGameMode()}`;
    }
    
    // Update countdown display
    this.updateCountdownDisplay();
    
    // Update team display values (but not input fields)
    this.updateTeamDisplayValues();
    
    // Update timer display value only if slider is not being actively used
    this.updateTimerDisplayValue();
    
    // Update dropdown options without changing selected value if not focused
    this.updateAudioPlayerOptions();
  }

  updateCountdownDisplay() {
    const countdownSection = this.shadowRoot.querySelector('.countdown-section');
    const countdownTimer = this.shadowRoot.querySelector('.countdown-timer');
    const countdownProgressBar = this.shadowRoot.querySelector('.countdown-progress-bar');
    
    const serverCountdown = this.getCountdownCurrent();
    const isRunning = serverCountdown > 0;
    
    // Update server state tracking
    if (serverCountdown !== this._lastServerCountdown) {
      this._lastServerCountdown = serverCountdown;
      this._lastServerUpdate = Date.now();
    }
    
    // Show/hide countdown section based on whether timer is running
    if (countdownSection) {
      if (isRunning) {
        countdownSection.classList.remove('hidden');
      } else {
        countdownSection.classList.add('hidden');
      }
    }
    
    // Start or stop client-side timer based on countdown state
    if (isRunning && !this._clientCountdownTimer) {
      this.startClientCountdownTimer();
    } else if (!isRunning && this._clientCountdownTimer) {
      this.stopClientCountdownTimer();
    }
    
    // Update countdown timer display with current calculated value
    const currentCountdown = this.getCurrentCountdownValue();
    if (countdownTimer) {
      countdownTimer.textContent = `${currentCountdown}s`;
    }
    
    // Update progress bar
    if (countdownProgressBar) {
      const progressPercent = this.getCountdownProgressPercent(currentCountdown);
      countdownProgressBar.style.width = `${progressPercent}%`;
    }
  }

  updateTeamDisplayValues() {
    const teams = this.getTeams();
    const teamsContainer = this.shadowRoot.querySelector('.teams-container');
    const teamManagementContainer = this.shadowRoot.querySelector('.team-management-container');
    
    if (!teamsContainer) return;
    
    Object.entries(teams).forEach(([teamId, team]) => {
      const teamItem = teamsContainer.querySelector(`[data-team="${teamId}"]`);
      if (!teamItem) {
        // Team item doesn't exist, need to add it
        this.recreateTeamsSection();
        return;
      }
      
      // Update display values only
      const nameDisplay = teamItem.querySelector('.team-name');
      const pointsDisplay = teamItem.querySelector('.team-points');
      const participatingDisplay = teamItem.querySelector('.team-participating');
      
      if (nameDisplay) nameDisplay.textContent = team.name;
      if (pointsDisplay) pointsDisplay.textContent = `${team.points} pts`;
      if (participatingDisplay) {
        participatingDisplay.innerHTML = `
          <ha-icon icon="${team.participating ? 'mdi:check-circle' : 'mdi:circle-outline'}"></ha-icon>
          ${team.participating ? 'Active' : 'Inactive'}
        `;
      }
      
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

  disconnectedCallback() {
    // Clean up timer when element is removed
    this.stopClientCountdownTimer();
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