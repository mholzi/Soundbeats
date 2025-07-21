name: "Home Assistant Integration PRP Template"
description: |

## Purpose
Template for implementing Home Assistant integrations with HACS compliance and proper async patterns.

## Core Principles
1. **Async-First**: All I/O operations must be async
2. **Config Flow**: UI-based configuration is required
3. **HACS Ready**: Follow all HACS requirements
4. **Type Safe**: Full type hints and mypy compliance
5. **Testable**: Unit tests for all components

---

## Goal
[What integration needs to be built - specific functionality and end state]

## Why
- [User value and use cases]
- [Integration with HA ecosystem]
- [Problems solved]

## What
[Technical requirements and user-facing features]

### Success Criteria
- [ ] Config flow completes without errors
- [ ] Entities created and visible in UI
- [ ] Updates occur at specified intervals
- [ ] Error handling works properly
- [ ] HACS validation passes
- [ ] All tests pass

## All Needed Context

### Documentation & References
```yaml
- url: https://developers.home-assistant.io/docs/
  sections: 
    - /docs/creating_component_index
    - /docs/config_entries_index
    - /docs/entity_index
    
- url: https://www.hacs.xyz/docs/publish/integration/
  why: HACS requirements and validation
  
- file: examples/sensors/simple_sensor.py
  why: Sensor implementation pattern
  
- file: examples/config_flow/simple_flow.py
  why: Config flow pattern
```

### Known Gotchas
```python
# CRITICAL: HA is async-first
# Never use blocking I/O in async functions
# Use hass.async_add_executor_job() for sync code

# CRITICAL: Config entries are immutable
# Use entry.options for user-changeable settings

# CRITICAL: Unique IDs prevent duplicates
# Always set _attr_unique_id in entities
```

## Implementation Blueprint

### Phase 1: Core Structure
```yaml
CREATE custom_components/DOMAIN/__init__.py:
  - Import ConfigEntry, HomeAssistant
  - Define PLATFORMS list
  - Implement async_setup_entry
  - Implement async_unload_entry

CREATE custom_components/DOMAIN/const.py:
  - Define DOMAIN constant
  - Configuration keys
  - Default values
```

### Phase 2: Config Flow
```yaml
CREATE custom_components/DOMAIN/config_flow.py:
  - Inherit from config_entries.ConfigFlow
  - Implement async_step_user
  - Add validation logic
  - Set unique_id
```

### Phase 3: Entity Implementation
```yaml
CREATE custom_components/DOMAIN/sensor.py:
  - Define async_setup_entry
  - Create entity class
  - Implement required properties
  - Add update logic
```

### Phase 4: Translations
```yaml
CREATE custom_components/DOMAIN/translations/en.json:
  - Config flow strings
  - Entity names
  - Error messages
```

## Validation Loop

### Level 1: Syntax
```bash
ruff check custom_components/ --fix
mypy custom_components/ --strict
```

### Level 2: HACS
```bash
hacs validate
python -m script.hassfest
```

### Level 3: Integration Test
```bash
# Start HA
docker-compose up -d

# Check logs
docker-compose logs -f homeassistant

# Test config flow
# Navigate to Settings > Integrations > Add
```

## Final Checklist
- [ ] manifest.json has version
- [ ] Config flow works
- [ ] Entities created
- [ ] Translations present
- [ ] No errors in logs
- [ ] HACS validation passes
- [ ] README complete