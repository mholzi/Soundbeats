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