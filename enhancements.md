# Soundbeats Enhancement Roadmap

This document outlines six small-sized enhancements to improve the Soundbeats Home Assistant integration: three UI improvements and three functionality improvements. Each enhancement includes detailed implementation instructions for immediate development.

## UI Enhancements

### 1. Team Color Coding and Visual Themes

**Description:** Add distinctive color themes for each team to improve visual identification and make the interface more engaging during gameplay.

**Implementation Details:**

**Files to Modify:**
- `custom_components/soundbeats/www/soundbeats-card.js`

**Changes Required:**

1. **Add team color definitions** in the CSS section of `render()` method:
   ```javascript
   // Add after existing CSS rules (around line 200-300)
   .team-card.team-1 { border-left: 4px solid #FF6B6B; background: linear-gradient(135deg, rgba(255,107,107,0.1), rgba(255,107,107,0.05)); }
   .team-card.team-2 { border-left: 4px solid #4ECDC4; background: linear-gradient(135deg, rgba(78,205,196,0.1), rgba(78,205,196,0.05)); }
   .team-card.team-3 { border-left: 4px solid #45B7D1; background: linear-gradient(135deg, rgba(69,183,209,0.1), rgba(69,183,209,0.05)); }
   .team-card.team-4 { border-left: 4px solid #96CEB4; background: linear-gradient(135deg, rgba(150,206,180,0.1), rgba(150,206,180,0.05)); }
   .team-card.team-5 { border-left: 4px solid #FECA57; background: linear-gradient(135deg, rgba(254,202,87,0.1), rgba(254,202,87,0.05)); }
   
   .team-name.team-1 { color: #FF6B6B; font-weight: bold; }
   .team-name.team-2 { color: #4ECDC4; font-weight: bold; }
   .team-name.team-3 { color: #45B7D1; font-weight: bold; }
   .team-name.team-4 { color: #96CEB4; font-weight: bold; }
   .team-name.team-5 { color: #FECA57; font-weight: bold; }
   ```

2. **Update `renderTeams()` method** (around line 800-900) to include team-specific classes:
   ```javascript
   // In the team card HTML generation, change:
   <div class="team-card" data-team="${teamId}">
   // To:
   <div class="team-card team-${teamId.split('_')[1]}" data-team="${teamId}">
   
   // And change:
   <span class="team-name">${team.name}</span>
   // To:
   <span class="team-name team-${teamId.split('_')[1]}">${team.name}</span>
   ```

3. **Add team icons** to make teams more distinctive:
   ```javascript
   // Add team icon mapping at the beginning of the class (around line 15-20)
   getTeamIcon(teamNumber) {
     const icons = {
       1: 'mdi:star',
       2: 'mdi:heart',
       3: 'mdi:diamond',
       4: 'mdi:clover',
       5: 'mdi:flash'
     };
     return icons[teamNumber] || 'mdi:account-group';
   }
   
   // Update team card HTML to include icon before team name
   <ha-icon icon="${this.getTeamIcon(teamId.split('_')[1])}" class="team-icon"></ha-icon>
   <span class="team-name team-${teamId.split('_')[1]}">${team.name}</span>
   ```

**Expected Result:** Teams will have distinct visual identities with colors, gradients, and icons, making it easier for players to identify their team during fast-paced gameplay.

---

### 2. Real-time Progress Indicators and Animations

**Description:** Add visual feedback for countdown timer, point changes, and game state transitions to make the interface more dynamic and engaging.

**Implementation Details:**

**Files to Modify:**
- `custom_components/soundbeats/www/soundbeats-card.js`

**Changes Required:**

1. **Add animated countdown timer** in the CSS section:
   ```javascript
   // Add to CSS rules
   .countdown-circle {
     width: 80px;
     height: 80px;
     border-radius: 50%;
     border: 4px solid #e0e0e0;
     border-top: 4px solid var(--primary-color);
     position: relative;
     margin: 0 auto 16px;
     animation: countdown-pulse 1s infinite;
   }
   
   .countdown-number {
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
     font-size: 24px;
     font-weight: bold;
     color: var(--primary-text-color);
   }
   
   @keyframes countdown-pulse {
     0% { transform: scale(1); }
     50% { transform: scale(1.05); }
     100% { transform: scale(1); }
   }
   
   .points-change {
     position: relative;
     display: inline-block;
   }
   
   .points-animation {
     position: absolute;
     top: -20px;
     right: 0;
     color: #4CAF50;
     font-weight: bold;
     animation: pointsFloat 2s ease-out forwards;
     pointer-events: none;
   }
   
   @keyframes pointsFloat {
     0% { opacity: 1; transform: translateY(0); }
     100% { opacity: 0; transform: translateY(-30px); }
   }
   ```

2. **Update countdown display** in the song section:
   ```javascript
   // In render() method, replace the countdown display (around line 400-500) with:
   <div class="countdown-display">
     <div class="countdown-circle">
       <div class="countdown-number">${currentCountdown}</div>
     </div>
     <p>Time to guess the year!</p>
   </div>
   ```

3. **Add point change animations** in `updateTeamDisplayValues()` method:
   ```javascript
   // After updating points display (around line 1000-1100), add:
   const currentPoints = team.points;
   const displayedPoints = parseInt(pointsDisplay.textContent) || 0;
   
   if (currentPoints > displayedPoints) {
     const difference = currentPoints - displayedPoints;
     const animationSpan = document.createElement('span');
     animationSpan.className = 'points-animation';
     animationSpan.textContent = `+${difference}`;
     pointsDisplay.parentElement.style.position = 'relative';
     pointsDisplay.parentElement.appendChild(animationSpan);
     
     setTimeout(() => animationSpan.remove(), 2000);
   }
   ```

4. **Add game state transition effects**:
   ```javascript
   // Add to CSS
   .section.fade-in {
     animation: fadeIn 0.5s ease-in;
   }
   
   @keyframes fadeIn {
     from { opacity: 0; transform: translateY(10px); }
     to { opacity: 1; transform: translateY(0); }
   }
   
   // In updateDisplayValues(), add fade-in class to new sections
   songSection.classList.add('fade-in');
   ```

**Expected Result:** The interface will feel more alive with animated countdown timers, floating point notifications, and smooth transitions between game states.

---

### 3. Enhanced Song Information Display with Album Art

**Description:** Improve the current song display with larger album artwork, additional metadata, and a more polished layout that makes the song the focal point during gameplay.

**Implementation Details:**

**Files to Modify:**
- `custom_components/soundbeats/www/soundbeats-card.js`
- `custom_components/soundbeats/sensor.py`

**Changes Required:**

1. **Enhance song data structure** in `sensor.py` (SoundbeatsCurrentSongSensor class, around line 480-500):
   ```python
   @property
   def extra_state_attributes(self) -> dict[str, Any]:
       """Return the state attributes."""
       if self._current_song_data is None:
           return {}
       
       return {
           "media_player": self._current_song_data.get("media_player"),
           "song_id": self._current_song_data.get("song_id"),
           "song_name": self._current_song_data.get("song_name", "Unknown Song"),
           "artist": self._current_song_data.get("artist", "Unknown Artist"),
           "album": self._current_song_data.get("album", "Unknown Album"),
           "year": self._current_song_data.get("year"),
           "url": self._current_song_data.get("url"),
           "media_content_type": self._current_song_data.get("media_content_type"),
           "entity_picture": self._current_song_data.get("entity_picture", "/local/soundbeats/default-album.png"),
           "duration": self._current_song_data.get("duration", "Unknown"),
           "genre": self._current_song_data.get("genre", "Various"),
       }
   ```

2. **Update song display CSS** in soundbeats-card.js:
   ```javascript
   // Add to CSS section
   .song-display {
     background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6));
     border-radius: 12px;
     padding: 24px;
     text-align: center;
     color: white;
     margin: 16px 0;
     backdrop-filter: blur(10px);
   }
   
   .song-artwork {
     width: 200px;
     height: 200px;
     border-radius: 12px;
     margin: 0 auto 20px;
     box-shadow: 0 8px 32px rgba(0,0,0,0.3);
     object-fit: cover;
     border: 3px solid rgba(255,255,255,0.2);
   }
   
   .song-info {
     display: flex;
     flex-direction: column;
     gap: 8px;
   }
   
   .song-title {
     font-size: 24px;
     font-weight: bold;
     text-shadow: 0 2px 4px rgba(0,0,0,0.5);
   }
   
   .song-artist {
     font-size: 18px;
     opacity: 0.9;
     font-style: italic;
   }
   
   .song-metadata {
     display: flex;
     justify-content: space-around;
     margin-top: 16px;
     padding-top: 16px;
     border-top: 1px solid rgba(255,255,255,0.2);
   }
   
   .metadata-item {
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: 4px;
   }
   
   .metadata-label {
     font-size: 12px;
     opacity: 0.7;
     text-transform: uppercase;
   }
   
   .metadata-value {
     font-size: 14px;
     font-weight: bold;
   }
   ```

3. **Update song section HTML** in render() method (around line 350-400):
   ```javascript
   <!-- Current Song Section - Only visible when countdown is 0 and song is available -->
   <div class="section song-section ${currentCountdown === 0 && currentSong ? '' : 'hidden'}">
     <h3>
       <ha-icon icon="mdi:music-circle" class="icon"></ha-icon>
       Now Playing
     </h3>
     <div class="song-display">
       <img src="${currentSong?.entity_picture || '/local/soundbeats/default-album.png'}" 
            alt="Album artwork" class="song-artwork" 
            onerror="this.src='/local/soundbeats/default-album.png'">
       <div class="song-info">
         <div class="song-title">${currentSong?.song_name || 'Unknown Song'}</div>
         <div class="song-artist">${currentSong?.artist || 'Unknown Artist'}</div>
         <div class="song-metadata">
           <div class="metadata-item">
             <div class="metadata-label">Album</div>
             <div class="metadata-value">${currentSong?.album || 'Unknown'}</div>
           </div>
           <div class="metadata-item">
             <div class="metadata-label">Duration</div>
             <div class="metadata-value">${currentSong?.duration || 'Unknown'}</div>
           </div>
           <div class="metadata-item">
             <div class="metadata-label">Genre</div>
             <div class="metadata-value">${currentSong?.genre || 'Various'}</div>
           </div>
         </div>
       </div>
     </div>
   </div>
   ```

4. **Create default album artwork file** (create new file):
   - Create directory: `custom_components/soundbeats/www/images/`
   - Add a default album artwork image: `default-album.png` (200x200px)

**Expected Result:** Song information will be displayed prominently with large album artwork and rich metadata, creating a more immersive music discovery experience.

---

## Functionality Enhancements

### 1. Smart Difficulty Adjustment System

**Description:** Implement an adaptive difficulty system that adjusts point values and time limits based on team performance, making the game more balanced and engaging for groups with different music knowledge levels.

**Implementation Details:**

**Files to Modify:**
- `custom_components/soundbeats/sensor.py`
- `custom_components/soundbeats/services.yaml`
- `custom_components/soundbeats/__init__.py`

**Changes Required:**

1. **Add difficulty sensor** in `sensor.py` (add after SoundbeatsCurrentSongSensor, around line 505):
   ```python
   class SoundbeatsDifficultyAnalyzer(SensorEntity, RestoreEntity):
       """Analyzes team performance and adjusts difficulty."""
       
       def __init__(self) -> None:
           self._attr_name = "Soundbeats Difficulty Analyzer"
           self._attr_unique_id = "soundbeats_difficulty_analyzer"
           self._attr_icon = "mdi:chart-line"
           self._difficulty_level = "Medium"  # Easy, Medium, Hard, Expert
           self._performance_history = []
           self._rounds_played = 0
           self._average_accuracy = 0.0
       
       async def async_added_to_hass(self) -> None:
           await super().async_added_to_hass()
           if (last_state := await self.async_get_last_state()) is not None:
               try:
                   self._difficulty_level = last_state.state
                   if last_state.attributes:
                       self._rounds_played = last_state.attributes.get("rounds_played", 0)
                       self._average_accuracy = last_state.attributes.get("average_accuracy", 0.0)
               except (ValueError, TypeError):
                   pass
       
       @property
       def state(self) -> str:
           return self._difficulty_level
       
       @property
       def extra_state_attributes(self) -> dict[str, Any]:
           return {
               "rounds_played": self._rounds_played,
               "average_accuracy": self._average_accuracy,
               "timer_multiplier": self.get_timer_multiplier(),
               "points_multiplier": self.get_points_multiplier(),
           }
       
       def get_timer_multiplier(self) -> float:
           """Get timer multiplier based on difficulty."""
           multipliers = {"Easy": 1.5, "Medium": 1.0, "Hard": 0.8, "Expert": 0.6}
           return multipliers.get(self._difficulty_level, 1.0)
       
       def get_points_multiplier(self) -> float:
           """Get points multiplier based on difficulty."""
           multipliers = {"Easy": 0.8, "Medium": 1.0, "Hard": 1.2, "Expert": 1.5}
           return multipliers.get(self._difficulty_level, 1.0)
       
       def analyze_round_performance(self, teams_data: dict) -> None:
           """Analyze team performance and adjust difficulty."""
           correct_guesses = 0
           total_guesses = 0
           
           for team_data in teams_data.values():
               if team_data.get("participating", False):
                   total_guesses += 1
                   # Consider a guess correct if within 5 years
                   if team_data.get("last_round_points", 0) > 0:
                       correct_guesses += 1
           
           if total_guesses > 0:
               round_accuracy = correct_guesses / total_guesses
               self._performance_history.append(round_accuracy)
               
               # Keep only last 5 rounds for analysis
               if len(self._performance_history) > 5:
                   self._performance_history.pop(0)
               
               self._rounds_played += 1
               self._average_accuracy = sum(self._performance_history) / len(self._performance_history)
               
               # Adjust difficulty based on performance
               if self._average_accuracy > 0.8 and self._rounds_played >= 3:
                   # Too easy, increase difficulty
                   if self._difficulty_level == "Easy":
                       self._difficulty_level = "Medium"
                   elif self._difficulty_level == "Medium":
                       self._difficulty_level = "Hard"
                   elif self._difficulty_level == "Hard":
                       self._difficulty_level = "Expert"
               elif self._average_accuracy < 0.3 and self._rounds_played >= 3:
                   # Too hard, decrease difficulty
                   if self._difficulty_level == "Expert":
                       self._difficulty_level = "Hard"
                   elif self._difficulty_level == "Hard":
                       self._difficulty_level = "Medium"
                   elif self._difficulty_level == "Medium":
                       self._difficulty_level = "Easy"
               
               self.async_write_ha_state()
   ```

2. **Update countdown current sensor** to use difficulty multiplier (in SoundbeatsCountdownCurrentSensor, around line 248):
   ```python
   def start_countdown(self, duration: int) -> None:
       """Start a countdown from the given duration."""
       # Get difficulty multiplier
       difficulty_sensor = None
       if hasattr(self.hass, 'data') and DOMAIN in self.hass.data:
           entities = self.hass.data[DOMAIN].get("entities", {})
           difficulty_sensor = entities.get("difficulty_analyzer")
       
       multiplier = 1.0
       if difficulty_sensor and hasattr(difficulty_sensor, 'get_timer_multiplier'):
           multiplier = difficulty_sensor.get_timer_multiplier()
       
       adjusted_duration = int(duration * multiplier)
       
       self.stop_countdown()
       self._current_countdown = adjusted_duration
       self._evaluation_done = False
       self.async_write_ha_state()
       
       if adjusted_duration > 0:
           self._countdown_task = self.hass.loop.call_later(
               1, self._async_decrement_countdown
           )
   ```

3. **Update evaluation logic** to use difficulty multiplier and analyze performance (in SoundbeatsCountdownCurrentSensor._evaluate_round, around line 340-365):
   ```python
   # After calculating points_to_add, multiply by difficulty
   difficulty_sensor = entities.get("difficulty_analyzer")
   if difficulty_sensor and hasattr(difficulty_sensor, 'get_points_multiplier'):
       points_multiplier = difficulty_sensor.get_points_multiplier()
       points_to_add = int(points_to_add * points_multiplier)
   
   # Store performance data for analysis
   team_performance = {}
   for team_key, team_sensor in team_sensors.items():
       if team_sensor and hasattr(team_sensor, 'extra_state_attributes'):
           team_attrs = team_sensor.extra_state_attributes
           team_performance[team_key] = {
               "participating": team_attrs.get("participating", False),
               "last_round_points": points_to_add if team_key == current_team_key else 0
           }
   
   # Analyze performance and adjust difficulty
   if difficulty_sensor and hasattr(difficulty_sensor, 'analyze_round_performance'):
       difficulty_sensor.analyze_round_performance(team_performance)
   ```

4. **Add difficulty analyzer to entity setup** (in sensor.py async_setup_entry, around line 45):
   ```python
   # Add after current_song_sensor
   difficulty_analyzer = SoundbeatsDifficultyAnalyzer()
   entities.append(difficulty_analyzer)
   
   # Add to entities dict
   hass.data[DOMAIN]["entities"]["difficulty_analyzer"] = difficulty_analyzer
   ```

5. **Add service for manual difficulty adjustment** in services.yaml:
   ```yaml
   set_difficulty:
     name: Set Difficulty Level
     description: Manually set the game difficulty level
     fields:
       difficulty:
         name: Difficulty Level
         description: The difficulty level to set
         required: true
         example: "Medium"
         selector:
           select:
             options:
               - "Easy"
               - "Medium" 
               - "Hard"
               - "Expert"
   ```

**Expected Result:** The game will automatically adjust difficulty based on team performance, providing longer timers and reduced points for struggling groups, or shorter timers and bonus points for expert players.

---

### 2. Song Category and Era Selection System

**Description:** Allow game administrators to select specific music categories (rock, pop, hip-hop) and eras (60s, 80s, 2000s) for more targeted and themed gameplay sessions.

**Implementation Details:**

**Files to Modify:**
- `custom_components/soundbeats/songs.json`
- `custom_components/soundbeats/sensor.py`
- `custom_components/soundbeats/__init__.py`
- `custom_components/soundbeats/services.yaml`
- `custom_components/soundbeats/www/soundbeats-card.js`

**Changes Required:**

1. **Enhance songs.json structure** with categories and metadata:
   ```json
   [
     {
       "url": "https://open.spotify.com/track/4lBBoyZgJfm0Epu4xbZisU",
       "year": 1990,
       "id": 1,
       "song_name": "Nothing Else Matters",
       "artist": "Metallica",
       "album": "Metallica (Black Album)",
       "genre": "Rock",
       "category": "Metal",
       "era": "90s",
       "difficulty": "Medium",
       "duration": "6:28"
     },
     {
       "url": "https://open.spotify.com/track/3P5dVXm98CgVuEpcW2HsUk",
       "year": 1983,
       "id": 2,
       "song_name": "Billie Jean",
       "artist": "Michael Jackson", 
       "album": "Thriller",
       "genre": "Pop",
       "category": "Dance",
       "era": "80s",
       "difficulty": "Easy",
       "duration": "4:54"
     }
   ]
   ```

2. **Add category filter sensor** in sensor.py:
   ```python
   class SoundbeatsCategoryFilter(SensorEntity, RestoreEntity):
       """Manages song category and era filtering."""
       
       def __init__(self) -> None:
           self._attr_name = "Soundbeats Category Filter"
           self._attr_unique_id = "soundbeats_category_filter"
           self._attr_icon = "mdi:filter"
           self._selected_categories = ["All"]
           self._selected_eras = ["All"]
           self._selected_genres = ["All"]
       
       async def async_added_to_hass(self) -> None:
           await super().async_added_to_hass()
           if (last_state := await self.async_get_last_state()) is not None:
               try:
                   if last_state.attributes:
                       self._selected_categories = last_state.attributes.get("categories", ["All"])
                       self._selected_eras = last_state.attributes.get("eras", ["All"]) 
                       self._selected_genres = last_state.attributes.get("genres", ["All"])
               except (ValueError, TypeError):
                   pass
       
       @property
       def state(self) -> str:
           return f"{len(self._selected_categories)} categories, {len(self._selected_eras)} eras"
       
       @property  
       def extra_state_attributes(self) -> dict[str, Any]:
           return {
               "categories": self._selected_categories,
               "eras": self._selected_eras,
               "genres": self._selected_genres,
               "available_categories": self.get_available_categories(),
               "available_eras": self.get_available_eras(),
               "available_genres": self.get_available_genres(),
           }
       
       def get_available_categories(self) -> list:
           """Get all available categories from songs."""
           return ["All", "Rock", "Pop", "Hip-Hop", "Electronic", "Metal", "Dance", "Alternative"]
       
       def get_available_eras(self) -> list:
           """Get all available eras."""
           return ["All", "60s", "70s", "80s", "90s", "2000s", "2010s", "2020s"]
       
       def get_available_genres(self) -> list:
           """Get all available genres."""
           return ["All", "Rock", "Pop", "Hip-Hop", "Electronic", "Metal", "Jazz", "Classical"]
       
       def update_filters(self, categories: list = None, eras: list = None, genres: list = None) -> None:
           """Update the active filters."""
           if categories is not None:
               self._selected_categories = categories
           if eras is not None:
               self._selected_eras = eras
           if genres is not None:
               self._selected_genres = genres
           self.async_write_ha_state()
       
       def get_filtered_songs(self, all_songs: list) -> list:
           """Filter songs based on current selection."""
           if not all_songs:
               return []
           
           filtered = []
           for song in all_songs:
               # Check category filter
               if "All" not in self._selected_categories:
                   if song.get("category") not in self._selected_categories:
                       continue
               
               # Check era filter
               if "All" not in self._selected_eras:
                   if song.get("era") not in self._selected_eras:
                       continue
               
               # Check genre filter
               if "All" not in self._selected_genres:
                   if song.get("genre") not in self._selected_genres:
                       continue
               
               filtered.append(song)
           
           return filtered
   ```

3. **Update next_song service** in __init__.py to use filtering (around line 150-200):
   ```python
   async def next_song(call):
       _LOGGER.info("Starting next song")
       entities = _get_entities()
       
       # Get category filter
       category_filter = entities.get("category_filter")
       
       # Load and filter songs
       songs_file = os.path.join(os.path.dirname(__file__), "songs.json")
       try:
           with open(songs_file, "r") as f:
               all_songs = json.load(f)
           
           # Apply filters if available
           if category_filter and hasattr(category_filter, 'get_filtered_songs'):
               songs = category_filter.get_filtered_songs(all_songs)
           else:
               songs = all_songs
           
           if not songs:
               _LOGGER.warning("No songs available after filtering")
               return
           
           # Select random song
           selected_song = random.choice(songs)
           _LOGGER.info("Selected song: %s by %s (%s)", 
                       selected_song.get("song_name", "Unknown"), 
                       selected_song.get("artist", "Unknown"),
                       selected_song.get("year", "Unknown"))
   ```

4. **Add filter UI to card** in soundbeats-card.js (add to admin section, around line 600-650):
   ```javascript
   <!-- Category Filter Section - Only visible to admins -->
   <div class="section admin-section ${isAdmin ? '' : 'hidden'}">
     <h3>
       <ha-icon icon="mdi:filter-variant" class="icon"></ha-icon>
       Music Filters
     </h3>
     <p>Select music categories and eras for the next songs.</p>
     <div class="filter-controls">
       <div class="filter-group">
         <label>Categories:</label>
         <div class="filter-checkboxes">
           ${this.getCategoryFilterOptions().map(category => `
             <label class="filter-checkbox">
               <input type="checkbox" value="${category}" 
                      ${this.isCategorySelected(category) ? 'checked' : ''}
                      onchange="this.getRootNode().host.updateCategoryFilter()">
               <span>${category}</span>
             </label>
           `).join('')}
         </div>
       </div>
       <div class="filter-group">
         <label>Eras:</label>
         <div class="filter-checkboxes">
           ${this.getEraFilterOptions().map(era => `
             <label class="filter-checkbox">
               <input type="checkbox" value="${era}"
                      ${this.isEraSelected(era) ? 'checked' : ''}
                      onchange="this.getRootNode().host.updateEraFilter()">
               <span>${era}</span>
             </label>
           `).join('')}
         </div>
       </div>
     </div>
   </div>
   ```

5. **Add filter methods to card** (add to SoundbeatsCard class):
   ```javascript
   getCategoryFilterOptions() {
     const filterEntity = this.hass?.states['sensor.soundbeats_category_filter'];
     return filterEntity?.attributes?.available_categories || ['All'];
   }
   
   updateCategoryFilter() {
     const checkboxes = this.shadowRoot.querySelectorAll('.filter-group:first-child input[type="checkbox"]:checked');
     const selected = Array.from(checkboxes).map(cb => cb.value);
     
     if (this.hass && selected.length > 0) {
       this.hass.callService('soundbeats', 'update_category_filter', {
         categories: selected
       });
     }
   }
   ```

6. **Add services** in services.yaml:
   ```yaml
   update_category_filter:
     name: Update Category Filter
     description: Update the active music category filters
     fields:
       categories:
         name: Categories
         description: List of categories to include
         required: false
         example: ["Rock", "Pop"]
         selector:
           select:
             multiple: true
             options:
               - "All"
               - "Rock"
               - "Pop"
               - "Hip-Hop"
       eras:
         name: Eras
         description: List of eras to include
         required: false
         example: ["80s", "90s"]
         selector:
           select:
             multiple: true
             options:
               - "All"
               - "60s"
               - "70s"
               - "80s"
               - "90s"
               - "2000s"
   ```

**Expected Result:** Game administrators will be able to create themed music sessions (e.g., "80s Rock Night" or "2000s Pop Party") by selecting specific categories and eras, making the game more customizable for different audiences and events.

---

### 3. Multiplayer Statistics and Achievement System

**Description:** Add comprehensive game statistics tracking and an achievement system that rewards teams and individual players for various accomplishments, encouraging long-term engagement and friendly competition.

**Implementation Details:**

**Files to Modify:**
- `custom_components/soundbeats/sensor.py`
- `custom_components/soundbeats/__init__.py`
- `custom_components/soundbeats/www/soundbeats-card.js`
- `custom_components/soundbeats/services.yaml`

**Changes Required:**

1. **Add statistics tracking sensor** in sensor.py:
   ```python
   class SoundbeatsStatistics(SensorEntity, RestoreEntity):
       """Tracks comprehensive game statistics and achievements."""
       
       def __init__(self) -> None:
           self._attr_name = "Soundbeats Statistics"
           self._attr_unique_id = "soundbeats_statistics"
           self._attr_icon = "mdi:chart-bar"
           self._statistics = {
               "games_played": 0,
               "total_rounds": 0,
               "perfect_guesses": 0,
               "close_guesses": 0,
               "total_points_awarded": 0,
               "average_accuracy": 0.0,
               "longest_streak": 0,
               "team_statistics": {},
               "achievements": [],
               "session_start": None,
               "last_played": None
           }
       
       async def async_added_to_hass(self) -> None:
           await super().async_added_to_hass()
           if (last_state := await self.async_get_last_state()) is not None:
               try:
                   if last_state.attributes:
                       # Restore all statistics
                       for key, default in self._statistics.items():
                           self._statistics[key] = last_state.attributes.get(key, default)
               except (ValueError, TypeError):
                   pass
       
       @property
       def state(self) -> str:
           return f"{self._statistics['games_played']} games played"
       
       @property
       def extra_state_attributes(self) -> dict[str, Any]:
           return self._statistics.copy()
       
       def record_game_start(self) -> None:
           """Record the start of a new game."""
           import datetime
           self._statistics["games_played"] += 1
           self._statistics["session_start"] = datetime.datetime.now().isoformat()
           self.async_write_ha_state()
       
       def record_round_result(self, team_id: str, team_name: str, points_earned: int, 
                             year_guess: int, actual_year: int) -> None:
           """Record the result of a round for statistics."""
           import datetime
           
           self._statistics["total_rounds"] += 1
           self._statistics["last_played"] = datetime.datetime.now().isoformat()
           
           # Track team statistics
           if team_id not in self._statistics["team_statistics"]:
               self._statistics["team_statistics"][team_id] = {
                   "name": team_name,
                   "rounds_played": 0,
                   "total_points": 0,
                   "perfect_guesses": 0,
                   "close_guesses": 0,
                   "current_streak": 0,
                   "best_streak": 0,
                   "average_error": 0.0,
                   "achievements": []
               }
           
           team_stats = self._statistics["team_statistics"][team_id]
           team_stats["rounds_played"] += 1
           team_stats["total_points"] += points_earned
           team_stats["name"] = team_name  # Update in case name changed
           
           # Calculate accuracy
           year_error = abs(actual_year - year_guess)
           
           if year_error == 0:
               self._statistics["perfect_guesses"] += 1
               team_stats["perfect_guesses"] += 1
               team_stats["current_streak"] += 1
           elif year_error <= 5:
               self._statistics["close_guesses"] += 1
               team_stats["close_guesses"] += 1
               team_stats["current_streak"] += 1
           else:
               team_stats["current_streak"] = 0
           
           # Update best streak
           if team_stats["current_streak"] > team_stats["best_streak"]:
               team_stats["best_streak"] = team_stats["current_streak"]
           
           if team_stats["best_streak"] > self._statistics["longest_streak"]:
               self._statistics["longest_streak"] = team_stats["best_streak"]
           
           # Update average error
           if team_stats["rounds_played"] > 0:
               total_error = team_stats.get("total_error", 0) + year_error
               team_stats["total_error"] = total_error
               team_stats["average_error"] = total_error / team_stats["rounds_played"]
           
           self._statistics["total_points_awarded"] += points_earned
           
           # Check for achievements
           self._check_achievements(team_id, team_stats)
           self.async_write_ha_state()
       
       def _check_achievements(self, team_id: str, team_stats: dict) -> None:
           """Check and award achievements."""
           achievements = [
               {
                   "id": "first_perfect",
                   "name": "Bull's Eye!",
                   "description": "Get your first perfect guess",
                   "condition": lambda ts: ts["perfect_guesses"] >= 1
               },
               {
                   "id": "streak_5",
                   "name": "On Fire!",
                   "description": "Get 5 correct guesses in a row",
                   "condition": lambda ts: ts["best_streak"] >= 5
               },
               {
                   "id": "century_club",
                   "name": "Century Club",
                   "description": "Score 100 total points",
                   "condition": lambda ts: ts["total_points"] >= 100
               },
               {
                   "id": "music_expert",
                   "name": "Music Expert",
                   "description": "Maintain average error under 3 years",
                   "condition": lambda ts: ts["rounds_played"] >= 10 and ts["average_error"] < 3
               },
               {
                   "id": "dedicated_player",
                   "name": "Dedicated Player",
                   "description": "Play 50 rounds",
                   "condition": lambda ts: ts["rounds_played"] >= 50
               }
           ]
           
           for achievement in achievements:
               if (achievement["id"] not in team_stats["achievements"] and 
                   achievement["condition"](team_stats)):
                   team_stats["achievements"].append(achievement["id"])
                   self._statistics["achievements"].append({
                       "team_id": team_id,
                       "achievement": achievement,
                       "earned_date": datetime.datetime.now().isoformat()
                   })
       
       def get_leaderboard(self, metric: str = "total_points") -> list:
           """Get team leaderboard sorted by specified metric."""
           teams = []
           for team_id, stats in self._statistics["team_statistics"].items():
               teams.append({
                   "team_id": team_id,
                   "name": stats["name"],
                   metric: stats.get(metric, 0)
               })
           
           return sorted(teams, key=lambda x: x[metric], reverse=True)
   ```

2. **Update evaluation logic** to record statistics (in SoundbeatsCountdownCurrentSensor._evaluate_round, around line 360):
   ```python
   # After awarding points, record statistics
   statistics_sensor = entities.get("statistics_sensor")
   if statistics_sensor and hasattr(statistics_sensor, 'record_round_result'):
       statistics_sensor.record_round_result(
           team_key, 
           team_attrs.get("name", f"Team {team_attrs.get('team_number', 1)}"),
           points_to_add,
           year_guess,
           song_year
       )
   ```

3. **Add statistics UI section** to soundbeats-card.js (add new section in render(), around line 450):
   ```javascript
   <!-- Statistics Section - Visible to all users -->
   <div class="section statistics-section">
     <h3>
       <ha-icon icon="mdi:trophy" class="icon"></ha-icon>
       Statistics & Achievements
     </h3>
     <div class="statistics-grid">
       <div class="stat-card">
         <div class="stat-number">${this.getStatistic('games_played')}</div>
         <div class="stat-label">Games Played</div>
       </div>
       <div class="stat-card">
         <div class="stat-number">${this.getStatistic('total_rounds')}</div>
         <div class="stat-label">Total Rounds</div>
       </div>
       <div class="stat-card">
         <div class="stat-number">${this.getStatistic('perfect_guesses')}</div>
         <div class="stat-label">Perfect Guesses</div>
       </div>
       <div class="stat-card">
         <div class="stat-number">${this.getStatistic('longest_streak')}</div>
         <div class="stat-label">Longest Streak</div>
       </div>
     </div>
     
     <!-- Leaderboard -->
     <div class="leaderboard">
       <h4>Team Leaderboard</h4>
       <div class="leaderboard-list">
         ${this.renderLeaderboard()}
       </div>
     </div>
     
     <!-- Recent Achievements -->
     <div class="achievements">
       <h4>Recent Achievements</h4>
       <div class="achievements-list">
         ${this.renderRecentAchievements()}
       </div>
     </div>
   </div>
   ```

4. **Add statistics CSS** to soundbeats-card.js:
   ```javascript
   // Add to CSS section
   .statistics-grid {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
     gap: 12px;
     margin: 16px 0;
   }
   
   .stat-card {
     background: rgba(var(--rgb-primary-color), 0.1);
     border-radius: 8px;
     padding: 16px;
     text-align: center;
   }
   
   .stat-number {
     font-size: 24px;
     font-weight: bold;
     color: var(--primary-color);
   }
   
   .stat-label {
     font-size: 12px;
     opacity: 0.7;
     margin-top: 4px;
   }
   
   .leaderboard-list {
     background: rgba(var(--rgb-card-background-color), 0.5);
     border-radius: 8px;
     padding: 12px;
   }
   
   .leaderboard-item {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 8px;
     border-bottom: 1px solid rgba(var(--rgb-divider-color), 0.2);
   }
   
   .leaderboard-rank {
     font-weight: bold;
     color: var(--primary-color);
     margin-right: 8px;
   }
   
   .achievement-item {
     display: flex;
     align-items: center;
     padding: 8px;
     background: rgba(var(--rgb-success-color), 0.1);
     border-radius: 6px;
     margin: 4px 0;
   }
   
   .achievement-icon {
     margin-right: 8px;
     color: var(--success-color);
   }
   ```

5. **Add helper methods** to SoundbeatsCard class:
   ```javascript
   getStatistic(key) {
     const statsEntity = this.hass?.states['sensor.soundbeats_statistics'];
     return statsEntity?.attributes?.[key] || 0;
   }
   
   renderLeaderboard() {
     const statsEntity = this.hass?.states['sensor.soundbeats_statistics'];
     const teamStats = statsEntity?.attributes?.team_statistics || {};
     
     const teams = Object.entries(teamStats)
       .map(([id, stats]) => ({ id, ...stats }))
       .sort((a, b) => b.total_points - a.total_points)
       .slice(0, 5);
     
     return teams.map((team, index) => `
       <div class="leaderboard-item">
         <div>
           <span class="leaderboard-rank">${index + 1}.</span>
           ${team.name}
         </div>
         <div>${team.total_points} pts</div>
       </div>
     `).join('');
   }
   
   renderRecentAchievements() {
     const statsEntity = this.hass?.states['sensor.soundbeats_statistics'];
     const achievements = statsEntity?.attributes?.achievements || [];
     
     return achievements.slice(-3).reverse().map(achievement => `
       <div class="achievement-item">
         <ha-icon icon="mdi:trophy" class="achievement-icon"></ha-icon>
         <div>
           <strong>${achievement.achievement.name}</strong>
           <div class="achievement-description">${achievement.achievement.description}</div>
         </div>
       </div>
     `).join('') || '<p>No achievements yet. Start playing to earn some!</p>';
   }
   ```

6. **Add statistics to sensor setup** (in sensor.py async_setup_entry, around line 47):
   ```python
   # Add statistics sensor
   statistics_sensor = SoundbeatsStatistics()
   entities.append(statistics_sensor)
   
   # Add to entities dict
   hass.data[DOMAIN]["entities"]["statistics_sensor"] = statistics_sensor
   ```

**Expected Result:** Players will have access to comprehensive statistics tracking their performance over time, team leaderboards to encourage competition, and an achievement system that rewards various accomplishments, significantly increasing long-term engagement and replayability.

---

## Implementation Priority

1. **High Priority:** Team Color Coding (Easy UI win)
2. **High Priority:** Smart Difficulty Adjustment (Improves gameplay balance)
3. **Medium Priority:** Song Category Selection (Increases customization)
4. **Medium Priority:** Enhanced Song Display (Better user experience)
5. **Medium Priority:** Progress Indicators (Visual polish)
6. **Low Priority:** Statistics System (Advanced feature for power users)

Each enhancement is designed to be independently implementable and provides immediate value while maintaining backward compatibility with existing installations.