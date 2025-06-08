/**
 * Soundbeats Lovelace Card
 * A custom card for the Soundbeats Home Assistant integration
 * 
 * ZERO-SETUP ARCHITECTURE:
 * This card follows a zero-setup, UI-driven philosophy where all configuration
 * changes are immediately persisted to Home Assistant entities as users interact
 * with UI controls. The Start/Launch Game button only transitions the UI and does
 * not trigger backend services or game logic. Actual game operations (song start,
 * scoring, etc.) are initiated by explicit user actions on the main game screen.
 */

// Version will be dynamically fetched from Home Assistant integration registry

class SoundbeatsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // Initialize expander state - both sections collapsed by default
    this.gameSettingsExpanded = false;
    this.teamManagementExpanded = false;
    this.highscoreDiagnosticExpanded = false;
    this.highscoreExpanded = true; // Initial state should be true as per requirements

    // Initialize user data cache
    this.homeAssistantUsers = [];
    this.usersLoaded = false;
    // Track previous highscore states for banner notifications
    this._lastAbsoluteHighscore = null;
    this._lastRoundHighscores = {};
    this._activeBanners = [];
    
    // Performance optimizations - unified caching system
    this._cache = {
      mediaPlayers: { data: null, time: 0, ttl: 2000 },
      missingVariables: { data: null, time: 0, ttl: 100 },
      shouldShowSplash: { data: null, time: 0, ttl: 50 }
    };
    this._debounceTimers = {};
    
    // Loading states
    this._isLoadingMediaPlayers = false;
    this._isLoadingUsers = false;
    
    // Track if user has successfully launched from splash screen
    this._hasLaunchedFromSplash = false;
    
    // Track recent user interactions with dropdowns to prevent overriding selections
    // (using same pattern as _recentUserSelections for consistency)
    this._recentAudioPlayerInteractions = {};
    
    // Translation system
    this._currentLanguage = localStorage.getItem('soundbeats-language') || 'en';
    this._translations = null;
    this._loadTranslations();
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
    this.render();
  }

  // Translation system methods
  async _loadTranslations() {
    if (this._translations) return;
    try {
      const response = await fetch('/local/community/soundbeats/translations.json');
      this._translations = await response.json();
    } catch (error) {
      console.warn('Failed to load translations, using fallback:', error);
      // Fallback translations
      this._translations = {
        en: {
          splash: {
            welcome: "Welcome to Soundbeats!",
            subtitle: "🎵 The ultimate Home Assistant party game experience! 🎵",
            ready_title: "🎉 Ready to Rock! 🎉",
            ready_description: "All game settings are configured. Let's start the music!",
            setup_title: "Let's Get Set Up!",
            setup_description: "Configure the missing settings below to start the party:",
            start_game: "Start Game",
            launch_game: "Launch Game",
            start_help: "Complete the settings above first"
          },
          ui: {
            title: "Soundbeats Party Game",
            description: "The ultimate Home Assistant party game experience!",
            team_management: "Team Management",
            select_audio_player: "Select an audio player...",
            loading_audio_players: "Loading audio players...",
            no_audio_players: "No audio players found",
            select_user: "Select user...",
            loading_users: "Loading users...",
            qr_modal_title: "Home Assistant QR Code",
            qr_code_alt: "QR Code",
            qr_modal_description: "Scan this QR code with your mobile device to access Home Assistant from your phone.",
            close: "Close",
            language: "Language",
            assign_user_tooltip: "Assign user to team",
            song_timer: "Song Timer",
            current_song: "Current Song",
            teams_overview: "Teams Overview",
            highscores_after_round: "Highscores (after Round {round})",
            team_status: "Team Status",
            game_settings: "Game Settings",
            volume_up: "Volume Up",
            volume_down: "Volume Down",
            play: "Play",
            pause: "Pause",
            next_song: "Next Song",
            countdown_timer_length: "Countdown Timer Length",
            points_earned: "Points earned"
          },
          settings: {
            number_of_teams: "Number of Teams",
            teams_description: "How many teams will participate in the game?",
            select_teams_placeholder: "Select number of teams...",
            audio_player: "Audio Player",
            audio_player_description: "Select where music should play from",
            team_setup: "Team Setup",
            team_assignment_description: "Assign users to your {count} team{plural}",
            team_admin_notice: "The user assigned to Team 1 will have admin privileges to manage game settings and teams.",
            select_teams_first: "Please select the number of teams above to set up team assignments",
            choose_teams_first: "Choose how many teams will play first",
            countdown_timer: "Countdown Timer",
            countdown_description: "How long teams have to guess (5-300 seconds)",
            team_label: "Team {number}:",
            select_teams_for_assignments: "Please select the number of teams in Game Settings first",
            select_teams_for_assignments_full: "Please select the number of teams in Game Settings first to set up team assignments",
            teams_count_option: "{count} Team{plural}",
            team_name_placeholder: "Team Name",
            default_team_name: "Team {number}",
            team_admin_label: "Team {number} (Admin)",
            team_admin_suffix: "(Admin)",
            missing_team_users_name: "Team Users",
            missing_team_users_description: "Assign a user to every team ({missing} of {total} teams still need users assigned).",
            missing_team_count_name: "Number of Teams",
            missing_team_count_description: "Select how many teams will participate in the game (1-5 teams).",
            missing_audio_player_name: "Audio Player",
            missing_audio_player_description: "Select a media player to play music during the game. This is where songs will be played from.",
            missing_countdown_timer_name: "Countdown Timer",
            missing_countdown_timer_description: "Set a countdown timer length (5-300 seconds) for how long teams have to guess each song."
          },
          alerts: {
            no_audio_player_title: "No Audio Player Selected",
            no_audio_player_message: "Please select an audio player in the admin settings before starting the next song.",
            all_songs_played_title: "All Songs Played!",
            all_songs_played_message: "All available songs have been played. Start a new game to reset the playlist.",
            new_highscore_message: "Congratulations on the new highscore!"
          },
          game: {
            year_guess_label: "Guess the year this song was published:",
            no_song_message: "No Song played yet.",
            your_average: "Your Average:",
            your_guess_vs_actual: "Your guess: {guess} | Actual year: {year}",
            no_participating_teams: "No participating teams",
            highscore_data_not_available: "Highscore data not available",
            highscore_avg_round: "Highscore (Avg/Round):",
            perfect_guess_with_bet: "Perfect guess with bet!",
            years_off_bet_failed: "{difference} year{plural} off. Bet failed.",
            perfect_guess: "Perfect guess!",
            within_years_correct: "You were within {difference} year{plural} of the correct answer.",
            within_years_correct_exact: "You were within {difference} years of the correct answer.",
            more_than_five_years: "More than 5 years off ({difference} years)."
          },
          diagnostics: {
            ha_not_available: "Home Assistant instance not available",
            ha_states_not_available: "Home Assistant states not available",
            sensor_not_found: "'sensor.soundbeats_highscore' not found",
            available_entities: "Available Soundbeats Entities:",
            troubleshooting: "Troubleshooting:",
            verify_integration: "Verify the Soundbeats integration is properly installed",
            check_sensor: "Check that the integration has created the highscore sensor",
            restart_ha: "Restart Home Assistant if the sensor was recently added",
            entity_state: "Entity State:",
            entity_attributes: "Entity Attributes:",
            status: "Status:"
          },
          buttons: {
            close: "×"
          },
          language_toggle: {
            german: "Deutsch",
            english: "English"
          },
          betting: {
            place_bet: "Place Bet",
            betting_active: "BETTING!",
            win_lose_info: "Win: 20pts | Lose: 0pts",
            cancel_bet_aria: "Cancel bet",
            place_bet_for_aria: "Place bet for {team}",
            cancel_bet_for_aria: "Cancel bet for {team}"
          },
          defaults: {
            unknown_title: "Unknown Title",
            unknown_artist: "Unknown Artist",
            classic_mode: "Classic",
            none_found: "None found",
            points_suffix: "pts",
            seconds_suffix: "s"
          },
          highscore: {
            new_average_message: "New average highscore: {value} pts/round! 🏆"
          }
        },
        de: {
          splash: {
            welcome: "Willkommen bei Soundbeats!",
            subtitle: "🎵 Das ultimative Home Assistant Party-Spiel-Erlebnis! 🎵",
            ready_title: "🎉 Bereit zum Rocken! 🎉",
            ready_description: "Alle Spieleinstellungen sind konfiguriert. Lasst uns die Musik starten!",
            setup_title: "Lass uns einrichten!",
            setup_description: "Konfiguriere die fehlenden Einstellungen unten, um die Party zu starten:",
            start_game: "Spiel starten",
            launch_game: "Spiel starten",
            start_help: "Vervollständige zuerst die Einstellungen oben"
          },
          ui: {
            title: "Soundbeats Party-Spiel",
            description: "Das ultimative Home Assistant Party-Spiel-Erlebnis!",
            team_management: "Team-Verwaltung",
            select_audio_player: "Audio-Player auswählen...",
            loading_audio_players: "Lade Audio-Player...",
            no_audio_players: "Keine Audio-Player gefunden",
            select_user: "Benutzer auswählen...",
            loading_users: "Lade Benutzer...",
            qr_modal_title: "Home Assistant QR-Code",
            qr_code_alt: "QR-Code",
            qr_modal_description: "Scannen Sie diesen QR-Code mit Ihrem Mobilgerät, um von Ihrem Telefon auf Home Assistant zuzugreifen.",
            close: "Schließen",
            language: "Sprache",
            assign_user_tooltip: "Benutzer zu Team zuweisen",
            song_timer: "Song-Timer",
            current_song: "Aktueller Song",
            teams_overview: "Teams-Übersicht",
            highscores_after_round: "Highscores (nach Runde {round})",
            team_status: "Team-Status",
            game_settings: "Spiel-Einstellungen",
            volume_up: "Lautstärke erhöhen",
            volume_down: "Lautstärke verringern",
            play: "Abspielen",
            pause: "Pausieren",
            next_song: "Nächster Song",
            countdown_timer_length: "Countdown-Timer-Länge",
            points_earned: "Punkte erhalten"
          },
          settings: {
            number_of_teams: "Anzahl der Teams",
            teams_description: "Wie viele Teams werden am Spiel teilnehmen?",
            select_teams_placeholder: "Anzahl der Teams auswählen...",
            audio_player: "Audio-Player",
            audio_player_description: "Wählen Sie aus, wo die Musik abgespielt werden soll",
            team_setup: "Team-Einrichtung",
            team_assignment_description: "Weisen Sie Benutzer Ihren {count} Team{plural} zu",
            team_admin_notice: "Der Benutzer, der Team 1 zugewiesen wird, hat Administratorrechte zur Verwaltung von Spieleinstellungen und Teams.",
            select_teams_first: "Bitte wählen Sie zuerst die Anzahl der Teams aus, um Team-Zuweisungen einzurichten",
            choose_teams_first: "Wählen Sie zuerst aus, wie viele Teams spielen werden",
            countdown_timer: "Countdown-Timer",
            countdown_description: "Wie lange haben Teams zum Raten (5-300 Sekunden)",
            team_label: "Team {number}:",
            select_teams_for_assignments: "Bitte wählen Sie zuerst die Anzahl der Teams in den Spieleinstellungen",
            select_teams_for_assignments_full: "Bitte wählen Sie zuerst die Anzahl der Teams in den Spieleinstellungen, um Team-Zuweisungen einzurichten",
            teams_count_option: "{count} Team{plural}",
            team_name_placeholder: "Team-Name",
            default_team_name: "Team {number}",
            team_admin_label: "Team {number} (Admin)",
            team_admin_suffix: "(Admin)",
            missing_team_users_name: "Team-Benutzer",
            missing_team_users_description: "Weisen Sie jedem Team einen Benutzer zu ({missing} von {total} Teams benötigen noch Benutzer).",
            missing_team_count_name: "Anzahl der Teams",
            missing_team_count_description: "Wählen Sie aus, wie viele Teams am Spiel teilnehmen werden (1-5 Teams).",
            missing_audio_player_name: "Audio-Player",
            missing_audio_player_description: "Wählen Sie einen Media-Player aus, um Musik während des Spiels abzuspielen. Hier werden die Songs abgespielt.",
            missing_countdown_timer_name: "Countdown-Timer",
            missing_countdown_timer_description: "Stellen Sie eine Countdown-Timer-Länge ein (5-300 Sekunden), wie lange Teams zum Raten haben."
          },
          alerts: {
            no_audio_player_title: "Kein Audio-Player ausgewählt",
            no_audio_player_message: "Bitte wählen Sie einen Audio-Player in den Admin-Einstellungen aus, bevor Sie das nächste Lied starten.",
            all_songs_played_title: "Alle Lieder gespielt!",
            all_songs_played_message: "Alle verfügbaren Lieder wurden gespielt. Starten Sie ein neues Spiel, um die Playlist zurückzusetzen.",
            new_highscore_message: "Herzlichen Glückwunsch zum neuen Highscore!"
          },
          game: {
            year_guess_label: "Raten Sie das Jahr, in dem dieses Lied veröffentlicht wurde:",
            no_song_message: "Noch kein Lied gespielt.",
            your_average: "Ihr Durchschnitt:",
            your_guess_vs_actual: "Ihr Tipp: {guess} | Tatsächliches Jahr: {year}",
            no_participating_teams: "Keine teilnehmenden Teams",
            highscore_data_not_available: "Highscore-Daten nicht verfügbar",
            highscore_avg_round: "Highscore (Durchschn./Runde):",
            perfect_guess_with_bet: "Perfekter Tipp mit Wette!",
            years_off_bet_failed: "{difference} Jahr{plural} daneben. Wette fehlgeschlagen.",
            perfect_guess: "Perfekter Tipp!",
            within_years_correct: "Sie lagen innerhalb von {difference} Jahr{plural} der richtigen Antwort.",
            within_years_correct_exact: "Sie lagen innerhalb von {difference} Jahren der richtigen Antwort.",
            more_than_five_years: "Mehr als 5 Jahre daneben ({difference} Jahre)."
          },
          diagnostics: {
            ha_not_available: "Home Assistant-Instanz nicht verfügbar",
            ha_states_not_available: "Home Assistant-Zustände nicht verfügbar",
            sensor_not_found: "'sensor.soundbeats_highscore' nicht gefunden",
            available_entities: "Verfügbare Soundbeats-Entitäten:",
            troubleshooting: "Fehlerbehebung:",
            verify_integration: "Überprüfen Sie, ob die Soundbeats-Integration ordnungsgemäß installiert ist",
            check_sensor: "Überprüfen Sie, ob die Integration den Highscore-Sensor erstellt hat",
            restart_ha: "Starten Sie Home Assistant neu, wenn der Sensor kürzlich hinzugefügt wurde",
            entity_state: "Entitätszustand:",
            entity_attributes: "Entitätsattribute:",
            status: "Status:"
          },
          buttons: {
            close: "×"
          },
          language_toggle: {
            german: "Deutsch",
            english: "English"
          },
          betting: {
            place_bet: "Wette platzieren",
            betting_active: "WETTET!",
            win_lose_info: "Gewinn: 20 Pkt | Verlust: 0 Pkt",
            cancel_bet_aria: "Wette stornieren",
            place_bet_for_aria: "Wette platzieren für {team}",
            cancel_bet_for_aria: "Wette stornieren für {team}"
          },
          defaults: {
            unknown_title: "Unbekannter Titel",
            unknown_artist: "Unbekannter Künstler",
            classic_mode: "Klassisch",
            none_found: "Keine gefunden",
            points_suffix: "Pkt",
            seconds_suffix: "s"
          },
          highscore: {
            new_average_message: "Neuer Durchschnitts-Highscore: {value} Pkt/Runde! 🏆"
          }
        }
      };
    }
  }

  _t(key) {
    if (!this._translations || !this._translations[this._currentLanguage]) {
      return key;
    }
    
    const keys = key.split('.');
    let value = this._translations[this._currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  // Helper function for translations with substitutions
  _ts(key, substitutions = {}) {
    let text = this._t(key);
    Object.entries(substitutions).forEach(([placeholder, value]) => {
      text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value);
    });
    return text;
  }

  _toggleLanguage() {
    this._currentLanguage = this._currentLanguage === 'en' ? 'de' : 'en';
    localStorage.setItem('soundbeats-language', this._currentLanguage);
    this.render();
  }

  // Unified cache management helpers
  _getCached(key) {
    const cache = this._cache[key];
    if (!cache) return null;
    
    const now = Date.now();
    if (cache.data && (now - cache.time) < cache.ttl) {
      return cache.data;
    }
    return null;
  }

  _setCached(key, data) {
    const cache = this._cache[key];
    if (cache) {
      cache.data = data;
      cache.time = Date.now();
    }
  }

  _clearCache(key = null) {
    if (key) {
      const cache = this._cache[key];
      if (cache) {
        cache.data = null;
        cache.time = 0;
      }
      // Reset loading state when media players cache is cleared
      if (key === 'mediaPlayers') {
        this._isLoadingMediaPlayers = false;
      }
    } else {
      // Clear all caches
      Object.values(this._cache).forEach(cache => {
        cache.data = null;
        cache.time = 0;
      });
      // Reset loading state when all caches are cleared
      this._isLoadingMediaPlayers = false;
    }
  }

  shouldShowSplashScreen() {
    // Use unified cache to avoid repeated computation during rapid calls
    const cached = this._getCached('shouldShowSplash');
    if (cached !== null) {
      return cached;
    }
    
    // Check if splash override is active for testing
    const splashOverride = this.getSplashOverride();
    if (splashOverride) {
      // Cache the result
      this._setCached('shouldShowSplash', true);
      return true;
    }
    
    // Show splash screen when critical game variables are missing
    const missingVariables = this.getMissingGameVariables();
    const shouldShow = missingVariables.length > 0;
    
    // Cache the result
    this._setCached('shouldShowSplash', shouldShow);
    
    return shouldShow;
  }

  getGameStatus() {
    // Get current game status from the main sensor
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_game_status'];
      if (entity && entity.state) {
        return entity.state;
      }
    }
    return 'ready'; // Default state
  }

  getSplashOverride() {
    // Check if splash override is active for testing
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_game_status'];
      if (entity && entity.attributes && entity.attributes.splash_override) {
        return entity.attributes.splash_override;
      }
    }
    return false;
  }

  getSplashTestingMode() {
    // Check if splash testing mode is active (simulates missing variables)
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_game_status'];
      if (entity && entity.attributes && entity.attributes.splash_testing_mode) {
        return entity.attributes.splash_testing_mode;
      }
    }
    return false;
  }

  isGameReady() {
    // Check if all critical game variables are set
    const missingVariables = this.getMissingGameVariables();
    return missingVariables.length === 0;
  }

  getMissingGameVariables() {
    // Use unified cache to avoid heavy computation during rapid renders
    const cached = this._getCached('missingVariables');
    if (cached !== null) {
      return cached;
    }
    
    // Check if we're in splash testing mode (simulates missing variables for testing)
    const splashTestingMode = this.getSplashTestingMode();
    if (splashTestingMode) {
      const fakeMissing = [
        {
          key: 'teamCount',
          name: this._t('settings.missing_team_count_name'),
          description: this._t('settings.missing_team_count_description')
        },
        {
          key: 'audioPlayer',
          name: this._t('settings.missing_audio_player_name'),
          description: this._t('settings.missing_audio_player_description')
        },
        {
          key: 'timer',
          name: this._t('settings.missing_countdown_timer_name'),
          description: this._t('settings.missing_countdown_timer_description')
        }
      ];
      
      // Cache the fake result
      this._setCached('missingVariables', fakeMissing);
      return fakeMissing;
    }
    
    const missing = [];
    
    // Check if team count is selected
    const teamCount = this.getSelectedTeamCount();
    if (!teamCount || teamCount < 1 || teamCount > 5) {
      missing.push({
        key: 'teamCount',
        name: this._t('settings.missing_team_count_name'),
        description: this._t('settings.missing_team_count_description')
      });
    }
    
    // Check if audio player is selected
    const audioPlayer = this.getSelectedAudioPlayer();
    if (!audioPlayer) {
      missing.push({
        key: 'audioPlayer',
        name: this._t('settings.missing_audio_player_name'),
        description: this._t('settings.missing_audio_player_description')
      });
    }
    
    // Check if timer is configured (should be between 5-300 seconds)
    const timerLength = this.getCountdownTimerLength();
    if (!timerLength || timerLength < 5 || timerLength > 300) {
      missing.push({
        key: 'timer',
        name: this._t('settings.missing_countdown_timer_name'),
        description: this._t('settings.missing_countdown_timer_description')
      });
    }
    
    // Check if ALL teams have users assigned (only for selected number of teams)
    // Every participating team for the chosen team count must have a user assigned
    if (teamCount && teamCount >= 1 && teamCount <= 5) {
      const teams = this.getTeams();
      const teamsWithoutUsers = Object.values(teams).filter(team => !team.user_id);
      if (teamsWithoutUsers.length > 0) {
        missing.push({
          key: 'teams',
          name: this._t('settings.missing_team_users_name'),
          description: this._ts('settings.missing_team_users_description', { missing: teamsWithoutUsers.length, total: teamCount })
        });
      }
    }
    
    // Cache the result
    this._setCached('missingVariables', missing);
    
    return missing;
  }

  renderSplashScreen() {
    const missingVariables = this.getMissingGameVariables();
    const isReady = missingVariables.length === 0;
    
    return `
      <div class="splash-screen">
        <div class="splash-header">
          <div class="splash-language-toggle">
            <button class="language-toggle-btn" onclick="this.getRootNode().host._toggleLanguage()" title="${this._t('ui.language')}">
              <ha-icon icon="mdi:translate" class="language-icon"></ha-icon>
              <span class="language-text">${this._currentLanguage.toUpperCase()}</span>
            </button>
          </div>
          <div class="splash-floating-notes">
            <div class="note note-1">♪</div>
            <div class="note note-2">♫</div>
            <div class="note note-3">♪</div>
            <div class="note note-4">♬</div>
            <div class="note note-5">♪</div>
          </div>
          <h1>
            <ha-icon icon="mdi:music-note" class="splash-icon"></ha-icon>
            ${this._t('splash.welcome')}
          </h1>
          <p class="splash-subtitle">${this._t('splash.subtitle')}</p>
          <div class="splash-sound-waves">
            <div class="wave wave-1"></div>
            <div class="wave wave-2"></div>
            <div class="wave wave-3"></div>
            <div class="wave wave-4"></div>
            <div class="wave wave-5"></div>
          </div>
        </div>
        
        ${isReady ? `
          <div class="splash-ready">
            <div class="ready-message">
              <ha-icon icon="mdi:check-circle" class="ready-icon"></ha-icon>
              <h2>${this._t('splash.ready_title')}</h2>
              <p>${this._t('splash.ready_description')}</p>
            </div>
          </div>
        ` : `
          <div class="splash-setup">
            <div class="setup-message">
              <ha-icon icon="mdi:cog" class="setup-icon"></ha-icon>
              <h2>${this._t('splash.setup_title')}</h2>
              <p>${this._t('splash.setup_description')}</p>
            </div>
            
            <div class="splash-settings">
              ${this.renderSplashInputs(missingVariables)}
            </div>
          </div>
        `}
        
        <!-- Always show start button -->
        <div class="splash-start-section">
          <button class="splash-start-button ${isReady ? 'ready' : 'not-ready'}" 
                  onclick="this.getRootNode().host.handleSplashStart()">
            <ha-icon icon="mdi:play-circle" class="icon"></ha-icon>
            ${isReady ? this._t('splash.launch_game') : this._t('splash.start_game')}
          </button>
          ${isReady ? '' : `<p class="start-help">${this._t('splash.start_help')}</p>`}
        </div>
        
        <!-- Version Footer -->
        <div class="version-footer">
          v${this.getVersion()}
        </div>
      </div>
    `;
  }

  renderSplashInputs(missingVariables) {
    const missingMap = {};
    missingVariables.forEach(variable => {
      missingMap[variable.key] = variable;
    });

    let inputsHtml = '';

    // Team Count Input (always show)
    const currentTeamCount = this.getSelectedTeamCount();
    inputsHtml += `
      <div class="splash-input-section ${this.hasValidationError('teamCount') ? 'error' : ''}">
        <div class="splash-input-header">
          <ha-icon icon="mdi:account-group" class="input-icon"></ha-icon>
          <h3>${this._t('settings.number_of_teams')}</h3>
        </div>
        <p class="input-description">${this._t('settings.teams_description')}</p>
        <select class="splash-team-count-select" onchange="this.getRootNode().host.updateTeamCount(this.value)">
          <option value="">${this._t('settings.select_teams_placeholder')}</option>
          ${[1, 2, 3, 4, 5].map(count => 
            `<option value="${count}" ${currentTeamCount === count ? 'selected' : ''}>
              ${this._ts('settings.teams_count_option', { count: count, plural: count > 1 ? 's' : '' })}
            </option>`
          ).join('')}
        </select>
      </div>
    `;

    // Audio Player Input (always show)
    const mediaPlayers = this.getMediaPlayers();
    const currentSelection = this.getSelectedAudioPlayer();
    const isActuallyLoading = this._isLoadingMediaPlayers;
    const hasNoPlayers = mediaPlayers.length === 0 && !isActuallyLoading;
    
    inputsHtml += `
      <div class="splash-input-section ${this.hasValidationError('audioPlayer') ? 'error' : ''}">
        <div class="splash-input-header">
          <ha-icon icon="mdi:speaker" class="input-icon"></ha-icon>
          <h3>${this._t('settings.audio_player')}</h3>
        </div>
        <p class="input-description">${this._t('settings.audio_player_description')}</p>
        <select class="splash-audio-select" onchange="this.getRootNode().host.updateAudioPlayer(this.value)" onfocus="this.getRootNode().host._trackAudioPlayerInteraction('.splash-audio-select')" onmousedown="this.getRootNode().host._trackAudioPlayerInteraction('.splash-audio-select')" ${isActuallyLoading ? 'disabled' : ''}>
          <option value="">${isActuallyLoading ? this._t('ui.loading_audio_players') : hasNoPlayers ? this._t('ui.no_audio_players') : this._t('ui.select_audio_player')}</option>
          ${mediaPlayers.map(player => 
            `<option value="${player.entity_id}" ${currentSelection === player.entity_id ? 'selected' : ''}>
              ${player.name} - ${player.entity_id}
            </option>`
          ).join('')}
        </select>
      </div>
    `;

    // Teams Setup Section (always show)
    const teamCount = this.getSelectedTeamCount();
    const hasValidTeamCount = teamCount && teamCount >= 1 && teamCount <= 5;
    
    inputsHtml += `
      <div class="splash-input-section ${this.hasValidationError('teams') ? 'error' : ''}">
        <div class="splash-input-header">
          <ha-icon icon="mdi:account-group-outline" class="input-icon"></ha-icon>
          <h3>${this._t('settings.team_setup')}</h3>
        </div>
        <div class="splash-teams-container">
    `;
    
    if (hasValidTeamCount) {
      // Show team assignment fields when valid team count is selected
      inputsHtml += `
        <p class="input-description">${this._ts('settings.team_assignment_description', { count: teamCount, plural: teamCount > 1 ? 's' : '' })}</p>`;
      
      // Only show admin warning in splash screen context - never in main interface
      if (this.shouldShowSplashScreen()) {
        inputsHtml += `
        <div class="admin-warning">
          <ha-icon icon="mdi:shield-account" class="warning-icon"></ha-icon>
          <span><strong>Important:</strong> ${this._t('settings.team_admin_notice')}</span>
        </div>`;
      }
      
      inputsHtml += `
        ${this.renderTeamsContent('splash')}
      `;
    } else {
      // Show prompt message when no valid team count is selected
      inputsHtml += `
        <p class="input-description">${this._t('settings.select_teams_first')}</p>
        <div class="splash-teams-prompt">
          <ha-icon icon="mdi:arrow-up" class="prompt-icon"></ha-icon>
          <span>${this._t('settings.choose_teams_first')}</span>
        </div>
      `;
    }
    
    inputsHtml += `
        </div>
      </div>
    `;

    // Timer Input (only show if missing - optional)
    if (missingMap.timer) {
      const currentTimer = this.getCountdownTimerLength();
      
      inputsHtml += `
        <div class="splash-input-section ${this.hasValidationError('timer') ? 'error' : ''}">
          <div class="splash-input-header">
            <ha-icon icon="mdi:timer-outline" class="input-icon"></ha-icon>
            <h3>${this._t('settings.countdown_timer')}</h3>
          </div>
          <p class="input-description">${this._t('settings.countdown_description')}</p>
          <div class="splash-timer-control">
            <input type="range" class="splash-timer-slider" min="5" max="300" step="5" 
                   value="${currentTimer}"
                   oninput="this.getRootNode().host.updateCountdownTimerLength(this.value); this.nextElementSibling.textContent = this.value + this.getRootNode().host._t('defaults.seconds_suffix');">
            <span class="splash-timer-value">${currentTimer}${this._t('defaults.seconds_suffix')}</span>
          </div>
        </div>
      `;
    }

    return inputsHtml;
  }

  hasValidationError(key) {
    return this._validationErrors && this._validationErrors.includes(key);
  }

  // Debounced service call helper
  debouncedServiceCall(key, callback, delay = 100) {
    if (this._debounceTimers[key]) {
      clearTimeout(this._debounceTimers[key]);
    }
    this._debounceTimers[key] = setTimeout(() => {
      callback();
      delete this._debounceTimers[key];
    }, delay);
  }

  // Track user interaction with audio player dropdowns
  _trackAudioPlayerInteraction(selector) {
    if (!this._recentAudioPlayerInteractions) {
      this._recentAudioPlayerInteractions = {};
    }
    this._recentAudioPlayerInteractions[selector] = { timestamp: Date.now() };
    
    // Clean up old interactions after 3 seconds
    setTimeout(() => {
      const interaction = this._recentAudioPlayerInteractions[selector];
      if (interaction && Date.now() - interaction.timestamp >= 3000) {
        delete this._recentAudioPlayerInteractions[selector];
      }
    }, 3000);
  }

  // Check if user recently interacted with an audio player dropdown
  _hasRecentAudioPlayerInteraction(selector) {
    const interaction = this._recentAudioPlayerInteractions && this._recentAudioPlayerInteractions[selector];
    return interaction && (Date.now() - interaction.timestamp < 3000); // 3 second window
  }

  // Clear validation errors cache when state changes
  clearValidationCache() {
    this._clearCache('missingVariables');
    this._clearCache('shouldShowSplash');
    this._validationErrors = [];
  }

  handleSplashStart() {
    const missingVariables = this.getMissingGameVariables();
    const splashOverride = this.getSplashOverride();
    const splashTestingMode = this.getSplashTestingMode();
    
    // If we're in testing mode, treat it as if there are missing variables
    // (even if splash override is active)
    if (splashTestingMode || (missingVariables.length > 0 && !splashOverride)) {
      // Highlight missing items
      this._validationErrors = missingVariables.map(v => v.key);
      this.highlightMissingItems();
      
      // Use selective update instead of full re-render
      this.updateSplashValidationState();
      
      // Clear validation errors after 3 seconds
      setTimeout(() => {
        this._validationErrors = [];
        this.updateSplashValidationState();
      }, 3000);
    } else if (missingVariables.length === 0 || splashOverride) {
      // Everything is configured OR splash is forced (and not in testing mode) - transition to game UI and reset game state
      // Call service to reset game state (points, played songs, round counter)
      if (this.hass) {
        this.hass.callService('soundbeats', 'start_game', {});
      }
      
      // NOTE: Following zero-setup philosophy, this method handles UI transition.
      // All configuration changes are already persisted immediately when users interact
      // with UI controls. Actual game logic (song start, scoring, etc.) is initiated
      // by explicit user actions on the game screen, not by this UI transition.
      this._hasLaunchedFromSplash = true;  // Mark that user has successfully launched
      this.clearValidationCache();  // Clear cache to ensure UI updates
      this.render();  // Re-render to transition from splash to main game UI
    }
  }

  updateSplashValidationState() {
    // Update only validation-related elements without full re-render
    const splashSections = this.shadowRoot.querySelectorAll('.splash-input-section');
    splashSections.forEach(section => {
      // Remove error class from all sections first
      section.classList.remove('error');
    });

    // Add error class to sections with validation errors
    if (this._validationErrors) {
      this._validationErrors.forEach(errorKey => {
        const errorSection = this.shadowRoot.querySelector(`.splash-input-section`);
        const allSections = this.shadowRoot.querySelectorAll('.splash-input-section');
        allSections.forEach(section => {
          const hasTeamCount = section.querySelector('.splash-team-count-select') && errorKey === 'teamCount';
          const hasAudioPlayer = section.querySelector('.splash-audio-select') && errorKey === 'audioPlayer';
          const hasTimer = section.querySelector('.splash-timer-slider') && errorKey === 'timer';
          const hasTeams = section.querySelector('.splash-teams-container') && errorKey === 'teams';
          
          if (hasTeamCount || hasAudioPlayer || hasTimer || hasTeams) {
            section.classList.add('error');
          }
        });
      });
    }

    // Update start button state
    const startButton = this.shadowRoot.querySelector('.splash-start-button');
    const startHelp = this.shadowRoot.querySelector('.start-help');
    const missingVariables = this.getMissingGameVariables();
    const isReady = missingVariables.length === 0;
    
    if (startButton) {
      startButton.className = `splash-start-button ${isReady ? 'ready' : 'not-ready'}`;
      startButton.innerHTML = `
        <ha-icon icon="mdi:play-circle" class="icon"></ha-icon>
        ${isReady ? this._t('splash.launch_game') : this._t('splash.start_game')}
      `;
    }
    
    if (startHelp) {
      if (isReady) {
        startHelp.style.display = 'none';
      } else {
        startHelp.style.display = 'block';
      }
    }
  }

  highlightMissingItems() {
    // This method will add visual highlighting to missing items
    // The highlighting is handled by CSS classes applied during re-render
  }

  async render() {
    await this._loadTranslations();
    const isAdmin = this.checkAdminPermissions();
    const showSplash = this.shouldShowSplashScreen();
    
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        /* Ensure secondary text is readable on the gradient background */
        .section .overview-description,
        .section .overview-empty,
        .section .highscore-empty,
        .section .no-team-message {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        
        .title-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          text-align: center;
          position: relative;
          overflow: hidden;
          margin: -16px -16px 24px -16px;
          padding: 20px 16px 24px 16px;
          box-shadow: 
            0 8px 32px rgba(233, 69, 96, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border-bottom: 3px solid rgba(243, 156, 18, 0.6);
        }
        
        .qr-code-icon {
          position: absolute;
          top: 8px;
          left: 8px;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .qr-code-icon:hover {
          background: rgba(255, 255, 255, 1);
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .qr-code-icon ha-icon {
          color: #333;
          --mdc-icon-size: 20px;
        }
        
        .qr-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .qr-modal.show {
          opacity: 1;
          visibility: visible;
        }
        
        .qr-modal-content {
          background: var(--ha-card-background, white);
          border-radius: 12px;
          padding: 24px;
          max-width: 90vw;
          max-height: 90vh;
          position: relative;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          text-align: center;
          transform: scale(0.8);
          transition: transform 0.3s ease;
        }
        
        .qr-modal.show .qr-modal-content {
          transform: scale(1);
        }
        
        .qr-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
        }
        
        .qr-modal-title {
          font-size: 1.2em;
          font-weight: 500;
          color: var(--primary-text-color);
          margin: 0;
        }
        
        .qr-modal-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: background-color 0.2s ease;
          color: var(--secondary-text-color);
        }
        
        .qr-modal-close:hover {
          background: var(--secondary-background-color, #f5f5f5);
        }
        
        .qr-modal-close ha-icon {
          --mdc-icon-size: 24px;
        }
        
        /* Language toggle styles */
        .language-toggle-btn {
          background: linear-gradient(45deg, #2196f3, #21cbf3);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 20px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8em;
          font-weight: bold;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .language-toggle-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .language-toggle-btn ha-icon {
          --mdc-icon-size: 16px;
        }
        
        .splash-language-toggle {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
        }
        
        .settings-language-toggle {
          background: var(--card-background-color, #ffffff);
          border: 1px solid var(--divider-color, #e0e0e0);
          color: var(--primary-text-color);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.9em;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          min-width: 140px;
          justify-content: flex-start;
        }
        
        .settings-language-toggle:hover {
          background: var(--secondary-background-color, #f5f5f5);
          border-color: var(--primary-color, #03a9f4);
        }
        
        .language-flag {
          font-size: 1.2em;
          line-height: 1;
        }
        
        .language-text {
          font-weight: 500;
        }
        
        .qr-code-container {
          margin: 20px 0;
          display: flex;
          justify-content: center;
        }
        
        .qr-code-image {
          max-width: 256px;
          width: 100%;
          height: auto;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 8px;
        }
        
        .qr-modal-description {
          color: var(--secondary-text-color);
          font-size: 0.9em;
          line-height: 1.4;
          margin-top: 16px;
        }
        
        .qr-url-display {
          background: var(--secondary-background-color, #f5f5f5);
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 6px;
          padding: 8px 12px;
          font-family: monospace;
          font-size: 0.8em;
          color: var(--primary-text-color);
          word-break: break-all;
          margin-top: 12px;
        }
        
        .title-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 15% 85%, rgba(233, 69, 96, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 85% 15%, rgba(243, 156, 18, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
          pointer-events: none;
          animation: headerGlow 4s ease-in-out infinite alternate;
        }
        
        .title-section::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(243, 156, 18, 0.8) 20%, 
            rgba(233, 69, 96, 0.8) 50%, 
            rgba(243, 156, 18, 0.8) 80%, 
            transparent 100%);
          animation: musicPulse 2s ease-in-out infinite;
        }
        
        @keyframes headerGlow {
          0% {
            opacity: 0.8;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes musicPulse {
          0%, 100% {
            transform: scaleX(0.8);
            opacity: 0.6;
          }
          50% {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        
        .team-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .admin-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: var(--text-primary-color, white);
          display: ${isAdmin ? 'block' : 'none'};
        }
        
        .section h2 {
          margin: 0 0 8px 0;
          font-size: 1.2em;
          font-weight: 500;
        }
        
        .title-section h2 {
          margin: 0 0 12px 0;
          font-size: 1.8em;
          font-weight: 700;
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(243, 156, 18, 0.4);
          letter-spacing: 0.5px;
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        
        .title-section p {
          margin: 0;
          font-size: 1.1em;
          font-weight: 400;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
          opacity: 0.95;
          letter-spacing: 0.3px;
          position: relative;
          z-index: 2;
        }
        
        .title-section .icon {
          font-size: 1.4em;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          animation: iconBounce 3s ease-in-out infinite;
        }
        
        @keyframes iconBounce {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-3px) rotate(-5deg);
          }
          75% {
            transform: translateY(-1px) rotate(3deg);
          }
        }
        
        .floating-notes {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }
        
        .note {
          position: absolute;
          font-size: 1.2em;
          color: rgba(255, 255, 255, 0.3);
          animation: floatNote 6s ease-in-out infinite;
        }
        
        .note-1 {
          top: 15%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 5s;
        }
        
        .note-2 {
          top: 25%;
          right: 15%;
          animation-delay: 1.5s;
          animation-duration: 7s;
        }
        
        .note-3 {
          bottom: 30%;
          left: 20%;
          animation-delay: 3s;
          animation-duration: 6s;
        }
        
        .note-4 {
          bottom: 20%;
          right: 25%;
          animation-delay: 4.5s;
          animation-duration: 5.5s;
        }
        
        .note-5 {
          top: 40%;
          left: 50%;
          animation-delay: 2s;
          animation-duration: 8s;
        }
        
        @keyframes floatNote {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
          25% {
            transform: translateY(-8px) rotate(5deg);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-4px) rotate(-3deg);
            opacity: 0.3;
          }
          75% {
            transform: translateY(-6px) rotate(2deg);
            opacity: 0.35;
          }
        }
        
        .sound-waves {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 3px;
          z-index: 1;
        }
        
        .wave {
          width: 3px;
          background: linear-gradient(to top, rgba(243, 156, 18, 0.6), rgba(233, 69, 96, 0.4));
          border-radius: 2px;
          animation: soundWave 1.5s ease-in-out infinite;
        }
        
        .wave-1 {
          height: 8px;
          animation-delay: 0s;
        }
        
        .wave-2 {
          height: 12px;
          animation-delay: 0.1s;
        }
        
        .wave-3 {
          height: 16px;
          animation-delay: 0.2s;
        }
        
        .wave-4 {
          height: 12px;
          animation-delay: 0.3s;
        }
        
        .wave-5 {
          height: 8px;
          animation-delay: 0.4s;
        }
        
        @keyframes soundWave {
          0%, 100% {
            transform: scaleY(0.5);
            opacity: 0.6;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        
        /* Responsive design for title section */
        @media (max-width: 768px) {
          .title-section {
            padding: 16px 12px 20px 12px;
          }
          
          .title-section h2 {
            font-size: 1.5em;
            gap: 8px;
          }
          
          .title-section p {
            font-size: 1em;
          }
          
          .floating-notes .note {
            font-size: 1em;
          }
          
          .sound-waves {
            gap: 2px;
          }
          
          .wave {
            width: 2px;
          }
          
          /* Mobile-friendly dropdown improvements */
          .splash-audio-select,
          .splash-team-count-select,
          .splash-team-select,
          .team-user-select {
            font-size: 16px; /* Prevents zoom on iOS */
            min-height: 44px; /* Minimum touch target size */
            padding: 12px 16px;
          }
          
          .splash-team-item {
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
          }
          
          .splash-team-select {
            width: 100%;
            min-width: unset;
          }
        }
        
        @media (max-width: 480px) {
          .title-section h2 {
            font-size: 1.3em;
            flex-direction: column;
            gap: 4px;
          }
          
          .title-section p {
            font-size: 0.9em;
          }
          
          /* Ensure dropdowns are fully visible on small screens */
          .splash-audio-select,
          .splash-team-count-select,
          .splash-team-select,
          .team-user-select {
            max-width: 100%;
            width: 100%;
            box-sizing: border-box;
          }
          
          /* Song card mobile optimizations */
          .song-section .icon {
            font-size: 1.1em;
          }
          
          .song-image {
            width: 120px;
            height: 120px;
          }
          
          .song-name {
            font-size: 1.2em;
          }
          
          .song-artist {
            font-size: 1.0em;
          }
          
          .song-year {
            font-size: 0.95em;
          }
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
          margin-top: 10px;
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
        
        /* 
         * Betting Button Styles
         * Handles both desktop hover and mobile touch states properly
         * Issue: On mobile, tap triggers hover state which conflicts with betting-active
         * Solution: Use media queries to disable hover on touch devices
         */
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
          /* Prevent outline on focus for better mobile experience */
          outline: none;
        }
        
        /* 
         * Hover effects only on devices that support hover (desktop)
         * This prevents mobile tap from triggering blue hover state
         */
        @media (hover: hover) and (pointer: fine) {
          .bet-button:hover:not(.betting-active) {
            background: var(--primary-color-dark, #0288d1);
            transform: translateY(-1px);
          }
          
          .bet-button.betting-active:hover {
            background: var(--warning-color-dark, #f57c00);
          }
        }
        
        /* 
         * Betting active state - shows when team.betting is true
         * This is the primary visual indicator that betting is active
         */
        .bet-button.betting-active {
          background: var(--warning-color, #ff9800);
          animation: pulse-betting 2s infinite;
          /* Ensure betting-active state takes precedence on mobile */
          transition: background-color 0.1s ease;
        }
        
        /* 
         * Focus state for accessibility (keyboard navigation)
         * Provides visual feedback without conflicting with betting state
         */
        .bet-button:focus {
          box-shadow: 0 0 0 2px var(--primary-color, #03a9f4);
        }
        
        .bet-button.betting-active:focus {
          box-shadow: 0 0 0 2px var(--warning-color, #ff9800);
        }
        
        /* 
         * Betting pulse animation - visual indicator when betting is active
         * Creates a glowing effect to draw attention to active bets
         */
        @keyframes pulse-betting {
          0%, 100% { 
            box-shadow: 0 0 5px var(--warning-color, #ff9800);
          }
          50% { 
            box-shadow: 0 0 15px var(--warning-color, #ff9800);
          }
        }
        
        /* 
         * Betting info display - shows potential points when betting is active
         * Only visible when team.betting is true
         */
        .betting-info {
          font-size: 0.8em;
          color: var(--warning-color, #ff9800);
          font-weight: bold;
          margin-top: 4px;
          text-align: center;
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
          color: black;
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
        
        .result-info-positive {
          background: var(--success-color, #4caf50);
          color: black;
        }
        
        .result-info-neutral {
          background: var(--divider-color, #e0e0e0);
          color: var(--primary-text-color, #333);
        }
        
        .result-summary {
          margin-bottom: 4px;
        }
        
        .result-scoring {
          font-size: 0.85em;
          opacity: 0.9;
          font-style: italic;
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
          padding: 16px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
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
          flex-wrap: wrap;
          min-width: 0;
        }
        
        .team-management-section {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
        }
        
        .team-management-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .team-management-header h4 {
          margin: 0;
          font-size: 1.1em;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        
        .team-management-count-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
          background: var(--card-background-color, white);
          color: var(--primary-text-color);
          font-size: 14px;
          max-width: 300px;
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
          gap: 20px;
        }
        
        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 12px;
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

        .team-user-select {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
          background: var(--card-background-color, white);
          color: var(--primary-text-color);
          font-size: 14px;
          min-width: 150px;
          max-width: 200px;
        }
        
        .countdown-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .song-card {
          text-align: center;
          padding: 16px;
          position: relative;
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

        .song-next-button {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, #667eea 100%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 4px 6px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8em;
          transition: background 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          min-width: 24px;
          min-height: 24px;
        }

        .song-next-button:hover {
          background: linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, #764ba2 100%);
        }

        .song-next-button ha-icon {
          --mdc-icon-size: 16px;
        }

        .song-volume-buttons {
          position: absolute;
          bottom: 8px;
          left: 8px;
          display: flex;
          flex-direction: row;
          gap: 4px;
        }

        .song-volume-button {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: var(--primary-text-color);
          padding: 4px 6px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8em;
          transition: background 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          min-height: 24px;
        }

        .song-volume-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .song-volume-button ha-icon {
          --mdc-icon-size: 16px;
        }

        .expandable-header {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .expandable-header h3 {
          flex: 1;
          margin: 0;
          margin-right: 16px; /* Reduced spacing - was previously maximized with space-between */
        }

        .expandable-header .expander-icon {
          margin-left: auto;
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
          padding: 16px;
        }
        
        .expandable-content p {
          margin-bottom: 16px;
          margin-top: 0;
        }
        
        /* Teams Overview Section Styles */
        .teams-overview-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .overview-description {
          font-size: 0.9em;
          color: var(--secondary-text-color, #666);
          margin-bottom: 12px;
          font-style: italic;
        }
        
        .teams-overview-container {
          display: flex;
          flex-direction: row;
          gap: 12px;
          overflow-x: auto;
          padding: 8px 0;
          scroll-behavior: smooth;
        }
        
        .teams-overview-container::-webkit-scrollbar {
          height: 6px;
        }
        
        .teams-overview-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        
        .teams-overview-container::-webkit-scrollbar-thumb {
          background: var(--primary-color, #03a9f4);
          border-radius: 3px;
        }
        
        .overview-team-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 8px;
          border-radius: 10px;
          background: var(--card-background-color, white);
          border: 2px solid transparent;
          transition: all 0.3s ease;
          min-width: 85px;
          max-width: 130px;
          flex-shrink: 0;
          text-align: center;
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .overview-team-item.rank-1 {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
          color: #000;
          border-color: #FFD700;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
          font-weight: 600;
        }
        
        .overview-team-item.rank-2 {
          background: linear-gradient(135deg, #E8E8E8 0%, #D0D0D0 50%, #B8B8B8 100%);
          color: #000;
          border-color: #C0C0C0;
          box-shadow: 0 4px 12px rgba(192, 192, 192, 0.4);
          font-weight: 600;
        }
        
        .overview-team-item.rank-3 {
          background: linear-gradient(135deg, #D2691E 0%, #CD853F 50%, #BC8F8F 100%);
          color: #000;
          border-color: #CD7F32;
          box-shadow: 0 4px 12px rgba(205, 127, 50, 0.4);
          font-weight: 600;
        }
        
        .overview-team-item.rank-other {
          background: linear-gradient(135deg, #6c757d 0%, #5a6268 50%, #495057 100%);
          color: #fff;
          border-color: #495057;
          box-shadow: 0 4px 8px rgba(73, 80, 87, 0.3);
          font-weight: 500;
        }
        
        .overview-rank-badge {
          margin-bottom: 4px;
          font-size: 1.3em;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }
        
        .overview-team-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 100%;
        }
        
        .overview-team-name {
          font-weight: 600;
          font-size: 0.8em;
          line-height: 1.2;
          word-break: break-word;
          hyphens: auto;
          max-width: 100%;
          order: 2;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .overview-team-points {
          font-weight: bold;
          font-size: 1.0em;
          order: 1;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }
        
        .overview-team-badges {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          position: absolute;
          top: 4px;
          right: 4px;
          width: auto;
        }
        
        .overview-team-points-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          position: absolute;
          top: 4px;
          left: 4px;
          width: auto;
        }
        
        .overview-bet-badge {
          background: var(--warning-color, #ff9800);
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 0.6em;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 1px;
          animation: pulse-bet-overview 2s infinite;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          box-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);
          white-space: nowrap;
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
          font-size: 0.7em;
          color: #000;
          font-weight: bold;
          text-align: center;
          line-height: 1.1;
          background: rgba(255, 255, 255, 0.8);
          padding: 2px 4px;
          border-radius: 4px;
          min-width: 20px;
        }
        
        .overview-year-badge,
        .overview-points-badge {
          font-size: 0.7em;
          font-weight: bold;
          text-align: center;
          line-height: 1.1;
          padding: 2px 4px;
          border-radius: 4px;
          min-width: 20px;
          margin-bottom: 2px;
        }
        
        .overview-year-badge.points-earned,
        .overview-points-badge.points-earned {
          background: #4caf50;
          color: black;
        }
        
        .overview-year-badge.no-points,
        .overview-points-badge.no-points {
          background: #f44336;
          color: white;
        }
        }
        
        .overview-empty {
          text-align: center;
          padding: 20px;
          color: var(--secondary-text-color, #666);
          font-style: italic;
        }
        
        /* Alert Banner Styles */
        .alert-banner {
          position: fixed;
          top: 20px;
          right: -400px;
          width: 350px;
          background: var(--error-color, #f44336);
          color: var(--text-primary-color, white);
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .alert-banner.show {
          right: 20px;
        }
        
        .alert-banner .alert-icon {
          font-size: 1.5em;
          color: var(--text-primary-color, white);
          flex-shrink: 0;
        }
        
        .alert-banner .alert-content {
          flex: 1;
        }
        
        .alert-banner .alert-title {
          font-weight: 600;
          font-size: 1.1em;
          margin: 0 0 4px 0;
        }
        
        .alert-banner .alert-message {
          font-size: 0.9em;
          opacity: 0.9;
          margin: 0;
          line-height: 1.3;
        }
        
        .alert-banner .alert-dismiss {
          background: none;
          border: none;
          color: var(--text-primary-color, white);
          font-size: 1.2em;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          opacity: 0.8;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
        }
        
        .alert-banner .alert-dismiss:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.1);
        }
        
        /* Highscore Record Banner Styles */
        .highscore-banner {
          position: fixed;
          top: 20px;
          right: -400px;
          width: 350px;
          background: linear-gradient(135deg, #ff6b35 0%, #f39c12 50%, #ffd700 100%);
          color: #fff;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 
            0px 4px 12px rgba(0, 0, 0, 0.3),
            0px 0px 20px rgba(255, 215, 0, 0.4);
          z-index: 1001;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border: 2px solid rgba(255, 215, 0, 0.6);
          animation: bannerGlow 2s ease-in-out infinite alternate;
        }
        
        .highscore-banner.show {
          right: 20px;
        }
        
        @keyframes bannerGlow {
          0% {
            box-shadow: 
              0px 4px 12px rgba(0, 0, 0, 0.3),
              0px 0px 20px rgba(255, 215, 0, 0.4);
          }
          100% {
            box-shadow: 
              0px 4px 12px rgba(0, 0, 0, 0.3),
              0px 0px 30px rgba(255, 215, 0, 0.6);
          }
        }
        
        .highscore-banner .banner-icon {
          font-size: 1.8em;
          color: #ffd700;
          flex-shrink: 0;
          animation: crownBounce 1.5s ease-in-out infinite;
        }
        
        @keyframes crownBounce {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(-5deg) scale(1.1);
          }
        }
        
        .highscore-banner .banner-content {
          flex: 1;
        }
        
        .highscore-banner .banner-title {
          font-weight: 700;
          font-size: 1.2em;
          margin: 0 0 4px 0;
          text-shadow: 
            0 1px 2px rgba(0, 0, 0, 0.3),
            0 0 10px rgba(255, 215, 0, 0.5);
        }
        
        .highscore-banner .banner-message {
          font-size: 0.95em;
          margin: 0;
          line-height: 1.3;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
        }
        
        .highscore-banner .banner-dismiss {
          background: none;
          border: none;
          color: #fff;
          font-size: 1.2em;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          opacity: 0.8;
          transition: opacity 0.2s ease, background 0.2s ease;
          flex-shrink: 0;
        }
        
        .highscore-banner .banner-dismiss:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.2);
        }
        
        /* Highscore Section Styles */
        .highscore-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .highscore-display {
          display: flex;
          flex-direction: row;
          gap: 16px;
          align-items: stretch;
        }
        
        .global-highscore {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%);
          border-radius: 8px;
          border: 2px solid rgba(255, 215, 0, 0.4);
          flex: 1;
          justify-content: space-between;
        }
        
        .highscore-header {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 2em;
          justify-content: center;
        }
        
        .crown-icon {
          color: #ffd700;
          font-size: 1.5em;
        }
        
        .highscore-label {
          font-weight: bold;
          color: var(--primary-text-color, #333);
        }
        
        .highscore-value {
          font-size: 1.4em;
          font-weight: bold;
          color: #ff8c00;
          margin-top: auto;
        }
        
        .user-average {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          padding: 16px;
          background: rgba(100, 149, 237, 0.1);
          border-radius: 8px;
          border: 2px solid rgba(100, 149, 237, 0.2);
          font-weight: bold;
          flex: 1;
          justify-content: space-between;
        }
        
        .user-average .icon {
          color: #6495ed;
        }
        
        .highscore-empty {
          text-align: center;
          color: var(--secondary-text-color, #666);
          font-style: italic;
          padding: 16px;
        }
        
        /* Highscore Diagnostic Styles */
        .highscore-diagnostic {
          margin-top: 12px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
          background: var(--card-background-color, #fafafa);
        }
        
        .highscore-diagnostic .expandable-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          padding: 8px 12px;
          background: rgba(255, 152, 0, 0.1);
          border-radius: 4px 4px 0 0;
        }
        
        .highscore-diagnostic .expandable-header:hover {
          background: rgba(255, 152, 0, 0.2);
        }
        
        .diagnostic-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9em;
          color: var(--secondary-text-color, #666);
        }
        
        .diagnostic-title .icon {
          --mdc-icon-size: 18px;
          color: var(--warning-color, #ff9800);
        }
        
        .diagnostic-item {
          margin-bottom: 8px;
          font-size: 0.85em;
          line-height: 1.4;
        }
        
        .diagnostic-item:last-child {
          margin-bottom: 0;
        }
        
        .diagnostic-item strong {
          color: var(--primary-text-color, #212121);
        }
        
        .diagnostic-item ul {
          margin: 4px 0 0 16px;
          padding: 0;
        }
        
        .diagnostic-item li {
          margin: 2px 0;
        }
        
        .diagnostic-item pre {
          background: var(--divider-color, #f0f0f0);
          padding: 8px;
          border-radius: 4px;
          font-size: 0.8em;
          overflow-x: auto;
          margin: 4px 0;
        }
        
        /* Splash Screen Styles */
        .splash-screen {
          text-align: center;
          padding: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: var(--ha-card-border-radius, 4px);
          color: white;
          position: relative;
          overflow: hidden;
          min-height: 400px;
        }
        
        .splash-header {
          position: relative;
          z-index: 2;
          margin-bottom: 32px;
        }
        
        .splash-header h1 {
          font-size: 2.5em;
          margin: 16px 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .splash-icon {
          font-size: 1.2em;
          color: #ffd700;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          animation: iconBounce 3s ease-in-out infinite;
        }
        
        .splash-subtitle {
          font-size: 1.2em;
          margin: 16px 0;
          opacity: 0.9;
        }
        
        .splash-floating-notes {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }
        
        .splash-sound-waves {
          display: flex;
          justify-content: center;
          gap: 3px;
          margin: 16px 0;
        }
        
        .splash-ready {
          z-index: 2;
          position: relative;
        }
        
        .ready-message {
          margin-bottom: 24px;
        }
        
        .ready-message h2 {
          font-size: 2em;
          margin: 16px 0;
          color: #90ee90;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .ready-icon {
          font-size: 3em;
          color: #90ee90;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          animation: pulse 2s ease-in-out infinite alternate;
        }
        
        .splash-launch-button {
          background: linear-gradient(45deg, #ff6b6b, #feca57);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 50px;
          font-size: 1.3em;
          font-weight: bold;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .splash-launch-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
        }
        
        .splash-launch-button:active {
          transform: translateY(0);
        }
        
        .splash-setup {
          z-index: 2;
          position: relative;
        }
        
        .setup-message h2 {
          font-size: 1.8em;
          margin: 16px 0;
          color: #ffeb3b;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .setup-icon {
          font-size: 2.5em;
          color: #ffeb3b;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          animation: rotate 4s linear infinite;
        }
        
        .missing-variables {
          margin: 24px 0;
          text-align: left;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .missing-variable {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          margin: 12px 0;
          border-left: 4px solid #ff6b6b;
        }
        
        .variable-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .variable-header h3 {
          margin: 0;
          color: #ff6b6b;
        }
        
        .variable-icon {
          color: #ff6b6b;
          font-size: 1.2em;
        }
        
        .setup-help {
          margin-top: 24px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 16px;
        }
        
        /* Splash Screen Input Styles */
        .splash-settings {
          margin: 24px 0;
          text-align: left;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .splash-input-section {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
          margin: 16px 0;
          border-left: 4px solid #4caf50;
          transition: all 0.3s ease;
        }
        
        .splash-input-section.error {
          border-left-color: #ff6b6b;
          background: rgba(255, 107, 107, 0.2);
          animation: errorShake 0.5s ease-in-out;
        }
        
        .splash-input-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .splash-input-header h3 {
          margin: 0;
          color: #ffffff;
          font-size: 1.1em;
        }
        
        .input-icon {
          color: #4caf50;
          font-size: 1.2em;
        }
        
        .splash-input-section.error .input-icon {
          color: #ff6b6b;
        }
        
        .input-description {
          margin: 8px 0 12px 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9em;
        }
        
        .admin-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 193, 7, 0.15);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 6px;
          padding: 10px 12px;
          margin: 8px 0 16px 0;
          color: #ffdb57;
          font-size: 0.85em;
        }
        
        .admin-warning .warning-icon {
          color: #ffdb57;
          font-size: 1.2em;
          flex-shrink: 0;
        }
        
        .splash-audio-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .splash-audio-select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .splash-audio-select option {
          background: #333;
          color: white;
        }
        
        .splash-team-count-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
        }
        
        .splash-team-count-select option {
          background: #333;
          color: white;
        }
        
        .splash-timer-control {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .splash-timer-slider {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }
        
        .splash-timer-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #4caf50;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .splash-timer-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #4caf50;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        
        .splash-timer-value {
          min-width: 60px;
          text-align: center;
          font-weight: bold;
          color: #4caf50;
        }
        
        .splash-teams-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .splash-teams-prompt {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
        }
        
        .prompt-icon {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.1em;
        }
        
        .splash-team-item {
          display: grid;
          grid-template-columns: auto 1fr 1fr;
          gap: 8px;
          align-items: center;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        
        .team-label {
          font-weight: bold;
          color: white;
          white-space: nowrap;
        }
        
        .splash-team-input {
          padding: 6px 8px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
        }
        
        .splash-team-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        .splash-team-select {
          padding: 6px 8px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .splash-team-select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .splash-team-select option {
          background: #333;
          color: white;
        }
        
        .splash-team-participating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: white;
          font-size: 0.85em;
          cursor: pointer;
        }
        
        .splash-start-section {
          margin-top: 32px;
          z-index: 2;
          position: relative;
        }
        
        .splash-start-button {
          background: linear-gradient(45deg, #ff6b6b, #feca57);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 50px;
          font-size: 1.3em;
          font-weight: bold;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .splash-start-button.not-ready {
          background: linear-gradient(45deg, #9e9e9e, #757575);
          opacity: 0.8;
        }
        
        .splash-start-button.ready {
          background: linear-gradient(45deg, #4caf50, #66bb6a);
        }
        
        .splash-start-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
        }
        
        .splash-start-button:active {
          transform: translateY(0);
        }
        
        .start-help {
          margin-top: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9em;
        }
        
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .variable-description {
          margin: 0;
          opacity: 0.9;
          line-height: 1.5;
        }
        
        .setup-help {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }
        
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        /* Version Footer Styles */
        .version-footer {
          position: absolute;
          bottom: 8px;
          left: 8px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          font-family: monospace;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          pointer-events: none;
          z-index: 1000;
        }
        
        /* Version footer for main card */
        .soundbeats-card {
          position: relative;
        }
        
        .soundbeats-card .version-footer {
          color: var(--secondary-text-color, rgba(0, 0, 0, 0.5));
          text-shadow: none;
        }
      </style>
      
      <!-- Alert Banner for No Audio Player Selected -->
      <div class="alert-banner" id="no-audio-player-alert">
        <ha-icon icon="mdi:alert-circle" class="alert-icon"></ha-icon>
        <div class="alert-content">
          <div class="alert-title">${this._t('alerts.no_audio_player_title')}</div>
          <div class="alert-message">${this._t('alerts.no_audio_player_message')}</div>
        </div>
        <button class="alert-dismiss" onclick="this.getRootNode().host.hideAlertBanner('no-audio-player-alert')">
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      
      <!-- Alert Banner for All Songs Played -->
      <div class="alert-banner" id="all-songs-played-alert" style="background: var(--warning-color, #ff9800);">
        <ha-icon icon="mdi:playlist-remove" class="alert-icon"></ha-icon>
        <div class="alert-content">
          <div class="alert-title">${this._t('alerts.all_songs_played_title')}</div>
          <div class="alert-message">${this._t('alerts.all_songs_played_message')}</div>
        </div>
        <button class="alert-dismiss" onclick="this.getRootNode().host.hideAlertBanner('all-songs-played-alert')">
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      
      <!-- Highscore Record Banner -->
      <div class="highscore-banner" id="highscore-record-banner">
        <ha-icon icon="mdi:crown" class="banner-icon"></ha-icon>
        <div class="banner-content">
          <div class="banner-title">🎉 NEW RECORD! 🎉</div>
          <div class="banner-message" id="highscore-banner-message">${this._t('alerts.new_highscore_message')}</div>
        </div>
        <button class="banner-dismiss" onclick="this.getRootNode().host.hideHighscoreBanner()">
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      
      ${showSplash ? this.renderSplashScreen() : `
      <div class="soundbeats-card">
        <!-- Title Section - Always visible -->
        <div class="section title-section">
          <div class="floating-notes">
            <div class="note note-1">♪</div>
            <div class="note note-2">♫</div>
            <div class="note note-3">♪</div>
            <div class="note note-4">♬</div>
            <div class="note note-5">♪</div>
          </div>
          <h2>
            <ha-icon icon="mdi:music-note" class="icon"></ha-icon>
            ${this._t('ui.title')}
          </h2>
          <p>${this._t('ui.description')}</p>
          <div class="sound-waves">
            <div class="wave wave-1"></div>
            <div class="wave wave-2"></div>
            <div class="wave wave-3"></div>
            <div class="wave wave-4"></div>
            <div class="wave wave-5"></div>
          </div>
          <div class="qr-code-icon" onclick="this.getRootNode().host.showQrModal()">
            <ha-icon icon="mdi:qrcode"></ha-icon>
          </div>
        </div>
        
        <!-- Countdown Section - Only visible when timer is running -->
        <div class="section countdown-section ${this.getCountdownCurrent() > 0 ? '' : 'hidden'}">
          <h3>
            <ha-icon icon="mdi:timer-sand" class="icon"></ha-icon>
            ${this._t('ui.song_timer')}
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
            ${this._t('ui.current_song')}
          </h3>
          ${this.getCurrentSong() ? `
            <div class="song-card">
              <img src="${this.getCurrentSong().entity_picture}" alt="Song Cover" class="song-image" />
              <div class="song-name">${this.getCurrentSong().song_name}</div>
              <div class="song-artist">${this.getCurrentSong().artist}</div>
              <div class="song-year">${this.getCurrentSong().year}</div>
              ${isAdmin ? `
                <div class="song-volume-buttons">
                  <button class="song-volume-button" onclick="this.getRootNode().host.volumeDown()" title="${this._t('ui.volume_down')}">
                    <ha-icon icon="mdi:volume-minus"></ha-icon>
                  </button>
                  <button class="song-volume-button" onclick="this.getRootNode().host.togglePlayPause()" title="${this.getMediaPlayerState() === 'playing' ? this._t('ui.pause') : this._t('ui.play')}">
                    <ha-icon icon="${this.getMediaPlayerState() === 'playing' ? 'mdi:pause' : 'mdi:play'}"></ha-icon>
                  </button>
                  <button class="song-volume-button" onclick="this.getRootNode().host.volumeUp()" title="${this._t('ui.volume_up')}">
                    <ha-icon icon="mdi:volume-plus"></ha-icon>
                  </button>
                </div>
                <button class="song-next-button" onclick="this.getRootNode().host.nextSong()">
                  <ha-icon icon="mdi:skip-next" class="icon"></ha-icon>
                  ${this._t('ui.next_song')}
                </button>
              ` : ''}
            </div>
          ` : ''}
        </div>
        
        <!-- Teams Overview Section - Always visible -->
        <div class="section teams-overview-section">
          <h3>
            <ha-icon icon="mdi:podium" class="icon"></ha-icon>
            ${this._t('ui.teams_overview')}
          </h3>
          
          <div class="teams-overview-container">
            ${this.renderOtherTeamsOverview()}
          </div>
        </div>
        
        <!-- Team Section - Always visible -->
        <div class="section team-section">
          <h3>
            <ha-icon icon="mdi:account-group" class="icon"></ha-icon>
            ${this._t('ui.team_status')}
          </h3>
          
          <div class="teams-container">
            ${this.renderTeams()}
          </div>
        </div>
        
        <!-- Highscore Section - Always visible and expandable -->
        <div class="section highscore-section">
          <div class="expandable-header" onclick="this.getRootNode().host.toggleHighscore()">
            <h3>
              <ha-icon icon="mdi:trophy" class="icon"></ha-icon>
              ${this._ts('ui.highscores_after_round', { round: this.getRoundCounter() })}
            </h3>
            <ha-icon icon="mdi:chevron-down" class="expander-icon ${this.highscoreExpanded ? 'expanded' : ''}"></ha-icon>
          </div>
          <div class="expandable-content ${this.highscoreExpanded ? 'expanded' : 'collapsed'}">
            ${this.renderHighscores()}
          </div>
        </div>
        
        <!-- Game Settings Section - Only visible to admins -->
        <div class="section admin-section ${isAdmin ? '' : 'hidden'}">
          <div class="expandable-header" onclick="this.getRootNode().host.toggleGameSettings()">
            <h3>
              <ha-icon icon="mdi:cog" class="icon"></ha-icon>
              ${this._t('ui.game_settings')}
            </h3>
            <ha-icon icon="mdi:chevron-down" class="expander-icon ${this.gameSettingsExpanded ? 'expanded' : ''}"></ha-icon>
          </div>
          <div class="expandable-content ${this.gameSettingsExpanded ? 'expanded' : 'collapsed'}">
            <div class="game-settings">
              <div class="setting-item">
                <button class="admin-button" onclick="this.getRootNode().host.startNewGame()">
                  <ha-icon icon="mdi:play" class="icon"></ha-icon>
                  Start a new Game
                </button>
              </div>
              <div class="setting-item">
                <div class="setting-label">
                  <ha-icon icon="mdi:timer-outline" class="icon"></ha-icon>
                  ${this._t('ui.countdown_timer_length')}
                </div>
                <div class="setting-control">
                  <input 
                    type="range" 
                    class="timer-slider" 
                    min="5" 
                    max="300" 
                    step="5" 
                    value="${this.getCountdownTimerLength()}"
                    oninput="this.getRootNode().host.updateCountdownTimerLength(this.value); this.nextElementSibling.textContent = this.value + this.getRootNode().host._t('defaults.seconds_suffix');"
                  />
                  <span class="timer-value">${this.getCountdownTimerLength()}${this._t('defaults.seconds_suffix')}</span>
                </div>
              </div>
              <div class="setting-item">
                <div class="setting-label">
                  <ha-icon icon="mdi:speaker" class="icon"></ha-icon>
                  ${this._t('settings.audio_player')}
                </div>
                <div class="setting-control">
                  <select 
                    class="audio-player-select" 
                    onchange="this.getRootNode().host.updateAudioPlayer(this.value)"
                    onfocus="this.getRootNode().host._trackAudioPlayerInteraction('.audio-player-select')"
                    onmousedown="this.getRootNode().host._trackAudioPlayerInteraction('.audio-player-select')"
                  >
                    <option value="">${this._t('ui.select_audio_player')}</option>
                    ${this.getMediaPlayers().map(player => 
                      `<option value="${player.entity_id}" ${this.getSelectedAudioPlayer() === player.entity_id ? 'selected' : ''}>
                        ${player.name} - ${player.entity_id}
                      </option>`
                    ).join('')}
                  </select>
                </div>
              </div>
              <div class="setting-item">
                <div class="setting-label">
                  <ha-icon icon="mdi:translate" class="icon"></ha-icon>
                  ${this._t('ui.language')}
                </div>
                <div class="setting-control">
                  <button class="language-toggle-btn settings-language-toggle" onclick="this.getRootNode().host._toggleLanguage()" title="${this._t('ui.language')}">
                    <span class="language-flag">${this._currentLanguage === 'en' ? '🇩🇪' : '🇬🇧'}</span>
                    <span class="language-text">${this._currentLanguage === 'en' ? this._t('language_toggle.german') : this._t('language_toggle.english')}</span>
                  </button>
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
              ${this._t('ui.team_management')}
            </h3>
            <ha-icon icon="mdi:chevron-down" class="expander-icon ${this.teamManagementExpanded ? 'expanded' : ''}"></ha-icon>
          </div>
          <div class="expandable-content ${this.teamManagementExpanded ? 'expanded' : 'collapsed'}">
            <p class="team-management-description">${this.getTeamManagementDescription()}</p>
            <div class="team-management-container">
              ${this.renderTeamManagement()}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Version Footer -->
      <div class="version-footer">
        v${this.getVersion()}
      </div>
      `}
      
      <!-- QR Code Modal -->
      <div class="qr-modal" id="qr-modal">
        <div class="qr-modal-content">
          <div class="qr-modal-header">
            <h3 class="qr-modal-title">${this._t('ui.qr_modal_title')}</h3>
            <button class="qr-modal-close" onclick="this.getRootNode().host.hideQrModal()">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="qr-code-container">
            <img class="qr-code-image" id="qr-code-image" alt="${this._t('ui.qr_code_alt')}" />
          </div>
          <div class="qr-modal-description">
            ${this._t('ui.qr_modal_description')}
          </div>
          <div class="qr-url-display" id="qr-url-display"></div>
        </div>
      </div>
    `;
  }

  getVersion() {
    // Get version from HACS (GitHub release), then Home Assistant integration registry
    if (this.hass && this.hass.connection) {
      // Try to get integration information (prioritizing HACS/GitHub release version)
      try {
        // Cache the version to avoid repeated calls
        if (this._cachedVersion) {
          return this._cachedVersion;
        }
        
        // For now, return a placeholder while we fetch the version asynchronously
        // This will be updated when the integration info is loaded
        return this._integrationVersion || "1.0.0";
      } catch (error) {
        console.warn('Could not fetch integration version:', error);
        return "1.0.0"; // Fallback version
      }
    }
    return "1.0.0"; // Fallback when Home Assistant is not available
  }

  async _loadIntegrationVersion() {
    // Load the integration version from HACS (GitHub release), then Home Assistant
    if (!this.hass || !this.hass.connection) {
      return;
    }

    try {
      // First, try to get version from HACS repository data (GitHub release version)
      const hacsRepositories = await this.hass.callWS({
        type: 'hacs/repositories'
      });
      
      if (hacsRepositories && Array.isArray(hacsRepositories)) {
        const soundbeatsRepo = hacsRepositories.find(repo => 
          repo.name === 'Soundbeats' || 
          repo.full_name === 'mholzi/Soundbeats' ||
          repo.id === 'mholzi/Soundbeats'
        );
        
        if (soundbeatsRepo && soundbeatsRepo.installed_version) {
          this._integrationVersion = soundbeatsRepo.installed_version;
          this._cachedVersion = soundbeatsRepo.installed_version;
          this._updateVersionDisplay();
          console.info('Using HACS version:', soundbeatsRepo.installed_version);
          return;
        }
      }
    } catch (hacsError) {
      console.warn('Could not fetch version from HACS, trying integration registry:', hacsError);
    }

    try {
      // Fallback 1: Call Home Assistant WebSocket API to get integration information
      const integrationInfo = await this.hass.callWS({
        type: 'config/integration_registry/get',
        domain: 'soundbeats'
      });
      
      if (integrationInfo && integrationInfo.version) {
        this._integrationVersion = integrationInfo.version;
        this._cachedVersion = integrationInfo.version;
        // Re-render version display if it's currently shown
        this._updateVersionDisplay();
        console.info('Using integration registry version:', integrationInfo.version);
        return;
      }
    } catch (error) {
      console.warn('Could not fetch integration version from registry, trying manifest:', error);
    }
    
    // Fallback 2: try to get version from integration manifest
    try {
      const manifestInfo = await this.hass.callWS({
        type: 'manifest/get',
        integration: 'soundbeats'
      });
      
      if (manifestInfo && manifestInfo.version) {
        this._integrationVersion = manifestInfo.version;
        this._cachedVersion = manifestInfo.version;
        this._updateVersionDisplay();
        console.info('Using manifest version:', manifestInfo.version);
        return;
      }
    } catch (manifestError) {
      console.warn('Could not fetch version from manifest either:', manifestError);
    }
    
    // Final fallback
    console.warn('Using fallback version 1.0.0');
    this._integrationVersion = "1.0.0";
    this._cachedVersion = "1.0.0";
  }

  _updateVersionDisplay() {
    // Update version display elements if they exist
    const versionElements = this.shadowRoot.querySelectorAll('.version-footer');
    versionElements.forEach(element => {
      element.textContent = `v${this.getVersion()}`;
    });
  }

  checkAdminPermissions() {
    // Check if current user is assigned to team_1 (team 1 user is admin)
    if (!this.hass || !this.hass.user) {
      return false;
    }
    
    const currentUserId = this.hass.user.id;
    const teams = this.getTeams();
    
    // Check if team_1 exists and if current user is assigned to it
    return !!(teams && teams.team_1 && teams.team_1.user_id === currentUserId);
  }


  getGameMode() {
    // Get game mode from the dedicated sensor entity
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_game_mode'];
      return entity ? entity.state : this._t('defaults.classic_mode');
    }
    return this._t('defaults.classic_mode');
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
    const teamCount = this.getSelectedTeamCount();
    
    // Return empty teams object if no team count is set
    if (!teamCount || teamCount < 1 || teamCount > 5) {
      return {};
    }
    
    if (this.hass && this.hass.states) {
      const teams = {};
      for (let i = 1; i <= teamCount; i++) {
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
            last_round_betting: entity.attributes && entity.attributes.last_round_betting !== undefined ? entity.attributes.last_round_betting : false,
            last_round_points: entity.attributes && entity.attributes.last_round_points !== undefined ? entity.attributes.last_round_points : 0,
            user_id: entity.attributes && entity.attributes.user_id !== undefined ? entity.attributes.user_id : null
          };
        } else {
          // Fallback to default if entity doesn't exist yet
          teams[teamKey] = {
            name: this._ts('settings.default_team_name', { number: i }),
            points: 0,
            participating: true,
            year_guess: 1990,
            betting: false,
            last_round_betting: false,
            last_round_points: 0,
            user_id: null
          };
        }
      }
      return teams;
    }
    // Return default teams if no data available
    const defaultTeams = {};
    for (let i = 1; i <= teamCount; i++) {
      const teamKey = `team_${i}`;
      defaultTeams[teamKey] = {
        name: this._ts('settings.default_team_name', { number: i }),
        points: 0,
        participating: true,
        year_guess: 1990,
        betting: false,
        last_round_betting: false,
        last_round_points: 0,
        user_id: null
      };
    }
    return defaultTeams;
  }

  getTeamRankings(globalRankings = false) {
    // Calculate team rankings based on points among participating teams
    // globalRankings=true: all participating teams, globalRankings=false: only current user's teams
    const teams = this.getTeams();
    
    // Get current user ID for filtering (only used when globalRankings=false)
    const currentUserId = this.hass && this.hass.user ? this.hass.user.id : null;
    
    const participatingTeams = Object.entries(teams)
      .filter(([teamId, team]) => {
        if (globalRankings) {
          return team.participating; // Show all participating teams
        } else {
          return team.participating && team.user_id === currentUserId; // User-specific
        }
      })
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

  async loadHomeAssistantUsers() {
    // Load Home Assistant users if not already loaded
    if (!this.usersLoaded && this.hass) {
      try {
        this._isLoadingUsers = true;
        this.homeAssistantUsers = await this.getHomeAssistantUsers();
        this.usersLoaded = true;
      } catch (error) {
        console.warn('Failed to load Home Assistant users:', error);
        this.homeAssistantUsers = [];
        this.usersLoaded = true;
      } finally {
        this._isLoadingUsers = false;
      }
    }
  }

  renderTeamManagement() {
    // Use unified rendering logic from splash screen
    const teamCount = this.getSelectedTeamCount();
    const hasValidTeamCount = teamCount && teamCount >= 1 && teamCount <= 5;
    
    // Always show team count dropdown at the top
    let html = `
      <div class="team-management-section">
        <div class="team-management-header">
          <ha-icon icon="mdi:account-group" class="input-icon"></ha-icon>
          <h4>${this._t('settings.number_of_teams')}</h4>
        </div>
        <select class="team-management-count-select" onchange="this.getRootNode().host.updateTeamCount(this.value)">
          <option value="">${this._t('settings.select_teams_placeholder')}</option>
          ${[1, 2, 3, 4, 5].map(count => 
            `<option value="${count}" ${teamCount === count ? 'selected' : ''}>
              ${this._ts('settings.teams_count_option', { count: count, plural: count > 1 ? 's' : '' })}
            </option>`
          ).join('')}
        </select>
      </div>
    `;
    
    if (hasValidTeamCount) {
      html += this.renderTeamsContent('management');
    } else {
      html += `
        <div class="team-management-prompt">
          <ha-icon icon="mdi:arrow-up" class="prompt-icon"></ha-icon>
          <span>${this._t('settings.select_teams_for_assignments')}</span>
        </div>
      `;
    }
    
    return html;
  }

  getTeamManagementDescription() {
    // Use unified description logic 
    const teamCount = this.getSelectedTeamCount();
    const hasValidTeamCount = teamCount && teamCount >= 1 && teamCount <= 5;
    
    if (hasValidTeamCount) {
      return this._ts('settings.team_assignment_description', { count: teamCount, plural: teamCount > 1 ? 's' : '' });
    } else {
      return this._t('settings.select_teams_for_assignments_full');
    }
  }

  renderTeams() {
    const teams = this.getTeams();
    const rankings = this.getTeamRankings();
    const isCountdownRunning = this.getCountdownCurrent() > 0;
    const currentYear = new Date().getFullYear();
    const currentRound = this.getRoundCounter();
    
    // Get current user ID for filtering
    const currentUserId = this.hass && this.hass.user ? this.hass.user.id : null;
    
    return Object.entries(teams)
      .filter(([teamId, team]) => team.participating && team.user_id === currentUserId)
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
          <span class="team-points">${team.points} ${this._t('defaults.points_suffix')}</span>
        </div>
        <div class="team-content">
          ${isCountdownRunning ? `
            <div class="year-guess-section">
              <label class="year-guess-label">${this._t('game.year_guess_label')}</label>
              <div class="year-guess-control">
                <input type="range" class="year-slider" min="1950" max="${currentYear}" value="${team.year_guess}" 
                       oninput="this.nextElementSibling.textContent = this.value; this.getRootNode().host.updateTeamYearGuess('${teamId}', this.value)">
                <span class="year-value">${team.year_guess}</span>
              </div>
              <div class="betting-section">
                <!-- 
                  Betting button: Visual state controlled by team.betting from backend
                  - Default state: blue button with "Place Bet" text
                  - Active state: orange button with "BETTING!" text + pulse animation
                  - Bonus info only shows when team.betting is true
                -->
                <button class="bet-button ${team.betting ? 'betting-active' : ''}" 
                        onclick="this.getRootNode().host.toggleTeamBetting('${teamId}', ${!team.betting})"
                        aria-label="${team.betting ? this._t('betting.cancel_bet_aria') : this._ts('betting.place_bet_for_aria', { team: team.name })}">
                  ${team.betting ? this._t('betting.betting_active') : this._t('betting.place_bet')}
                </button>
                ${team.betting ? `<div class="betting-info">${this._t('betting.win_lose_info')}</div>` : ''}
              </div>
            </div>
          ` : this.getRoundCounter() === 0 ? `
            <div class="no-song-message">${this._t('game.no_song_message')}</div>
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
    // Track recent team name changes to prevent UI from overriding them
    if (!this._recentTeamNameChanges) {
      this._recentTeamNameChanges = {};
    }
    this._recentTeamNameChanges[teamId] = { name: name.trim(), timestamp: Date.now() };
    
    // Debounce team name updates
    this.debouncedServiceCall(`teamName_${teamId}`, () => {
      if (this.hass && name.trim()) {
        this.hass.callService('soundbeats', 'update_team_name', {
          team_id: teamId,
          name: name.trim()
        });
      }
      this.clearValidationCache();
      
      // Only trigger UI refresh for splash screen, never for team management during editing
      // This prevents the focus loss issue when editing team names
      setTimeout(() => {
        if (this.shouldShowSplashScreen()) {
          this.updateSplashValidationState();
        }
        // Do NOT update team management section to prevent focus loss
        // The team management section will update naturally through other mechanisms
        // without disrupting the user's editing experience
      }, 10);
    }, 50); // Further reduced delay for more responsive text input
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

  updateTeamUserId(teamId, userId) {
    // Call service immediately without debouncing since team user ID selection is a discrete action
    if (this.hass) {
      this.hass.callService('soundbeats', 'update_team_user_id', {
        team_id: teamId,
        user_id: userId || null
      });
    }
    this.clearValidationCache();
    
    // Track recent user selections to prevent UI from overriding them
    if (!this._recentUserSelections) {
      this._recentUserSelections = {};
    }
    this._recentUserSelections[teamId] = { userId, timestamp: Date.now() };
    
    // Trigger UI refresh in both splash screen and team management after a brief delay
    setTimeout(() => {
      if (this.shouldShowSplashScreen()) {
        this.updateSplashValidationState();
        // Also update splash screen dropdowns to reflect database state
        this.updateSplashScreenDropdowns();
      }
      // Only update team management section for user ID changes (dropdown selections)
      // since these are discrete actions that don't interfere with text input focus
      const teamManagementContainer = this.shadowRoot?.querySelector('.team-management-container');
      if (teamManagementContainer && !this.isUserEditingTeamManagement()) {
        this.updateSplashTeamsSection('management');
      }
    }, 10); // Reduced delay since no debouncing
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
    // Toggle team betting state through Home Assistant service
    // This calls the backend to update the team.betting property
    // The UI will reflect the change when the state updates from HA
    if (this.hass) {
      this.hass.callService('soundbeats', 'update_team_betting', {
        team_id: teamId,
        betting: betting
      });
    }
    // Note: The betting-active CSS class and bonus info are controlled by
    // the team.betting property from the backend, ensuring UI reflects true state
  }

  renderBetResult(teamId, team) {
    const currentSong = this.getCurrentSong();
    if (!currentSong || !currentSong.year) {
      return '';
    }
    
    const songYear = parseInt(currentSong.year, 10);
    const teamGuess = team.year_guess;
    const wasBetting = team.last_round_betting;
    
    // Calculate year difference and points for all scenarios
    const yearDifference = Math.abs(songYear - teamGuess);
    let pointsEarned = 0;
    let explanation = '';
    
    if (wasBetting) {
      // Betting logic: 20 points if exact match, 0 points otherwise
      if (yearDifference === 0) {
        pointsEarned = 20;
        explanation = this._t('game.perfect_guess_with_bet');
      } else {
        pointsEarned = 0;
        explanation = this._ts('game.years_off_bet_failed', { difference: yearDifference, plural: yearDifference === 1 ? '' : 's' });
      }
    } else {
      // Normal scoring logic
      if (yearDifference === 0) {
        pointsEarned = 20;
        explanation = this._t('game.perfect_guess');
      } else if (yearDifference <= 2) {
        pointsEarned = 10;
        explanation = this._ts('game.within_years_correct', { difference: yearDifference, plural: yearDifference === 1 ? '' : 's' });
      } else if (yearDifference <= 5) {
        pointsEarned = 5;
        explanation = this._ts('game.within_years_correct_exact', { difference: yearDifference });
      } else {
        pointsEarned = 0;
        explanation = this._ts('game.more_than_five_years', { difference: yearDifference });
      }
    }
    
    if (wasBetting) {
      const wasCorrect = yearDifference === 0;
      return `
        <div class="bet-result ${wasCorrect ? 'bet-win' : 'bet-loss'}">
          <ha-icon icon="mdi:${wasCorrect ? 'trophy' : 'close-circle'}" class="result-icon"></ha-icon>
          <div class="result-text">
            <strong>${wasCorrect ? 'BET WON!' : 'BET LOST!'}</strong>
            <div class="result-details">
              Your guess: ${teamGuess} | Actual year: ${songYear}
              <br>${this._t('ui.points_earned')}: ${pointsEarned}. ${explanation}
            </div>
          </div>
        </div>
      `;
    } else {
      // Enhanced result display for non-betting scenarios
      const resultClass = pointsEarned > 0 ? 'result-info-positive' : 'result-info-neutral';
      return `
        <div class="result-info ${resultClass}">
          <div class="result-summary">
            <strong>${this._ts('game.your_guess_vs_actual', { guess: teamGuess, year: songYear })}</strong>
          </div>
          <div class="result-scoring">
            ${this._t('ui.points_earned')}: ${pointsEarned}. ${explanation}
          </div>
        </div>
      `;
    }
  }

  renderOtherTeamsOverview() {
    const teams = this.getTeams();
    const rankings = this.getTeamRankings(true); // Use global rankings for overview
    const isCountdownRunning = this.getCountdownCurrent() > 0;
    const currentRound = this.getRoundCounter();
    
    // Get all participating teams (global scoreboard), sorted by points descending
    const sortedTeams = Object.entries(teams)
      .filter(([teamId, team]) => team.participating) // Show all participating teams
      .map(([teamId, team]) => ({ teamId, ...team }))
      .sort((a, b) => b.points - a.points);
    
    if (sortedTeams.length === 0) {
      return `<div class="overview-empty">${this._t('game.no_participating_teams')}</div>`;
    }
    
    return sortedTeams.map((team, index) => {
      const rank = rankings[team.teamId] || (index + 1);
      const rankClass = currentRound === 0 || team.points === 0 ? 'rank-other' :
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
            <span class="overview-team-points">${team.points} ${this._t('defaults.points_suffix')}</span>
            <span class="overview-team-name">${team.name}</span>
          </div>
          <div class="overview-team-points-container">
            ${!isCountdownRunning && currentRound > 0 ? `
              <div class="overview-points-badge ${team.last_round_points > 0 ? 'points-earned' : 'no-points'}">
                ${team.last_round_points}${this._t('defaults.points_suffix')}
              </div>
            ` : ''}
          </div>
          <div class="overview-team-badges">
            ${isCountdownRunning && team.betting ? `
              <div class="overview-bet-badge">
                <span>BET</span>
              </div>
            ` : ''}
            ${!isCountdownRunning && currentRound > 0 ? `
              <div class="overview-year-badge ${team.last_round_points > 0 ? 'points-earned' : 'no-points'}">
                ${team.year_guess}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  formatPointsValue(value) {
    // If the value is a whole number (no meaningful decimal), show without decimal
    // Otherwise show with 1 decimal place
    if (value % 1 === 0) {
      return value.toString();
    } else {
      return value.toFixed(1);
    }
  }

  renderHighscores() {
    const highscoreEntity = this.hass?.states['sensor.soundbeats_highscore'];
    
    if (!highscoreEntity) {
      return `
        <div class="highscore-empty">${this._t('game.highscore_data_not_available')}</div>
        <div class="highscore-diagnostic">
          <div class="expandable-header" onclick="this.getRootNode().host.toggleHighscoreDiagnostic()">
            <span class="diagnostic-title">
              <ha-icon icon="mdi:bug" class="icon"></ha-icon>
              Diagnostic Information
            </span>
            <ha-icon icon="mdi:chevron-down" class="expander-icon ${this.highscoreDiagnosticExpanded ? 'expanded' : ''}"></ha-icon>
          </div>
          <div class="expandable-content ${this.highscoreDiagnosticExpanded ? 'expanded' : 'collapsed'}">
            ${this.renderHighscoreDiagnosticContent()}
          </div>
        </div>
      `;
    }
    
    // Get global average highscore (stored as average points per round)
    const globalAverageHighscore = parseFloat(highscoreEntity.state);
    
    // Calculate user's average score per round
    const currentRound = this.getRoundCounter();
    const userAverage = this.calculateUserAverageScore(currentRound);
    
    return `
      <div class="highscore-display">
        <div class="global-highscore">
          <div class="highscore-header">
            <ha-icon icon="mdi:crown" class="icon crown-icon"></ha-icon>
            <span class="highscore-label">${this._t('game.highscore_avg_round')}</span>
          </div>
          <div class="highscore-value">${this.formatPointsValue(globalAverageHighscore)} ${this._t('defaults.points_suffix')}</div>
        </div>
        ${currentRound > 1 && userAverage !== null ? `
          <div class="user-average">
            <div class="highscore-header">
              <ha-icon icon="mdi:account" class="icon"></ha-icon>
              <span class="highscore-label">${this._t('game.your_average')}</span>
            </div>
            <div class="highscore-value">${this.formatPointsValue(userAverage)} ${this._t('defaults.points_suffix')}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  calculateUserAverageScore(currentRound) {
    // Calculate the average score per round for teams belonging to the current user
    if (currentRound <= 1) {
      return null; // Don't show user average until after round 1
    }
    
    const teams = this.getTeams();
    const currentUserId = this.hass && this.hass.user ? this.hass.user.id : null;
    
    if (!currentUserId) {
      return null; // Can't determine user if no user ID available
    }
    
    // Find all teams that belong to the current user and are participating
    const userTeams = Object.entries(teams)
      .filter(([teamId, team]) => team.participating && team.user_id === currentUserId)
      .map(([teamId, team]) => team);
    
    if (userTeams.length === 0) {
      return null; // No user teams found
    }
    
    // Calculate total points across all user teams, then divide by rounds
    let totalPoints = 0;
    userTeams.forEach(team => {
      totalPoints += team.points || 0;
    });
    
    return totalPoints / currentRound;
  }

  renderHighscoreDiagnosticContent() {
    const highscoreEntity = this.hass?.states['sensor.soundbeats_highscore'];
    
    if (!this.hass) {
      return `
        <div class="diagnostic-item">
          <strong>${this._t('diagnostics.status')}</strong> ${this._t('diagnostics.ha_not_available')}
        </div>
      `;
    }
    
    if (!this.hass.states) {
      return `
        <div class="diagnostic-item">
          <strong>${this._t('diagnostics.status')}</strong> ${this._t('diagnostics.ha_states_not_available')}
        </div>
      `;
    }
    
    if (!highscoreEntity) {
      // Check if the entity exists at all in the states
      const allEntityIds = Object.keys(this.hass.states);
      const soundbeatsEntities = allEntityIds.filter(id => id.includes('soundbeats'));
      
      return `
        <div class="diagnostic-item">
          <strong>Entity Status:</strong> ${this._t('diagnostics.sensor_not_found')}
        </div>
        <div class="diagnostic-item">
          <strong>${this._t('diagnostics.available_entities')}</strong> 
          ${soundbeatsEntities.length > 0 ? 
            `<ul>${soundbeatsEntities.map(id => `<li>${id}</li>`).join('')}</ul>` : 
            this._t('defaults.none_found')
          }
        </div>
        <div class="diagnostic-item">
          <strong>${this._t('diagnostics.troubleshooting')}</strong>
          <ul>
            <li>${this._t('diagnostics.verify_integration')}</li>
            <li>${this._t('diagnostics.check_sensor')}</li>
            <li>${this._t('diagnostics.restart_ha')}</li>
          </ul>
        </div>
      `;
    }
    
    // This shouldn't normally execute since we only show diagnostic when entity is missing
    // But including it for completeness
    return `
      <div class="diagnostic-item">
        <strong>${this._t('diagnostics.entity_state')}</strong> ${highscoreEntity.state}
      </div>
      <div class="diagnostic-item">
        <strong>${this._t('diagnostics.entity_attributes')}</strong>
        <pre>${JSON.stringify(highscoreEntity.attributes, null, 2)}</pre>
      </div>
    `;
  }

  toggleHighscoreDiagnostic() {
    this.highscoreDiagnosticExpanded = !this.highscoreDiagnosticExpanded;
    this.updateHighscoreDiagnosticState();
  }

  updateHighscoreDiagnosticState() {
    if (!this.shadowRoot || !this.shadowRoot.querySelector) {
      return;
    }
    
    const diagnosticHeader = this.shadowRoot.querySelector('.highscore-diagnostic .expandable-header');
    if (diagnosticHeader) {
      const diagnosticIcon = diagnosticHeader.querySelector('.expander-icon');
      const diagnosticContent = diagnosticHeader.nextElementSibling;
      
      if (diagnosticIcon) {
        diagnosticIcon.className = `expander-icon ${this.highscoreDiagnosticExpanded ? 'expanded' : ''}`;
      }
      if (diagnosticContent) {
        diagnosticContent.className = `expandable-content ${this.highscoreDiagnosticExpanded ? 'expanded' : 'collapsed'}`;
      }
    }
  }

  startNewGame() {
    // Call service to reset game state (points, played songs, round counter)
    if (this.hass) {
      this.hass.callService('soundbeats', 'start_game', {});
    }
    
    // Clear cache to ensure fresh validation and re-render
    this.clearValidationCache();
    this.render();
  }

  nextSong() {
    // Check if audio player is selected first
    const selectedPlayer = this.getSelectedAudioPlayer();
    
    if (!selectedPlayer) {
      // Show alert banner if no audio player is selected
      this.showAlertBanner();
      return;
    }
    
    // Call service to skip to next song
    if (this.hass) {
      this.hass.callService('soundbeats', 'next_song', {});
    }
  }

  volumeUp() {
    // Check if audio player is selected first
    const selectedPlayer = this.getSelectedAudioPlayer();
    
    if (!selectedPlayer) {
      // Show alert banner if no audio player is selected
      this.showAlertBanner();
      return;
    }
    
    // Call Home Assistant service to increase volume by 10%
    if (this.hass) {
      this.hass.callService('media_player', 'volume_up', {
        entity_id: selectedPlayer
      });
    }
  }

  volumeDown() {
    // Check if audio player is selected first
    const selectedPlayer = this.getSelectedAudioPlayer();
    
    if (!selectedPlayer) {
      // Show alert banner if no audio player is selected
      this.showAlertBanner();
      return;
    }
    
    // Call Home Assistant service to decrease volume by 10%
    if (this.hass) {
      this.hass.callService('media_player', 'volume_down', {
        entity_id: selectedPlayer
      });
    }
  }

  togglePlayPause() {
    // Check if audio player is selected first
    const selectedPlayer = this.getSelectedAudioPlayer();
    
    if (!selectedPlayer) {
      // Show alert banner if no audio player is selected
      this.showAlertBanner();
      return;
    }
    
    // Call Home Assistant service to toggle play/pause
    if (this.hass) {
      this.hass.callService('media_player', 'media_play_pause', {
        entity_id: selectedPlayer
      });
    }
  }

  getMediaPlayerState() {
    // Get the current state of the selected media player
    const selectedPlayer = this.getSelectedAudioPlayer();
    
    if (!selectedPlayer || !this.hass || !this.hass.states) {
      return null;
    }
    
    const entity = this.hass.states[selectedPlayer];
    return entity ? entity.state : null;
  }

  showAlertBanner() {
    const alertBanner = this.shadowRoot.querySelector('#no-audio-player-alert');
    if (alertBanner) {
      alertBanner.classList.add('show');
    }
  }

  showAllSongsPlayedAlert() {
    const alertBanner = this.shadowRoot.querySelector('#all-songs-played-alert');
    if (alertBanner) {
      alertBanner.classList.add('show');
    }
  }

  hideAlertBanner(alertId) {
    // If no alertId provided, hide the no-audio-player-alert for backward compatibility
    const bannerId = alertId || 'no-audio-player-alert';
    const alertBanner = this.shadowRoot.querySelector(`#${bannerId}`);
    if (alertBanner) {
      alertBanner.classList.remove('show');
    }
  }

  showHighscoreBanner(message) {
    const highscoreBanner = this.shadowRoot.querySelector('#highscore-record-banner');
    const messageElement = this.shadowRoot.querySelector('#highscore-banner-message');
    if (highscoreBanner && messageElement) {
      messageElement.textContent = message;
      highscoreBanner.classList.add('show');
      
      // Auto-hide after 8 seconds
      setTimeout(() => {
        this.hideHighscoreBanner();
      }, 8000);
    }
  }

  hideHighscoreBanner() {
    const highscoreBanner = this.shadowRoot.querySelector('#highscore-record-banner');
    if (highscoreBanner) {
      highscoreBanner.classList.remove('show');
    }
  }

  checkForNewHighscoreRecords() {
    const highscoreEntity = this.hass?.states['sensor.soundbeats_highscore'];
    if (!highscoreEntity) {
      return;
    }
    
    const currentAbsolute = parseFloat(highscoreEntity.state) || 0;
    const currentAttributes = highscoreEntity.attributes || {};
    
    // Check for new average highscore
    if (this._lastAbsoluteHighscore !== null && currentAbsolute > this._lastAbsoluteHighscore && currentAbsolute > 0) {
      this.showHighscoreBanner(this._ts('highscore.new_average_message', { value: this.formatPointsValue(currentAbsolute) }));
    }
    
    // Check for new round highscores
    Object.entries(currentAttributes).forEach(([key, value]) => {
      if (key.startsWith('round_') && typeof value === 'number') {
        const lastValue = this._lastRoundHighscores[key];
        if (lastValue !== undefined && value > lastValue && value > 0) {
          const roundNumber = key.replace('round_', '');
          this.showHighscoreBanner(`New Round ${roundNumber} record: ${this.formatPointsValue(value)} points! 🎯`);
        }
      }
    });
    
    // Update tracking values
    this._lastAbsoluteHighscore = currentAbsolute;
    this._lastRoundHighscores = { ...currentAttributes };
  }

  initializeHighscoreTracking() {
    const highscoreEntity = this.hass?.states['sensor.soundbeats_highscore'];
    if (!highscoreEntity) {
      return;
    }
    
    // Initialize with current values to prevent false positives on first load
    this._lastAbsoluteHighscore = parseFloat(highscoreEntity.state) || 0;
    this._lastRoundHighscores = { ...highscoreEntity.attributes } || {};
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
        let song_name = this._t('defaults.unknown_title');
        let artist = this._t('defaults.unknown_artist');
        let entity_picture = '';
        
        if (currentSongEntity.state !== 'None') {
          const mediaPlayerEntityId = currentSongEntity.state;
          const mediaPlayerEntity = this.hass.states[mediaPlayerEntityId];
          
          if (mediaPlayerEntity && mediaPlayerEntity.attributes) {
            const attributes = mediaPlayerEntity.attributes;
            song_name = attributes.media_title || this._t('defaults.unknown_title');
            artist = attributes.media_artist || this._t('defaults.unknown_artist');
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
      song_name: this._t('defaults.unknown_title'),
      artist: this._t('defaults.unknown_artist'),
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
    // Use unified cache to avoid frequent entity iteration
    const cached = this._getCached('mediaPlayers');
    if (cached !== null) {
      return cached;
    }
    
    // Check if Home Assistant is available and has states
    if (!this.hass || !this.hass.states) {
      // Set loading state when hass is not ready
      this._isLoadingMediaPlayers = true;
      return [];
    }
    
    // Get all available media player entities from Home Assistant
    const mediaPlayers = [];
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
    
    // Clear loading state once we have processed the states
    this._isLoadingMediaPlayers = false;
    
    // Cache the result
    this._setCached('mediaPlayers', mediaPlayers);
    
    return mediaPlayers;
  }

  getHomeAssistantUsers() {
    // Get all Home Assistant users
    // This uses the Home Assistant websocket connection to fetch user data
    if (this.hass && this.hass.user) {
      return this.hass.callWS({
        type: 'config/auth/list'
      }).then(users => {
        return users.map(user => ({
          id: user.id,
          name: user.name || 'Unknown User',
          is_active: user.is_active !== false
        })).filter(user => user.is_active);  // Only return active users
      }).catch(error => {
        console.warn('Could not fetch Home Assistant users:', error);
        return [];
      });
    }
    return Promise.resolve([]);
  }

  updateCountdownTimerLength(timerLength) {
    // Debounce the service call to avoid rapid calls during slider movement
    this.debouncedServiceCall('timer', () => {
      if (this.hass) {
        this.hass.callService('soundbeats', 'update_countdown_timer_length', {
          timer_length: parseInt(timerLength)
        });
      }
      this.clearValidationCache();
      
      // Trigger UI refresh after a brief delay to allow the service call to complete
      setTimeout(() => {
        if (this.shouldShowSplashScreen()) {
          this.updateSplashValidationState();
        }
      }, 10);
    }, 100); // Reduced delay for more responsive slider
  }

  updateAudioPlayer(audioPlayer) {
    // Track this interaction to prevent updates from overriding user selection
    this._trackAudioPlayerInteraction('.splash-audio-select');
    this._trackAudioPlayerInteraction('.audio-player-select');
    
    // Debounce the service call
    this.debouncedServiceCall('audioPlayer', () => {
      if (this.hass) {
        this.hass.callService('soundbeats', 'update_audio_player', {
          audio_player: audioPlayer
        });
      }
      this.clearValidationCache();
      
      // Trigger UI refresh after a brief delay to allow the service call to complete
      setTimeout(() => {
        if (this.shouldShowSplashScreen()) {
          this.updateSplashValidationState();
        }
      }, 10);
    }, 100); // Reduced delay for more responsive dropdown
  }

  getSelectedTeamCount() {
    // Get selected team count from the game status entity
    if (this.hass && this.hass.states) {
      const entity = this.hass.states['sensor.soundbeats_game_status'];
      if (entity && entity.attributes && entity.attributes.team_count !== undefined) {
        return parseInt(entity.attributes.team_count);
      }
    }
    return null; // Return null when no team count is explicitly set
  }

  updateTeamCount(teamCount) {
    // Debounce the service call
    this.debouncedServiceCall('teamCount', () => {
      if (this.hass) {
        this.hass.callService('soundbeats', 'update_team_count', {
          team_count: parseInt(teamCount)
        });
      }
      this.clearValidationCache();
      
      // Update both splash screen and team management to show correct number of team inputs
      setTimeout(() => {
        if (this.shouldShowSplashScreen()) {
          this.updateSplashTeamsSection('splash');
          this.updateSplashValidationState();
        }
        // Only update team management section if user is not currently editing
        // to prevent disrupting focus during text input
        const teamManagementContainer = this.shadowRoot?.querySelector('.team-management-container');
        if (teamManagementContainer && !this.isUserEditingTeamManagement()) {
          this.updateSplashTeamsSection('management');
        }
      }, 25);
    }, 100); // Reduced delay for more responsive dropdown
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

  toggleHighscore() {
    this.highscoreExpanded = !this.highscoreExpanded;
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
    
    // Update the Highscore section
    const highscoreHeader = this.shadowRoot.querySelector('.highscore-section .expandable-header');
    if (highscoreHeader) {
      const highscoreIcon = highscoreHeader.querySelector('.expander-icon');
      const highscoreContent = highscoreHeader.nextElementSibling;
      
      if (highscoreIcon) {
        highscoreIcon.className = `expander-icon ${this.highscoreExpanded ? 'expanded' : ''}`;
      }
      if (highscoreContent) {
        highscoreContent.className = `expandable-content ${this.highscoreExpanded ? 'expanded' : 'collapsed'}`;
      }
    }
    
    // Update the Highscore Diagnostic section
    this.updateHighscoreDiagnosticState();
  }

  updateDisplayValues() {
    // Update only display elements, not input fields to preserve user editing state
    
    // Update countdown display
    this.updateCountdownDisplay();
    
    // Update song display
    this.updateSongDisplay();
    
    // Update team display values (but not input fields)
    this.updateTeamDisplayValues();
    
    // Update highscore display
    this.updateHighscoreDisplay();
    
    // Update team management dropdowns if users are loaded
    if (this.usersLoaded) {
      this.updateTeamManagementDropdowns();
    }
    
    // Update teams overview description and content
    this.updateTeamsOverviewDisplay();
    
    // Update timer display value only if slider is not being actively used
    this.updateTimerDisplayValue();
    
    // Update dropdown options without changing selected value if not focused
    this.updateAudioPlayerOptions();
    
    // Update splash screen dropdowns if splash screen is shown (throttled)
    if (this.shouldShowSplashScreen()) {
      // Throttle splash screen updates to avoid excessive calls
      if (!this._splashUpdateTimeout) {
        this._splashUpdateTimeout = setTimeout(() => {
          this.updateSplashScreenDropdowns();
          this._splashUpdateTimeout = null;
        }, 50);
      }
    }
    
    // Check if all songs have been played
    this.checkAllSongsPlayed();
  }

  checkAllSongsPlayed() {
    if (!this.hass || !this.hass.states) return;
    
    const playedSongsEntity = this.hass.states['sensor.soundbeats_played_songs'];
    const currentSongEntity = this.hass.states['sensor.soundbeats_current_song'];
    const gameStatusEntity = this.hass.states['sensor.soundbeats_game_status'];
    
    if (!playedSongsEntity || !currentSongEntity || !gameStatusEntity) return;
    
    // Only check during an active game
    if (gameStatusEntity.state !== 'playing') {
      // Hide the alert if game is not playing
      this.hideAlertBanner('all-songs-played-alert');
      return;
    }
    
    // Check if current song sensor has no song data (which indicates no more songs available)
    const currentSongAttributes = currentSongEntity.attributes || {};
    const hasSongData = currentSongAttributes.song_id !== undefined;
    
    // If we don't have song data and we're in a playing state, check if all songs were played
    if (!hasSongData) {
      const playedSongsAttributes = playedSongsEntity.attributes || {};
      const playedSongIds = playedSongsAttributes.played_song_ids || [];
      
      // Only show alert if songs have actually been played (not just at startup)
      if (playedSongIds.length > 0) {
        this.showAllSongsPlayedAlert();
      }
    } else {
      // Hide the alert if we have a current song
      this.hideAlertBanner('all-songs-played-alert');
    }
    // Check for new highscore records and show banner if needed
    this.checkForNewHighscoreRecords();
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
    const isUserEditing = this.isUserEditingTeamManagement();
    
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
      if (pointsDisplay) pointsDisplay.textContent = `${team.points} ${this._t('defaults.points_suffix')}`;
      
      // Update betting button state and display when team.betting changes
      const betButton = teamItem.querySelector('.bet-button');
      const bettingInfo = teamItem.querySelector('.betting-info');
      const bettingSection = teamItem.querySelector('.betting-section');
      
      if (betButton) {
        // Update button class based on betting state
        if (team.betting) {
          betButton.classList.add('betting-active');
          betButton.textContent = this._t('betting.betting_active');
          betButton.setAttribute('aria-label', this._ts('betting.cancel_bet_for_aria', { team: team.name }));
        } else {
          betButton.classList.remove('betting-active');
          betButton.textContent = this._t('betting.place_bet');
          betButton.setAttribute('aria-label', this._ts('betting.place_bet_for_aria', { team: team.name }));
        }
        
        // Update onclick handler to reflect current state
        betButton.setAttribute('onclick', `this.getRootNode().host.toggleTeamBetting('${teamId}', ${!team.betting})`);
      }
      
      // Update betting info display based on betting state
      if (bettingSection) {
        const existingBettingInfo = bettingSection.querySelector('.betting-info');
        if (team.betting) {
          // Add betting info if it doesn't exist
          if (!existingBettingInfo) {
            const bettingInfoElement = document.createElement('div');
            bettingInfoElement.className = 'betting-info';
            bettingInfoElement.textContent = this._t('betting.win_lose_info');
            bettingSection.appendChild(bettingInfoElement);
          }
        } else {
          // Remove betting info if it exists
          if (existingBettingInfo) {
            existingBettingInfo.remove();
          }
        }
      }
      
      // Update input values in team management section only if they're not focused (being edited)
      if (teamManagementContainer) {
        const managementItem = teamManagementContainer.querySelector(`[data-team="${teamId}"]`);
        if (managementItem) {
          const nameInput = managementItem.querySelector('input[type="text"]');
          const participatingInput = managementItem.querySelector('input[type="checkbox"]');
          
          if (nameInput && document.activeElement !== nameInput) {
            // Check if there's a recent team name change to avoid overriding user input
            const recentChange = this._recentTeamNameChanges && this._recentTeamNameChanges[teamId];
            const isRecentChange = recentChange && (Date.now() - recentChange.timestamp < 3000); // 3 second window for consistency
            
            if (!isRecentChange) {
              nameInput.value = team.name;
            }
          }
          if (participatingInput && document.activeElement !== participatingInput) {
            participatingInput.checked = team.participating;
          }
        }
      }
    });
  }

  updateHighscoreDisplay() {
    // Update highscore display values without full re-render
    const highscoreSection = this.shadowRoot.querySelector('.highscore-section');
    if (!highscoreSection) return;

    const highscoreEntity = this.hass?.states['sensor.soundbeats_highscore'];
    if (!highscoreEntity) {
      // If highscore entity is not available, replace with empty message
      highscoreSection.innerHTML = `
        <div class="expandable-header" onclick="this.getRootNode().host.toggleHighscore()">
          <h3>
            <ha-icon icon="mdi:trophy" class="icon"></ha-icon>
            ${this._ts('ui.highscores_after_round', { round: this.getRoundCounter() })}
          </h3>
          <ha-icon icon="mdi:chevron-down" class="expander-icon ${this.highscoreExpanded ? 'expanded' : ''}"></ha-icon>
        </div>
        <div class="expandable-content ${this.highscoreExpanded ? 'expanded' : 'collapsed'}">
          <div class="highscore-empty">${this._t('game.highscore_data_not_available')}</div>
        </div>
      `;
      return;
    }

    // Get current values
    const globalAverageHighscore = parseFloat(highscoreEntity.state);
    const currentRound = this.getRoundCounter();
    const userAverage = this.calculateUserAverageScore(currentRound);

    // Update the highscore content
    highscoreSection.innerHTML = `
      <div class="expandable-header" onclick="this.getRootNode().host.toggleHighscore()">
        <h3>
          <ha-icon icon="mdi:trophy" class="icon"></ha-icon>
          ${this._ts('ui.highscores_after_round', { round: currentRound })}
        </h3>
        <ha-icon icon="mdi:chevron-down" class="expander-icon ${this.highscoreExpanded ? 'expanded' : ''}"></ha-icon>
      </div>
      <div class="expandable-content ${this.highscoreExpanded ? 'expanded' : 'collapsed'}">
        <div class="highscore-display">
          <div class="global-highscore">
            <div class="highscore-header">
              <ha-icon icon="mdi:crown" class="icon crown-icon"></ha-icon>
              <span class="highscore-label">${this._t('game.highscore_avg_round')}</span>
            </div>
            <div class="highscore-value">${this.formatPointsValue(globalAverageHighscore)} ${this._t('defaults.points_suffix')}</div>
          </div>
          ${currentRound > 1 && userAverage !== null ? `
            <div class="user-average">
              <div class="highscore-header">
                <ha-icon icon="mdi:account" class="icon"></ha-icon>
                <span class="highscore-label">${this._t('game.your_average')}</span>
              </div>
              <div class="highscore-value">${this.formatPointsValue(userAverage)} ${this._t('defaults.points_suffix')}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  updateTeamsOverviewDisplay() {
    // Update the overview content - always visible
    const teamsOverviewSection = this.shadowRoot.querySelector('.teams-overview-section');
    const teamsOverviewContainer = this.shadowRoot.querySelector('.teams-overview-container');
    
    // Always show the teams overview section
    if (teamsOverviewSection) {
      teamsOverviewSection.style.display = 'block';
    }
    
    // Always update teams overview content
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
    if (!select || document.activeElement === select || this._hasRecentAudioPlayerInteraction('.audio-player-select')) return;
    
    const currentSelection = this.getSelectedAudioPlayer();
    const mediaPlayers = this.getMediaPlayers();
    
    // Clear and rebuild options
    select.innerHTML = `<option value="">${this._t('ui.select_audio_player')}</option>`;
    mediaPlayers.forEach(player => {
      const option = document.createElement('option');
      option.value = player.entity_id;
      option.textContent = `${player.name} - ${player.entity_id}`;
      option.selected = currentSelection === player.entity_id;
      select.appendChild(option);
    });
  }

  renderTeamsContent(context = 'splash') {
    // Unified method to render team assignment content for both splash screen and team management
    const teams = this.getTeams();
    const users = this.homeAssistantUsers || [];
    const isLoadingUsers = this._isLoadingUsers || (!this.usersLoaded && users.length === 0);
    
    const itemClass = context === 'splash' ? 'splash-team-item' : 'team-management-item';
    const labelClass = context === 'splash' ? 'team-label' : 'team-management-label';
    const inputClass = context === 'splash' ? 'splash-team-input' : 'team-input';
    const selectClass = context === 'splash' ? 'splash-team-select' : 'team-user-select';
    
    return Object.entries(teams).map(([teamId, team]) => {
      if (context === 'splash') {
        return `
          <div class="${itemClass}">
            <label class="${labelClass}">${this._ts('settings.team_label', { number: teamId.split('_')[1] })}</label>
            <input type="text" class="${inputClass}" placeholder="${this._t('settings.team_name_placeholder')}" 
                   value="${team.name}" 
                   oninput="this.getRootNode().host.updateTeamName('${teamId}', this.value)">
            <select class="${selectClass}" 
                    onchange="this.getRootNode().host.updateTeamUserId('${teamId}', this.value)"
                    ${isLoadingUsers ? 'disabled' : ''}>
              <option value="">${isLoadingUsers ? this._t('ui.loading_users') : this._t('ui.select_user')}</option>
              ${users.filter(user => !user.name.startsWith('Home Assistant')).map(user => 
                `<option value="${user.id}" ${team.user_id === user.id ? 'selected' : ''}>
                  ${user.name}
                </option>`
              ).join('')}
            </select>
          </div>
        `;
      } else {
        return `
          <div class="${itemClass}" data-team="${teamId}">
            <div class="team-management-info">
              <span class="${labelClass}">${teamId === 'team_1' ? 
                this._ts('settings.team_label', { number: teamId.split('_')[1] }) : 
                this._ts('settings.team_label', { number: teamId.split('_')[1] })}</span>
              ${teamId === 'team_1' ? `<br><span class="${labelClass} admin-suffix">${this._t('settings.team_admin_suffix')}</span>` : ''}
            </div>
            <div class="team-management-controls">
              <input type="text" class="${inputClass}" placeholder="${this._t('settings.team_name_placeholder')}" value="${team.name}" 
                     oninput="this.getRootNode().host.updateTeamName('${teamId}', this.value)">
              <select 
                class="${selectClass}" 
                onchange="this.getRootNode().host.updateTeamUserId('${teamId}', this.value)"
                title="${this._t('ui.assign_user_tooltip')}"
                ${isLoadingUsers ? 'disabled' : ''}
              >
                <option value="">${isLoadingUsers ? this._t('ui.loading_users') : this._t('ui.select_user')}</option>
                ${users.filter(user => !user.name.startsWith('Home Assistant')).map(user => 
                  `<option value="${user.id}" ${team.user_id === user.id ? 'selected' : ''}>
                    ${user.name}
                  </option>`
                ).join('')}
              </select>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  updateSplashTeamsSection(context = 'splash') {
    // Update the teams section in either splash screen or team management without full re-render
    const containerSelector = context === 'splash' ? '.splash-teams-container' : '.team-management-container';
    const teamsContainer = this.shadowRoot.querySelector(containerSelector);
    if (!teamsContainer) return;
    
    // Check if user is currently editing team management - prevent updates if so
    if (context === 'management' && this.isUserEditingTeamManagement()) {
      return;
    }
    
    // Check if there are recent team name changes - prevent full HTML regeneration if so
    const hasRecentTeamNameChanges = this._recentTeamNameChanges && 
      Object.values(this._recentTeamNameChanges).some(change => 
        Date.now() - change.timestamp < 3000 // 3 second window to ensure safe protection
      );
    
    if (hasRecentTeamNameChanges) {
      return; // Don't regenerate HTML while user has pending team name changes
    }

    const teamCount = this.getSelectedTeamCount();
    const hasValidTeamCount = teamCount && teamCount >= 1 && teamCount <= 5;
    
    if (context === 'splash') {
      // Always show teams section in splash
      const teamsSection = teamsContainer.closest('.splash-input-section');
      if (teamsSection) {
        teamsSection.style.display = 'block';
      }
    }
    
    if (hasValidTeamCount) {
      // Update description for splash screen context
      if (context === 'splash') {
        const teamsSection = teamsContainer.closest('.splash-input-section');
        const description = teamsSection.querySelector('.input-description');
        if (description) {
          description.textContent = this._ts('settings.team_assignment_description', { count: teamCount, plural: teamCount > 1 ? 's' : '' });
        }
      } else {
        // Update description for team management context
        const descriptionElement = this.shadowRoot.querySelector('.team-management-description');
        if (descriptionElement) {
          descriptionElement.textContent = this._ts('settings.team_assignment_description', { count: teamCount, plural: teamCount > 1 ? 's' : '' });
        }
      }
      
      // Generate teams HTML using unified logic
      teamsContainer.innerHTML = this.renderTeamsContent(context);
    } else {
      // Show prompt message when no valid team count is selected
      if (context === 'splash') {
        const teamsSection = teamsContainer.closest('.splash-input-section');
        const description = teamsSection.querySelector('.input-description');
        if (description) {
          description.textContent = this._t('settings.select_teams_first');
        }
        
        teamsContainer.innerHTML = `
          <div class="splash-teams-prompt">
            <ha-icon icon="mdi:arrow-up" class="prompt-icon"></ha-icon>
            <span>${this._t('settings.choose_teams_first')}</span>
          </div>
        `;
      } else {
        const descriptionElement = this.shadowRoot.querySelector('.team-management-description');
        if (descriptionElement) {
          descriptionElement.textContent = this._t('settings.select_teams_for_assignments_full');
        }
        
        teamsContainer.innerHTML = `
          <div class="team-management-prompt">
            <ha-icon icon="mdi:arrow-up" class="prompt-icon"></ha-icon>
            <span>${this._t('settings.select_teams_for_assignments')}</span>
          </div>
        `;
      }
    }
  }

  updateSplashScreenDropdowns() {
    // Debounce splash screen dropdown updates to prevent excessive rebuilding
    this.debouncedServiceCall('splashDropdownUpdate', () => {
      this._updateSplashScreenDropdownsInternal();
    }, 50); // Short delay to batch multiple rapid updates
  }
  
  _updateSplashScreenDropdownsInternal() {
    // Update splash screen dropdown options without full re-render
    // Only update if user is not actively focused on the dropdowns
    
    // Update audio player dropdown
    const audioSelect = this.shadowRoot.querySelector('.splash-audio-select');
    if (audioSelect && document.activeElement !== audioSelect && !audioSelect.disabled && !this._hasRecentAudioPlayerInteraction('.splash-audio-select')) {
      const currentSelection = this.getSelectedAudioPlayer();
      const mediaPlayers = this.getMediaPlayers();
      const isActuallyLoading = this._isLoadingMediaPlayers;
      const hasNoPlayers = mediaPlayers.length === 0 && !isActuallyLoading;
      
      // Only update if the options have actually changed or loading state has changed
      const currentOptions = Array.from(audioSelect.options).map(opt => opt.value).join(',');
      const newOptions = ['', ...mediaPlayers.map(p => p.entity_id)].join(',');
      const currentFirstOptionText = audioSelect.options[0] ? audioSelect.options[0].textContent : '';
      const newFirstOptionText = isActuallyLoading ? this._t('ui.loading_audio_players') : hasNoPlayers ? this._t('ui.no_audio_players') : this._t('ui.select_audio_player');
      
      if (currentOptions !== newOptions || currentFirstOptionText !== newFirstOptionText) {
        // Preserve current user selection if it exists
        const currentUserSelection = audioSelect.value;
        
        audioSelect.innerHTML = `<option value="">${newFirstOptionText}</option>`;
        mediaPlayers.forEach(player => {
          const option = document.createElement('option');
          option.value = player.entity_id;
          option.textContent = `${player.name} - ${player.entity_id}`;
          option.selected = currentSelection === player.entity_id;
          audioSelect.appendChild(option);
        });
        
        // If user had a selection that's still valid, preserve it
        if (currentUserSelection && mediaPlayers.some(p => p.entity_id === currentUserSelection)) {
          audioSelect.value = currentUserSelection;
        }
      }
    }

    // Update team dropdowns if they exist
    const teamSelects = this.shadowRoot.querySelectorAll('.splash-team-select');
    const users = this.homeAssistantUsers || [];
    const teams = this.getTeams();
    
    teamSelects.forEach(select => {
      if (document.activeElement !== select && !select.disabled) {
        // Extract team ID from the onchange attribute to get the correct database value
        const onchangeAttr = select.getAttribute('onchange');
        const teamIdMatch = onchangeAttr && onchangeAttr.match(/'([^']+)'/);
        const teamId = teamIdMatch ? teamIdMatch[1] : null;
        const databaseValue = teamId && teams[teamId] ? teams[teamId].user_id : null;
        
        // Only update if users have changed
        const currentOptions = Array.from(select.options).map(opt => opt.value).join(',');
        const newOptions = ['', ...users.filter(user => !user.name.startsWith('Home Assistant')).map(u => u.id)].join(',');
        
        if (currentOptions !== newOptions) {
          select.innerHTML = `<option value="">${this._t('ui.select_user')}</option>`;
          users.filter(user => !user.name.startsWith('Home Assistant')).forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            option.selected = databaseValue === user.id;
            select.appendChild(option);
          });
        } else {
          // Even if options haven't changed, update selection to match database
          // But respect recent user selections to avoid overriding their choice
          const recentSelection = this._recentUserSelections && this._recentUserSelections[teamId];
          const isRecentSelection = recentSelection && (Date.now() - recentSelection.timestamp < 2000); // 2 second window
          
          if (!isRecentSelection) {
            Array.from(select.options).forEach(option => {
              option.selected = option.value === databaseValue;
            });
          }
        }
      }
    });
  }

  isUserEditingTeamManagement() {
    // Consolidated method to check if user is currently editing team management elements
    const teamManagementContainer = this.shadowRoot?.querySelector('.team-management-container');
    if (!teamManagementContainer) return false;
    
    // Check if any input field in team management is currently focused
    const activeElement = document.activeElement;
    if (!activeElement || !teamManagementContainer.contains(activeElement)) {
      return false;
    }
    
    // Check for specific input types that indicate user interaction
    return (
      activeElement.type === 'text' || 
      activeElement.type === 'checkbox' || 
      activeElement.tagName.toLowerCase() === 'select'
    );
  }

  updateTeamManagementDropdowns() {
    // Update only the dropdown options in team management without full re-render
    const teamManagementContainer = this.shadowRoot?.querySelector('.team-management-container');
    if (!teamManagementContainer || this.isUserEditingTeamManagement()) {
      return; // Don't update if user is editing
    }
    
    const users = this.homeAssistantUsers || [];
    const isLoadingUsers = this._isLoadingUsers || (!this.usersLoaded && users.length === 0);
    const teams = this.getTeams();
    
    // Update each team's dropdown options
    Object.entries(teams).forEach(([teamId, team]) => {
      const managementItem = teamManagementContainer.querySelector(`[data-team="${teamId}"]`);
      if (managementItem) {
        const select = managementItem.querySelector('.team-user-select');
        if (select && document.activeElement !== select) {
          const currentValue = select.value;
          
          // Update options
          select.innerHTML = `
            <option value="">${isLoadingUsers ? this._t('ui.loading_users') : this._t('ui.select_user')}</option>
            ${users.filter(user => !user.name.startsWith('Home Assistant')).map(user => 
              `<option value="${user.id}" ${team.user_id === user.id ? 'selected' : ''}>
                ${user.name}
              </option>`
            ).join('')}
          `;
          
          // Restore the selected value if it still exists
          if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
            select.value = currentValue;
          }
        }
      }
    });
  }

  recreateTeamsSection() {
    // Only recreate if teams structure has changed significantly
    const teamsContainer = this.shadowRoot.querySelector('.teams-container');
    const teamManagementContainer = this.shadowRoot.querySelector('.team-management-container');
    
    // Block recreation if user is actively editing any input field
    if (this.isUserEditingTeamManagement()) {
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
          else if (focusedElement.tagName.toLowerCase() === 'select') focusedType = 'select';
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
        // Use unified team rendering logic, but only if user is not currently editing
        // to prevent focus loss during text input
        if (!this.isUserEditingTeamManagement()) {
          this.updateSplashTeamsSection('management');
        }
      }
      
      // Restore focus if possible
      if (focusedTeam && focusedType) {
        const targetContainer = isManagementSection ? teamManagementContainer : teamsContainer;
        if (targetContainer) {
          const newTeamItem = targetContainer.querySelector(`[data-team="${focusedTeam}"]`);
          if (newTeamItem) {
            const selector = focusedType === 'select' ? 'select' : `input[type="${focusedType}"]`;
            const newFocusElement = newTeamItem.querySelector(selector);
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
    // Invalidate caches when hass changes
    const prevHass = this._hass;
    this._hass = hass;
    
    // Invalidate media players cache if states changed
    if (prevHass && hass && prevHass.states !== hass.states) {
      this._clearCache(); // Clear all caches when hass changes
    }
    
    // Load integration version when hass becomes available for the first time
    if (hass && !this._versionLoaded) {
      this._loadIntegrationVersion();
      this._versionLoaded = true;
    }
    
    // Load users when hass becomes available for the first time
    if (hass && !this.usersLoaded) {
      this.loadHomeAssistantUsers().then(() => {
        // Only re-render team management if user is not currently editing it
        const teamManagementContainer = this.shadowRoot?.querySelector('.team-management-container');
        if (teamManagementContainer && !this.isUserEditingTeamManagement()) {
          // Use unified team rendering logic
          this.updateSplashTeamsSection('management');
        }
        
        // Re-render splash screen if it's currently shown to populate dropdowns
        if (this.shouldShowSplashScreen()) {
          this.render();
        }
      });
    } else if (hass && this.usersLoaded && this.shouldShowSplashScreen()) {
      // Update splash screen dropdowns without full re-render to prevent refresh issues
      this.updateSplashScreenDropdowns();
    }
    
    // Initialize highscore tracking on first load
    if (!this._highscoreTrackingInitialized) {
      this.initializeHighscoreTracking();
      this._highscoreTrackingInitialized = true;
    }
    
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

  showQrModal() {
    const modal = this.shadowRoot.querySelector('#qr-modal');
    const qrImage = this.shadowRoot.querySelector('#qr-code-image');
    const urlDisplay = this.shadowRoot.querySelector('#qr-url-display');
    
    if (modal && qrImage && urlDisplay) {
      // Use the specified Home Assistant URL
      const baseUrl = 'http://homeassistant.local:8123/';
      
      // Generate QR code using qr-server.com API
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(baseUrl)}`;
      
      // Set the QR code image and URL display
      qrImage.src = qrCodeUrl;
      urlDisplay.textContent = baseUrl;
      
      // Show the modal
      modal.classList.add('show');
      
      // Add event listener to close modal when clicking outside
      modal.addEventListener('click', this.handleQrModalOutsideClick.bind(this));
    }
  }

  hideQrModal() {
    const modal = this.shadowRoot.querySelector('#qr-modal');
    if (modal) {
      modal.classList.remove('show');
      
      // Remove event listener
      modal.removeEventListener('click', this.handleQrModalOutsideClick.bind(this));
    }
  }

  handleQrModalOutsideClick(event) {
    // Close modal if clicking on the backdrop (not the content)
    if (event.target.classList.contains('qr-modal')) {
      this.hideQrModal();
    }
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
  '%c  SOUNDBEATS-CARD  \n%c  Version loaded from Home Assistant   ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);