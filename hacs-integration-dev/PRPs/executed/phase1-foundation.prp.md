# Phase 1: Foundation & HACS Structure - Product Requirements Prompt

## Goal
Implement Phase 1 of the Soundbeats Home Assistant integration to create a solid HACS-compliant foundation with panel registration. Transform the existing placeholder integration (`your_integration`) into a properly named and functional `soundbeats` integration with a sidebar panel that displays "Coming Soon" message.

## Why
- **Foundation for Game**: Establishes the core structure needed for all future phases
- **HACS Compliance**: Ensures integration can be distributed through HACS store
- **User Visibility**: Provides immediate feedback that integration is installed and working
- **Development Ready**: Creates proper structure for frontend development in later phases

## What
Transform placeholder integration into functional Soundbeats integration with:

### Core Deliverables
1. **Integration Renaming**: Complete transformation from `your_integration` → `soundbeats`
2. **Panel Registration**: Functional sidebar panel with music note icon
3. **Frontend Framework**: Basic HTML/JS structure for panel display
4. **HACS Compliance**: All required files and metadata for HACS approval
5. **WebSocket Foundation**: Basic WebSocket API handlers for future expansion

### Success Criteria
- [ ] **Integration appears in HACS** with proper name "Soundbeats"
- [ ] **Installs without errors** via HACS installation flow
- [ ] **Sidebar shows "Soundbeats" panel** with music note icon (`mdi:music-note`)
- [ ] **Panel loads successfully** showing "Soundbeats Game - Coming Soon" message
- [ ] **All HACS validation checks pass** (GitHub Actions green)
- [ ] **GitHub Actions CI passes** with no errors
- [ ] **Integration survives HA restart** (panel persists)
- [ ] **No HA log errors** during integration setup and operation

## All Needed Context

### Documentation & References
```yaml
# CRITICAL HA Development Patterns
- url: https://developers.home-assistant.io/docs/creating_component_index/
  sections: 
    - Integration structure and setup patterns
    - Async/await requirements and best practices
    - Config entry management
    
- url: https://developers.home-assistant.io/docs/frontend/custom-ui/creating-custom-panels/
  sections:
    - Custom panel registration methods
    - Frontend integration patterns
    - Panel configuration requirements
    
- url: https://www.hacs.xyz/docs/publish/integration/
  sections:
    - HACS validation requirements
    - Repository structure standards
    - Manifest and metadata requirements

# Existing Code Patterns to Follow
- file: custom_components/hacs/frontend.py:23-67
  why: Perfect example of async_register_built_in_panel usage with static path
  pattern: HACS panel registration with static file serving
  
- file: custom_components/hacs/__init__.py
  why: Integration setup patterns with proper async handling
  
- file: custom_components/hacs/websocket/__init__.py
  why: WebSocket command registration patterns for HA integrations

# Current Codebase Analysis
- file: custom_components/your_integration/__init__.py
  status: Basic structure exists, needs panel registration and renaming
  
- file: custom_components/your_integration/manifest.json
  status: Valid manifest but needs domain and name updates
  
- file: hacs.json
  status: Valid but needs name/domain updates
```

### Known Gotchas & Critical Patterns
```python
# CRITICAL: HA Panel Registration Pattern
# Use this exact pattern from HACS (proven working)
from homeassistant.components.frontend import async_register_built_in_panel
from .utils.workarounds import async_register_static_path  # HACS pattern

# CRITICAL: Static file serving MUST be registered first
await async_register_static_path(
    hass, 
    "/soundbeats_static", 
    hass.config.path(f"custom_components/{DOMAIN}/frontend"),
    cache_headers=False
)

# CRITICAL: Panel registration with exact config structure
async_register_built_in_panel(
    hass,
    component_name="custom",
    sidebar_title="Soundbeats",
    sidebar_icon="mdi:music-note", 
    frontend_url_path="soundbeats",
    config={
        "_panel_custom": {
            "name": "soundbeats-frontend",
            "embed_iframe": True,
            "trust_external": False,
            "js_url": "/soundbeats_static/soundbeats-panel.js",
        }
    },
    require_admin=False,  # Allow all users for party games
)

# CRITICAL: Frontend file must be ES6 module
# Panel JS MUST export default class extending HTMLElement or LitElement

# CRITICAL: Domain consistency across ALL files
# DOMAIN = "soundbeats" must be used everywhere

# CRITICAL: HACS validation requirements
# manifest.json MUST have version field for custom integrations
# hacs.json MUST match integration name and domains exactly
```

### Current State Analysis
**Existing Files (need modification):**
- `custom_components/your_integration/` - Complete directory rename needed
- `__init__.py` - Add panel registration, update imports
- `manifest.json` - Update domain and name fields
- `const.py` - Update DOMAIN constant
- `hacs.json` - Update name and domains
- `README.md` - Update with proper installation instructions

**Missing Files (need creation):**
- `custom_components/soundbeats/frontend/index.html` - Panel entry point
- `custom_components/soundbeats/frontend/soundbeats-panel.js` - Main panel component
- `info.md` - HACS store display information
- WebSocket handlers for panel communication

## Implementation Blueprint

### Task 1: Systematic Integration Renaming
**Priority: CRITICAL - Must be completed first**

```python
# Step 1.1: Rename directory structure
# FROM: custom_components/your_integration/
# TO:   custom_components/soundbeats/

# Step 1.2: Update const.py
DOMAIN = "soundbeats"  # Was: "your_integration"

# Step 1.3: Update manifest.json
{
  "domain": "soundbeats",
  "name": "Soundbeats",
  "codeowners": ["@yourgithubusername"],
  "config_flow": true,
  "dependencies": ["frontend", "websocket_api"],
  "documentation": "https://github.com/yourusername/soundbeats-integration",
  "iot_class": "local_push",
  "issue_tracker": "https://github.com/yourusername/soundbeats-integration/issues",
  "requirements": [],
  "version": "1.0.0",
  "integration_type": "service"
}

# Step 1.4: Update hacs.json
{
  "name": "Soundbeats",
  "domains": ["soundbeats"],
  "homeassistant": "2024.1.0",
  "render_readme": true,
  "category": "integration"
}
```

### Task 2: Panel Registration Implementation
**Priority: CRITICAL**

```python
# File: custom_components/soundbeats/__init__.py

from __future__ import annotations
import logging
from typing import Any
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components import websocket_api

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)
PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.MEDIA_PLAYER]

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Soundbeats from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    # Register static path for frontend assets
    await hass.http.async_register_static_path(
        "/soundbeats_static",
        hass.config.path(f"custom_components/{DOMAIN}/frontend"),
        cache_headers=False,
    )

    # Register panel in sidebar
    if DOMAIN not in hass.data.get("frontend_panels", {}):
        async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title="Soundbeats",
            sidebar_icon="mdi:music-note",
            frontend_url_path="soundbeats",
            config={
                "_panel_custom": {
                    "name": "soundbeats-frontend",
                    "embed_iframe": True,
                    "trust_external": False,
                    "js_url": "/soundbeats_static/soundbeats-panel.js",
                }
            },
            require_admin=False,
        )

    # Register WebSocket commands for future use
    websocket_api.async_register_command(hass, websocket_get_status)

    # Forward entry setup to platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok

# Basic WebSocket command for testing
@websocket_api.websocket_command(
    {
        "type": "soundbeats/status",
    }
)
@websocket_api.async_response
async def websocket_get_status(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle get status command."""
    connection.send_result(
        msg["id"],
        {
            "status": "ready",
            "version": "1.0.0",
            "message": "Soundbeats integration is ready"
        }
    )
```

### Task 3: Frontend Structure Creation
**Priority: HIGH**

```html
<!-- File: custom_components/soundbeats/frontend/index.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Soundbeats</title>
</head>
<body>
    <soundbeats-panel></soundbeats-panel>
    <script type="module" src="./soundbeats-panel.js"></script>
</body>
</html>
```

```javascript
// File: custom_components/soundbeats/frontend/soundbeats-panel.js
import { LitElement, html, css } from 'https://unpkg.com/lit@3/index.js?module';

class SoundbeatsPanel extends LitElement {
  static properties = {
    hass: { state: true },
    narrow: { type: Boolean },
    panel: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family);
      --mdc-theme-primary: var(--primary-color);
    }
    
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
      box-sizing: border-box;
    }
    
    .logo {
      font-size: 4rem;
      margin-bottom: 2rem;
      color: var(--primary-color);
    }
    
    .title {
      font-size: 2.5rem;
      font-weight: 300;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .subtitle {
      font-size: 1.2rem;
      opacity: 0.7;
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .status {
      padding: 12px 24px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-radius: 24px;
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .title {
        font-size: 2rem;
      }
      .logo {
        font-size: 3rem;
      }
    }
  `;

  render() {
    return html`
      <div class="container">
        <div class="logo">🎵</div>
        <h1 class="title">Soundbeats</h1>
        <p class="subtitle">Music Trivia Party Game for Home Assistant</p>
        <div class="status">Coming Soon - Phase 1 Complete!</div>
      </div>
    `;
  }
  
  connectedCallback() {
    super.connectedCallback();
    // Test WebSocket connection
    this.hass?.connection?.sendMessage({
      type: "soundbeats/status"
    }).then(response => {
      console.log("Soundbeats status:", response);
    });
  }
}

customElements.define('soundbeats-panel', SoundbeatsPanel);
export default SoundbeatsPanel;
```

### Task 4: HACS Compliance Documentation
**Priority: HIGH**

```markdown
<!-- File: info.md -->
# Soundbeats - Music Trivia Party Game

Transform your Home Assistant into an interactive music trivia party game with teams, betting, and live leaderboards!

## Features (Phase 1)
✅ HACS integration with custom sidebar panel  
✅ Clean, responsive interface  
🚧 Multi-team game support (coming in Phase 2)  
🚧 Year guessing gameplay (coming in Phase 3)  
🚧 Spotify integration (coming in Phase 4)  

## Quick Setup
1. Install via HACS
2. Restart Home Assistant  
3. Find "Soundbeats" in your sidebar
4. Click to see the game panel

Perfect for parties, family game nights, or testing your music knowledge!
```

```markdown
<!-- File: README.md updates -->
# Soundbeats Home Assistant Integration

A HACS-compatible Home Assistant integration that transforms your smart home into an interactive music trivia party game.

## Installation via HACS

### Prerequisites
- Home Assistant 2024.1.0 or newer
- HACS installed and configured

### Steps
1. Open HACS in Home Assistant
2. Go to "Integrations"
3. Click the "+" button
4. Search for "Soundbeats"
5. Click "Download"
6. Restart Home Assistant
7. Look for "Soundbeats" in your sidebar

## Current Status: Phase 1 Complete
- ✅ HACS integration structure
- ✅ Sidebar panel registration  
- ✅ Basic frontend framework
- 🚧 Game mechanics (coming in future phases)

## Troubleshooting

### Panel doesn't appear
1. Check Home Assistant logs for errors
2. Ensure integration installed correctly via HACS
3. Try refreshing browser/clearing cache

### Installation fails
1. Verify HACS is properly configured
2. Check Home Assistant version compatibility
3. Review installation logs in HACS

## Development
This integration follows Home Assistant development best practices and is structured for phased implementation of gaming features.
```

### Task 5: Testing & Validation Setup
**Priority: MEDIUM**

```python
# File: tests/test_init.py
import pytest
from unittest.mock import patch, MagicMock
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry

from custom_components.soundbeats import async_setup_entry, async_unload_entry
from custom_components.soundbeats.const import DOMAIN

@pytest.fixture
def mock_entry():
    """Mock config entry."""
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"
    entry.data = {}
    return entry

async def test_setup_entry(hass: HomeAssistant, mock_entry):
    """Test setup entry."""
    with patch('custom_components.soundbeats.async_register_built_in_panel') as mock_panel, \
         patch('homeassistant.components.websocket_api.async_register_command'):
        result = await async_setup_entry(hass, mock_entry)
        
        assert result is True
        assert DOMAIN in hass.data
        mock_panel.assert_called_once()

async def test_unload_entry(hass: HomeAssistant, mock_entry):
    """Test unload entry."""
    hass.data[DOMAIN] = {mock_entry.entry_id: {}}
    
    with patch('homeassistant.config_entries.ConfigEntries.async_unload_platforms', return_value=True):
        result = await async_unload_entry(hass, mock_entry)
        
        assert result is True
        assert mock_entry.entry_id not in hass.data[DOMAIN]
```

## Validation Loop

### Level 1: Syntax & Style Validation
```bash
# Python code validation
cd custom_components/soundbeats
python -m py_compile *.py
ruff check . --fix
mypy . --strict

# Expected: No errors, all files pass validation
```

### Level 2: HACS Validation
```bash
# HACS integration validation
hacs validate --category integration

# Home Assistant manifest validation  
python -m script.hassfest --integration-path custom_components/soundbeats

# Expected: All validation checks pass
```

### Level 3: Integration Testing
```bash
# Install in development HA instance
cp -r custom_components/soundbeats /config/custom_components/

# Restart Home Assistant
ha core restart

# Monitor logs for errors
tail -f /config/home-assistant.log | grep -i soundbeats

# Manual testing checklist:
# 1. Panel appears in sidebar with music note icon
# 2. Panel loads without errors
# 3. "Coming Soon" message displays correctly
# 4. Responsive design works on mobile
# 5. WebSocket connection test succeeds
# 6. Integration survives HA restart
```

### Level 4: HACS Installation Testing
```bash
# Test complete HACS installation flow
# 1. Add repository to HACS
# 2. Install via HACS interface
# 3. Restart HA
# 4. Verify panel functionality
# 5. Check for any errors or warnings

# GitHub Actions validation
git push origin main
# Verify all CI checks pass in GitHub Actions
```

## Task Completion Order

### Phase 1 Implementation Sequence:
1. **Rename Integration** (Task 1)
   - Rename directory: `your_integration` → `soundbeats`
   - Update `const.py` with new DOMAIN
   - Update `manifest.json` domain and name
   - Update all import statements
   - Update `hacs.json` metadata

2. **Implement Panel Registration** (Task 2)
   - Add static path registration to `__init__.py`
   - Implement `async_register_built_in_panel` call
   - Add basic WebSocket command handler
   - Update platform forwards

3. **Create Frontend Structure** (Task 3)
   - Create `frontend/` directory
   - Implement `index.html` entry point
   - Create `soundbeats-panel.js` with LitElement
   - Add responsive styling with HA themes

4. **HACS Compliance** (Task 4)
   - Create `info.md` for HACS store
   - Update `README.md` with installation instructions
   - Verify `hacs.json` configuration
   - Test HACS validation

5. **Testing & Validation** (Task 5)
   - Create basic unit tests
   - Run syntax and style validation
   - Perform integration testing
   - Test HACS installation flow

## Risk Mitigation

### Critical Risks & Solutions:
1. **Panel Registration Failure**
   - Risk: Panel doesn't appear in sidebar
   - Solution: Follow HACS pattern exactly, test static path registration

2. **Frontend Loading Issues**
   - Risk: JavaScript errors prevent panel loading
   - Solution: Use proven LitElement pattern, test ES6 module import

3. **HACS Validation Failures**
   - Risk: Integration rejected by HACS validation
   - Solution: Match requirements exactly, test locally first

4. **Naming Conflicts**
   - Risk: Incomplete renaming breaks integration
   - Solution: Systematic find/replace, verify all references updated

## Confidence Score: 9/10

**High confidence due to:**
- Clear pattern from HACS implementation (proven working)
- Well-defined requirements from Phase 1 planning
- Comprehensive validation strategy
- Existing codebase provides solid foundation
- Extensive documentation and examples

**Minor uncertainty around:**
- Exact Home Assistant version compatibility nuances
- First-time HACS publishing approval process

The implementation path is clear with strong reference examples and thorough testing strategy.