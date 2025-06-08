# GitHub Copilot Instructions for Soundbeats Home Assistant Integration

Welcome to the **Soundbeats** Home Assistant party game! This repository contains a custom integration designed to provide a seamless, plug-and-play experience for Home Assistant users, along with a Lovelace card for easy UI interaction. Please follow these instructions to ensure all development aligns with project goals and user expectations.

---

## General Principles

- **Zero-Setup Philosophy**: All features, dependencies, and UI components must be automatically included and configured by the integration. Users should not need to perform manual setup steps beyond installing the integration.
- **Bundled Lovelace Card**: The integration must provide a Lovelace UI card out of the box, so users can add and use the game directly from the Home Assistant dashboard.
- **Cross-Language Support**: Code is a mix of JavaScript (for the frontend) and Python (for the backend integration). Maintain clear interfaces and documentation between these components.
- **User Experience**: Prioritize a fun, intuitive experience. All configuration should be possible via the Home Assistant UI, not YAML or code edits.

---

## Development Guidelines

### 1. Directory Structure

- `custom_components/soundbeats/`: Python backend for Home Assistant integration.
- `soundbeats_lovelace/` or `www/community/soundbeats/`: JavaScript frontend for the Lovelace card.
- `copilot-instructions.md`: (this file) Reference for Copilot and contributors.

### 2. Integration Packaging

- All frontend assets (JS, CSS, images) must be served by the integration or included in the repository.
- Use Home Assistant’s `resources:` to register the Lovelace card automatically if possible.
- Provide manifest and version files as required by Home Assistant custom integrations.

### 3. Lovelace Card

- The card should be pre-configured and discoverable after installation.
- No manual editing of `ui-lovelace.yaml` should be required.
- Support all major themes and mobile responsiveness. The usage will be predominantly on mobile. 

### 4. Setup & Configuration

- Use config flows (`config_flow.py`) for any setup—never require YAML.
- All settings (game options, UI preferences) must be adjustable from Home Assistant’s web UI.
- Use a splash screen to capture all critical input data for the game with appropriate error messsages an explanantions

### 5. Testing

- Provide thorough unit and integration tests for both backend and frontend code.
- Use Home Assistant’s test tools for Python and appropriate frameworks for JS.
### 6. Language Support and Translation Requirements

- **All UI text must be dynamic** and use the translation system - no hardcoded strings allowed.
- **Use translation helpers**: Use `_t('key')` or `_ts('key', substitutions)` for all user-facing text.
- **Maintain dual language support**: All new text must include both English (`en`) and German (`de`) translations.
- **Single source of truth**: Add new translation keys only to `custom_components/soundbeats/www/translations.json` - this is the primary translation file.
- **Minimal fallback**: The embedded fallback in `soundbeats-card.js` contains only critical UI elements and should not be expanded.
- **Follow translation key structure**: Use logical groupings like `ui.*`, `settings.*`, `alerts.*`, `game.*`, `diagnostics.*`, `betting.*`, `defaults.*`, etc.
- **No static text exceptions**: Button labels, error messages, placeholders, default values, and all user-visible content must use translations.

---

## Pull Request Checklist

- [ ] All new features are plug-and-play and require no manual setup.
- [ ] Lovelace card is bundled and auto-registered.
- [ ] Integration and UI are fully documented.
- [ ] No manual configuration (YAML or file edits) is required for users.
- [ ] Tests are updated and passing.
- [ ] **All UI text uses the translation system with `_t()` calls - no hardcoded strings.**
- [ ] **Both English and German translations are provided for all new text.**
- [ ] **Translation keys are added to `translations.json` - the single source of truth for UI text.**

---

## Additional Notes

- Reference Home Assistant developer docs for best practices.
- If adding dependencies, ensure they are handled automatically by the integration.
- Keep code and instructions beginner-friendly where possible.

---

Thank you for contributing to Soundbeats and helping make Home Assistant even more fun!
