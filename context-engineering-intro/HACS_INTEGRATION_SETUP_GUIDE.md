# 🚀 Complete HACS Integration Development Setup Guide

This guide will walk you through setting up a professional Home Assistant Custom Component (HACS) development environment using Docker, Context Engineering, and automated testing with Puppeteer.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Git installed
- Node.js 18+ (for Puppeteer)
- Claude Desktop with MCP support
- Basic understanding of Python and Home Assistant

## 🏗️ Project Structure Overview

```
hacs-integration-dev/
├── .claude/                      # Context Engineering commands
├── PRPs/                         # Product Requirements Prompts
├── examples/                     # Code patterns and examples
├── docker/                       # Docker configuration
├── custom_components/            # Your integration code
├── tests/                        # Test suites
├── scripts/                      # Automation scripts
├── .github/                      # GitHub Actions
├── hacs.json                     # HACS metadata
├── CLAUDE.md                     # AI assistant rules
├── INITIAL.md                    # Feature templates
└── README.md                     # User documentation
```

## 🚀 Step-by-Step Setup

### Step 1: Create Project Directory

```bash
# Create and navigate to your project directory
mkdir hacs-integration-dev
cd hacs-integration-dev

# Initialize git repository
git init
```

### Step 2: Create Docker Environment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  homeassistant:
    image: ghcr.io/home-assistant/home-assistant:stable
    container_name: ha-dev
    ports:
      - "8123:8123"
    volumes:
      - ./config:/config
      - ./custom_components:/config/custom_components
    environment:
      - TZ=UTC
      - PYTHONUNBUFFERED=1
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8123/api/"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - ha-network

  puppeteer:
    image: browserless/chrome:latest
    container_name: puppeteer-dev
    ports:
      - "3000:3000"
    environment:
      - CONNECTION_TIMEOUT=60000
      - MAX_CONCURRENT_SESSIONS=10
      - ENABLE_DEBUGGER=true
    mem_limit: 2g
    networks:
      - ha-network

networks:
  ha-network:
    driver: bridge
```

Create `.env` file:

```bash
# Home Assistant Configuration
HA_VERSION=stable
TZ=UTC

# Integration Configuration
INTEGRATION_NAME=your_integration
INTEGRATION_DOMAIN=your_integration

# Development Settings
DEBUG_MODE=true
LOG_LEVEL=DEBUG
```

### Step 3: Set Up Context Engineering

Create `.claude/commands/generate-ha-prp.md`:

```markdown
# Generate Home Assistant PRP

You are tasked with generating a comprehensive Product Requirements Prompt (PRP) for a Home Assistant integration.

## Steps:
1. Read the INITIAL.md file: `$ARGUMENTS`
2. Research similar integrations in the examples/ folder
3. Check Home Assistant developer documentation
4. Generate a complete PRP following the template in PRPs/templates/prp_ha_integration.md
5. Save the PRP with a descriptive name in the PRPs/ folder

## Context to Include:
- Home Assistant async patterns
- Config flow implementation
- Entity creation
- HACS requirements
- Testing strategies

Generate a PRP that includes all necessary context for implementation.
```

Create `.claude/commands/execute-ha-prp.md`:

```markdown
# Execute Home Assistant PRP

You are tasked with implementing a Home Assistant integration based on a PRP.

## Steps:
1. Read the PRP file: `$ARGUMENTS`
2. Create a detailed task list using TodoWrite
3. Implement each component following the PRP blueprint
4. Run validation after each major component
5. Fix any issues found during validation
6. Ensure all success criteria are met

## Validation Commands:
- Lint: `ruff check custom_components/ --fix`
- Type check: `mypy custom_components/ --strict`
- HACS: `hacs validate`
- Tests: `pytest tests/`

Execute the implementation with validation loops.
```

Create `.claude/settings.local.json`:

```json
{
  "experimental": {
    "includeHiddenFiles": true
  },
  "permissions": {
    "read": true,
    "write": true,
    "execute": true
  }
}
```

### Step 4: Create Context Engineering Files

Create `CLAUDE.md`:

```markdown
### 🏠 Home Assistant Development Rules

#### Architecture & Async
- **ALWAYS use async/await** - HA is async-first
- **Never block the event loop** - Use `hass.async_add_executor_job` for sync code
- **Follow HA's callback patterns** - Use `@callback` decorator
- **Respect the 10-second setup timeout** - Use background tasks for slow operations

#### Integration Structure
- **manifest.json MUST include**:
  - `version` (required for custom integrations)
  - `codeowners` (GitHub usernames)
  - `config_flow` (if has UI config)
  - `iot_class` (cloud_polling, local_polling, etc.)
  - `integration_type` (hub, device, service, etc.)
- **Use config flow** for all new integrations
- **Support config entry migration** for breaking changes
- **Include translations** in translations/en.json

#### HACS Compliance
- **One integration per repository**
- **Repository must have**:
  - Active status (not archived)
  - At least one release
  - Comprehensive README
  - Valid hacs.json in root
  - info.md for HACS display
- **Version in manifest.json** using SemVer or CalVer

#### Code Quality
- **100% type hints** - Run mypy in strict mode
- **Docstrings for all public methods**
- **Constants in const.py** - No magic strings
- **Use HA's built-in helpers** - Don't reinvent
- **Handle all exceptions** - Never crash HA

#### Testing
- **Unit tests required** for all components
- **Mock the hass object** properly
- **Test error conditions** explicitly
- **Use pytest fixtures** from HA test suite

#### Logging & Debugging
- **Use integration logger**: `_LOGGER = logging.getLogger(__name__)`
- **Log levels**: DEBUG for dev info, INFO for user info, WARNING for issues
- **No print statements** - Always use logger
- **Include context** in error messages
```

Create `INITIAL.md`:

```markdown
## FEATURE: [Your Integration Name]

### Integration Type
- [ ] Sensor
- [ ] Switch
- [ ] Climate
- [ ] Light
- [ ] Other: ___

### Data Source
- API Endpoint: [URL]
- Authentication: [OAuth2/API Key/Basic]
- Rate Limits: [requests/hour]
- API Documentation: [URL]

### Entities to Create
1. **Sensor: [Name]**
   - Unit: [unit]
   - Device Class: [class]
   - Update Frequency: [minutes]

### Configuration Flow
- [ ] Simple (host/port/api_key)
- [ ] OAuth2 flow
- [ ] Discovery via mDNS/SSDP
- [ ] Import from YAML

### EXAMPLES
- `examples/sensors/rest_sensor.py` - REST API pattern
- `examples/config_flow/simple_flow.py` - Basic config flow

### GOTCHAS
- [List any API quirks or limitations]
- [Authentication requirements]
- [Rate limiting details]

### SUCCESS CRITERIA
- [ ] Config flow completes successfully
- [ ] Entities appear in UI within 30s
- [ ] Handles API errors gracefully
- [ ] Passes HACS validation
- [ ] Works on HA 2024.1+
```

### Step 5: Create Basic Integration Structure

Create the directory structure:

```bash
# Create directories
mkdir -p custom_components/your_integration
mkdir -p tests/{unit,integration,e2e}
mkdir -p examples/{config_flow,sensors,tests}
mkdir -p PRPs/{templates,ai_docs}
mkdir -p scripts
mkdir -p .github/workflows
```

Create `custom_components/your_integration/manifest.json`:

```json
{
  "domain": "your_integration",
  "name": "Your Integration",
  "codeowners": ["@yourgithubusername"],
  "config_flow": true,
  "dependencies": [],
  "documentation": "https://github.com/yourusername/your-integration",
  "iot_class": "cloud_polling",
  "issue_tracker": "https://github.com/yourusername/your-integration/issues",
  "requirements": [],
  "version": "0.1.0",
  "integration_type": "device"
}
```

Create `custom_components/your_integration/__init__.py`:

```python
"""The Your Integration component."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Your Integration from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
```

Create `custom_components/your_integration/const.py`:

```python
"""Constants for Your Integration."""
from typing import Final

DOMAIN: Final = "your_integration"

# Configuration
CONF_API_KEY: Final = "api_key"

# Defaults
DEFAULT_NAME: Final = "Your Integration"
DEFAULT_SCAN_INTERVAL: Final = 300  # 5 minutes
```

Create `custom_components/your_integration/config_flow.py`:

```python
"""Config flow for Your Integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN, CONF_API_KEY

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_API_KEY): str,
    }
)


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Your Integration."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}
        
        if user_input is not None:
            # TODO: Validate the API key
            # TODO: Create unique ID
            # TODO: Check for existing entry
            
            return self.async_create_entry(
                title="Your Integration",
                data=user_input
            )

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_USER_DATA_SCHEMA,
            errors=errors,
        )
```

Create `custom_components/your_integration/translations/en.json`:

```json
{
  "config": {
    "step": {
      "user": {
        "title": "Configure Your Integration",
        "description": "Enter your API credentials",
        "data": {
          "api_key": "API Key"
        }
      }
    },
    "error": {
      "cannot_connect": "Failed to connect",
      "invalid_auth": "Invalid authentication",
      "unknown": "Unexpected error"
    },
    "abort": {
      "already_configured": "Integration is already configured"
    }
  }
}
```

Create `hacs.json`:

```json
{
  "name": "Your Integration",
  "domains": ["sensor"],
  "homeassistant": "2024.1.0",
  "render_readme": true,
  "country": ["US"],
  "category": "integration"
}
```

### Step 6: Create Setup Scripts

Create `scripts/setup-dev.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Setting up HACS Integration Development Environment"

# Check prerequisites
echo "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Create necessary directories
echo "Creating directory structure..."
mkdir -p config
mkdir -p custom_components
mkdir -p tests/{unit,integration,e2e}
mkdir -p examples
mkdir -p PRPs/{templates,ai_docs}

# Copy env file if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file - please update with your settings"
fi

# Start containers
echo "Starting Docker containers..."
docker-compose up -d

# Wait for Home Assistant to be ready
echo "Waiting for Home Assistant to start..."
until $(curl --output /dev/null --silent --head --fail http://localhost:8123); do
    printf '.'
    sleep 5
done
echo ""

echo "✅ Development environment is ready!"
echo "Home Assistant: http://localhost:8123"
echo "Puppeteer: http://localhost:3000"
```

Create `scripts/validate-all.sh`:

```bash
#!/bin/bash
set -e

echo "🔍 Running validation suite..."

# Python linting
echo "Running ruff..."
ruff check custom_components/ --fix

# Type checking
echo "Running mypy..."
mypy custom_components/ --strict

# HACS validation
echo "Running HACS validation..."
hacs validate || echo "HACS validation failed - ensure hacs is installed"

# Run tests
echo "Running tests..."
pytest tests/unit/ -v

echo "✅ All validations passed!"
```

### Step 7: Configure MCP Tools

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/puppeteer"]
    }
  }
}
```

### Step 8: Create Examples

Create `examples/README.md`:

```markdown
# Integration Examples

This directory contains example code patterns for Home Assistant integrations.

## Directory Structure

- `config_flow/` - Configuration flow examples
- `sensors/` - Sensor platform examples
- `tests/` - Test pattern examples

## Usage

Reference these examples in your INITIAL.md file when requesting features.
The AI assistant will use these patterns to maintain consistency.
```

Create `examples/sensors/simple_sensor.py`:

```python
"""Example of a simple sensor implementation."""
from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import (
    SensorEntity,
    SensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensor platform."""
    async_add_entities([ExampleSensor(entry)])


class ExampleSensor(SensorEntity):
    """Representation of an Example Sensor."""

    def __init__(self, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        self._attr_unique_id = f"{entry.entry_id}_sensor"
        self._attr_name = "Example Sensor"

    @property
    def native_value(self) -> Any:
        """Return the state of the sensor."""
        return 42
```

### Step 9: GitHub Actions Setup

Create `.github/workflows/validate.yml`:

```yaml
name: Validate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: HACS validation
        uses: hacs/action@main
        with:
          category: integration
          
      - name: Hassfest validation
        uses: home-assistant/actions/hassfest@master
```

## 🎯 Next Steps

### 1. Start Development Environment

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run setup
./scripts/setup-dev.sh
```

### 2. Complete Home Assistant Onboarding

1. Open http://localhost:8123
2. Create a user account
3. Set up your home location
4. Skip device discovery

### 3. Install HACS (Manual)

1. Download HACS: https://github.com/hacs/integration/releases/latest
2. Extract the `hacs` folder to `config/custom_components/`
3. Restart Home Assistant
4. Add HACS integration through UI

### 4. Create Your First Feature

1. Edit `INITIAL.md` with your integration requirements
2. Run in Claude: `/generate-ha-prp INITIAL.md`
3. Review the generated PRP
4. Run in Claude: `/execute-ha-prp PRPs/your-feature.md`

### 5. Test Your Integration

```bash
# Run validation
./scripts/validate-all.sh

# Test in Home Assistant
1. Go to Settings > Integrations
2. Click "Add Integration"
3. Search for your integration
4. Complete config flow
```

### 6. Prepare for Release

1. Update version in `manifest.json`
2. Create GitHub release
3. HACS will automatically detect new versions

## 🐛 Troubleshooting

### Docker Issues

```bash
# View logs
docker-compose logs -f homeassistant

# Restart containers
docker-compose restart

# Clean restart
docker-compose down
docker-compose up -d
```

### Integration Not Showing

1. Check manifest.json is valid JSON
2. Ensure domain matches folder name
3. Check logs for import errors
4. Restart Home Assistant

### HACS Validation Fails

1. Ensure you have at least one release
2. Check hacs.json is valid
3. Verify repository structure
4. Add comprehensive README

## 📚 Resources

- [Home Assistant Developer Docs](https://developers.home-assistant.io/)
- [HACS Documentation](https://hacs.xyz/docs/publish/integration/)
- [Context Engineering Template](https://github.com/coleam00/context-engineering-intro)
- [MCP Documentation](https://modelcontextprotocol.io/)

## 🤝 Need Help?

- Check the examples/ directory
- Review existing integrations
- Ask in Home Assistant Discord
- Create an issue in your repository