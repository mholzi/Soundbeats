# Phase 2: Basic Frontend Framework - Requirements Document

**Generated**: 2025-01-21 21:22:53  
**Certainty Score**: 11/12 ✅

## Problem Statement

The Soundbeats HACS integration currently uses CDN imports for frontend dependencies, which is not suitable for production. We need to implement a proper frontend build system to enable sustainable development for future phases.

## Current State Analysis

### What's Already Complete:
- ✅ Basic Lit Element panel component (using CDN imports)
- ✅ Home Assistant styling integration with CSS variables
- ✅ Static file serving via `/soundbeats_static` path
- ✅ Responsive layout with mobile breakpoints
- ✅ Phase 1 fully complete (panel registration, HACS compliance)

### What's Missing:
- ❌ No package.json or node modules setup
- ❌ No build configuration (webpack/vite)
- ❌ Dependencies loaded from CDN instead of bundled
- ❌ No development workflow with hot reload
- ❌ No code quality tools (linting, formatting)

## Detailed Requirements

### 1. Build System Setup

**Technology Choice**: Vite
- Modern build tool with native ES modules support
- Faster than webpack with simpler configuration
- Built-in hot module replacement (HMR)
- Excellent Lit framework support

**Configuration Requirements**:
```javascript
// vite.config.js structure
- Entry point: frontend/soundbeats-panel.js
- Output directory: frontend/dist/
- Build formats: ES modules for modern browsers
- External dependencies: None (bundle everything)
```

### 2. Package Structure

**Directory Layout**:
```
custom_components/soundbeats/
├── frontend/
│   ├── src/
│   │   └── soundbeats-panel.js (moved from frontend/)
│   ├── dist/           (generated, git-ignored)
│   ├── index.html      (existing)
│   ├── package.json    (new)
│   ├── vite.config.js  (new)
│   ├── .eslintrc.js    (new)
│   └── .prettierrc     (new)
```

**Dependencies**:
- Production: `lit`, `@lit/reactive-element`
- Development: `vite`, `eslint`, `prettier`, `eslint-config-prettier`

### 3. Build Scripts

**package.json scripts**:
- `dev`: Start Vite dev server with HMR
- `build`: Production build (minified, optimized)
- `preview`: Preview production build
- `lint`: Run ESLint on source files
- `format`: Run Prettier formatting

### 4. Code Quality Tools

**ESLint Configuration**:
- Extend recommended rules
- Focus on error prevention, not style
- Compatible with Prettier
- Support for Lit decorators

**Prettier Configuration**:
- 2-space indentation
- Single quotes
- No semicolons (align with Python style)
- 100 character line width

### 5. Development Workflow

**Hot Module Replacement**:
- Changes reflect instantly without page reload
- Preserve component state during development
- Fast refresh for rapid iteration

**Build Outputs**:
- Development: Unminified with source maps
- Production: Minified, tree-shaken, < 200KB

### 6. Migration Tasks

1. Move `soundbeats-panel.js` to `frontend/src/`
2. Convert CDN imports to npm imports:
   ```javascript
   // Before (CDN)
   import { LitElement, html, css } from 'https://unpkg.com/lit@2.7.5/index.js?module'
   
   // After (npm)
   import { LitElement, html, css } from 'lit'
   ```
3. Update static file serving to use built files
4. Update `panel.py` to reference new build output

## Technical Constraints

1. **Browser Support**: Modern browsers only (Chrome/Edge 90+, Firefox 88+, Safari 14+)
2. **Node.js**: Requires v16+ for build tools
3. **Bundle Size**: Target < 200KB for initial load
4. **Build Time**: Production build should complete in < 30 seconds
5. **Integration**: Must work with existing HA static file serving

## Success Criteria

1. ✅ Frontend builds successfully with `npm run build`
2. ✅ Development server runs with `npm run dev` 
3. ✅ HMR works - changes appear without page reload
4. ✅ Production bundle is < 200KB
5. ✅ ESLint and Prettier run without errors
6. ✅ Panel loads correctly in Home Assistant after build
7. ✅ No console errors in browser
8. ✅ Maintains existing responsive design

## Testing Plan

1. **Build Verification**:
   ```bash
   cd custom_components/soundbeats/frontend
   npm install
   npm run build
   ls -lh dist/  # Verify output size
   ```

2. **Development Workflow**:
   - Start dev server: `npm run dev`
   - Make code change
   - Verify HMR updates without reload

3. **Integration Test**:
   - Build production bundle
   - Restart Home Assistant
   - Navigate to Soundbeats panel
   - Verify functionality matches current behavior

4. **Code Quality**:
   ```bash
   npm run lint    # Should pass
   npm run format  # Should format consistently
   ```

## Implementation Notes

- Start with JavaScript, consider TypeScript migration in Phase 4-5
- Use Vite's built-in optimizations for Lit
- Commit package-lock.json for reproducible builds
- Add dist/ to .gitignore
- Document build process in README

## Dependencies on Previous Phases

- Phase 1: ✅ Complete - Panel registration and basic structure working

## Risk Mitigation

- **Risk**: Build complexity slows development
  - **Mitigation**: Vite's zero-config approach minimizes setup
  
- **Risk**: Breaking existing functionality
  - **Mitigation**: Incremental migration, test at each step

- **Risk**: Corporate firewall blocks npm
  - **Mitigation**: Document proxy configuration, provide offline instructions

## Future Considerations

This build system will enable:
- Phase 3: Complex state management with proper modules
- Phase 4: External API integrations 
- Phase 5-10: UI component library growth
- Future: TypeScript migration path

---

**Certainty Assessment Summary**:
- Clear technical requirements ✅
- Specific tool choices made ✅
- Success criteria defined ✅
- Migration path outlined ✅
- Only minor gap in UI/UX criteria (not applicable for build system)

This requirements document is ready for PRP generation.