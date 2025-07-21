# PRP: Phase 2 - Basic Frontend Framework Build System

**Generated**: 2025-01-21  
**Source Requirements**: requirements/phase-2-frontend-build-system-20250721_212253.md  
**Confidence Level**: 9/10

## 🎯 Implementation Goal

Set up a modern frontend build system using Vite for the Soundbeats HACS integration, replacing CDN imports with a proper bundled solution while maintaining all current functionality.

## 📚 Required Context & Documentation

### Critical References
1. **Vite Documentation**: https://vitejs.dev/config/
   - Section: Library Mode - for building web components
   - Section: Build Options - for output configuration

2. **Lit Element with Vite**: https://lit.dev/docs/tools/development/#vite
   - Building web components with Vite
   - TypeScript configuration for Lit

3. **Home Assistant Frontend Development**: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-panel/
   - Custom panel requirements
   - Module loading patterns

4. **Current Implementation Files**:
   - `custom_components/soundbeats/__init__.py` - Static path registration (lines 26-30)
   - `custom_components/soundbeats/frontend/soundbeats-panel.js` - Component to migrate
   - `custom_components/soundbeats/frontend/index.html` - Entry point

### Known Patterns & Gotchas

1. **Static File Serving**: Currently using `/soundbeats_static` path mapping
2. **Panel Registration**: Using `js_url` in panel config pointing to JavaScript file
3. **CDN Import**: Currently imports Lit from `https://unpkg.com/lit@3/index.js?module`
4. **Bundle Requirements**: Must be self-contained with all dependencies
5. **HACS Compliance**: Built files must be committed to repository

## 🏗️ Implementation Blueprint

### Directory Structure After Implementation
```
custom_components/soundbeats/
├── frontend/
│   ├── dist/                 # Built files (git tracked)
│   │   └── soundbeats-panel.js
│   ├── src/                  # Source files
│   │   └── soundbeats-panel.ts
│   ├── index.html           # Keep existing
│   ├── package.json         # New
│   ├── package-lock.json    # New (git tracked)
│   ├── vite.config.js       # New
│   ├── tsconfig.json        # New
│   ├── .eslintrc.js         # New
│   └── .prettierrc          # New
```

### Implementation Tasks (In Order)

#### Task 1: Initialize Node.js Project
```bash
cd custom_components/soundbeats/frontend
npm init -y

# Update package.json with proper details
# Install dependencies
npm install --save-dev vite @vitejs/plugin-legacy typescript
npm install lit @lit/reactive-element
npm install --save-dev @types/node eslint prettier eslint-config-prettier

# Create package.json scripts
```

**package.json** structure:
```json
{
  "name": "soundbeats-frontend",
  "version": "1.0.0",
  "description": "Frontend for Soundbeats Home Assistant integration",
  "type": "module",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-legacy": "^5.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "eslint-config-prettier": "^9.0.0"
  },
  "dependencies": {
    "lit": "^3.0.0",
    "@lit/reactive-element": "^2.0.0"
  }
}
```

#### Task 2: Configure Vite
Create `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/soundbeats-panel.ts',
      formats: ['es'],
      fileName: () => 'soundbeats-panel.js'
    },
    rollupOptions: {
      external: [],  // Bundle everything including Lit
    },
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2015'
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
})
```

#### Task 3: Configure TypeScript
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "declaration": false,
    "sourceMap": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

#### Task 4: Configure Code Quality Tools
Create `.eslintrc.js`:
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'error',
    'no-console': 'warn'
  }
}
```

Create `.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

#### Task 5: Migrate Component to TypeScript
Create `frontend/src/` directory and move component:
```bash
mkdir -p src
# Create TypeScript version of the component
```

Create `src/soundbeats-panel.ts`:
```typescript
import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

declare global {
  interface Window {
    customCards: any[]
  }
  interface HTMLElementTagNameMap {
    'soundbeats-panel': SoundbeatsPanel
  }
}

@customElement('soundbeats-panel')
export class SoundbeatsPanel extends LitElement {
  @property({ attribute: false }) public hass!: any

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      background: var(--lovelace-background, var(--primary-background-color));
    }
    
    .container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .logo {
      font-size: 72px;
      margin-bottom: 16px;
    }
    
    h1 {
      color: var(--primary-text-color);
      font-size: 2.5em;
      margin: 0;
    }
    
    .status {
      color: var(--secondary-text-color);
      margin-top: 16px;
      font-size: 1.2em;
    }
    
    .content {
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow);
      padding: 24px;
      margin-top: 24px;
    }
    
    @media (max-width: 600px) {
      .container {
        padding: 8px;
      }
      
      h1 {
        font-size: 1.8em;
      }
      
      .logo {
        font-size: 48px;
      }
    }
  `

  connectedCallback(): void {
    super.connectedCallback()
    console.log('Soundbeats panel connected')
    this._testWebSocketConnection()
  }

  private async _testWebSocketConnection(): Promise<void> {
    if (this.hass?.connection) {
      try {
        const result = await this.hass.connection.sendMessagePromise({
          type: 'ping'
        })
        console.log('WebSocket test successful:', result)
      } catch (error) {
        console.error('WebSocket test failed:', error)
      }
    }
  }

  render() {
    return html`
      <div class="container">
        <div class="header">
          <div class="logo">🎵</div>
          <h1>Soundbeats Game</h1>
          <div class="status">Ready to play music trivia!</div>
        </div>
        
        <div class="content">
          <p>Welcome to Soundbeats - The ultimate music guessing game for Home Assistant!</p>
          <p>Phase 1 implementation complete. Game features coming soon...</p>
        </div>
      </div>
    `
  }
}

// Register card for custom cards if needed
window.customCards = window.customCards || []
window.customCards.push({
  type: 'soundbeats-panel',
  name: 'Soundbeats Panel',
  description: 'Music trivia game panel for Home Assistant'
})
```

#### Task 6: Update Static Path Registration
Update `__init__.py` to serve both src and dist:
```python
# In async_setup_entry function, update the static path registration:
await hass.http.async_register_static_paths(
    "/soundbeats_static",
    hass.config.path(f"custom_components/{DOMAIN}/frontend/dist"),
    cache_headers=False,
)
```

Update panel registration to use built file:
```python
config={
    "_panel_custom": {
        "name": "soundbeats-frontend",
        "embed_iframe": True,
        "trust_external": False,
        "js_url": "/soundbeats_static/soundbeats-panel.js",  # Points to dist/
    }
},
```

#### Task 7: Build and Test
```bash
# Build the frontend
npm run build

# Verify output
ls -lh dist/
# Should show soundbeats-panel.js and soundbeats-panel.js.map
```

#### Task 8: Update .gitignore
Add to `.gitignore`:
```
node_modules/
*.log
.DS_Store
```

Note: Do NOT ignore `dist/` as HACS requires built files in repository.

## ✅ Validation Gates

### Level 1: Syntax & Style Validation
```bash
cd custom_components/soundbeats/frontend

# TypeScript compilation check
npx tsc --noEmit

# ESLint check
npm run lint

# Prettier check
npx prettier --check src/**/*.ts

# Expected: All pass without errors
```

### Level 2: Build Validation
```bash
# Clean and rebuild
rm -rf dist/
npm run build

# Check output size
ls -lh dist/soundbeats-panel.js
# Expected: File exists, size < 200KB

# Verify source map
ls dist/soundbeats-panel.js.map
# Expected: Source map file exists
```

### Level 3: Integration Testing
```bash
# Copy to test environment if using Docker
docker cp custom_components/soundbeats homeassistant:/config/custom_components/

# Restart Home Assistant
docker restart homeassistant

# Check logs for errors
docker logs homeassistant 2>&1 | grep -i soundbeats
# Expected: No errors, panel loads successfully

# Manual verification:
# 1. Open Home Assistant UI
# 2. Click Soundbeats in sidebar
# 3. Verify panel loads without console errors
# 4. Check Network tab - soundbeats-panel.js should load from /soundbeats_static/
```

### Level 4: Development Workflow Test
```bash
# Start development build with watch
npm run dev

# Make a small change to src/soundbeats-panel.ts (e.g., change status text)
# Save file

# Verify dist/soundbeats-panel.js was updated
# Refresh browser and verify change appears

# Expected: Changes reflect after browser refresh
```

## 🎯 Success Criteria Checklist
- [ ] Frontend builds successfully with `npm run build`
- [ ] TypeScript compilation has no errors
- [ ] Bundle size is under 200KB
- [ ] ESLint and Prettier pass without errors
- [ ] Panel loads in Home Assistant without console errors
- [ ] Development workflow with watch mode functions
- [ ] All Lit functionality works (no CDN dependency)
- [ ] Source maps work for debugging

## ⚠️ Common Issues & Solutions

1. **Module not found errors**: Ensure all imports use `.js` extension in TypeScript
2. **Panel doesn't load**: Check browser console and verify path in Network tab
3. **Cache issues**: Clear browser cache or use incognito mode for testing
4. **Build fails**: Delete node_modules and package-lock.json, then `npm install`

## 📝 Post-Implementation Notes

After successful implementation:
1. Update README.md with build instructions
2. Commit both source and dist files for HACS
3. Document the development workflow for contributors
4. Consider adding GitHub Actions for automated builds

**Confidence Score: 9/10**
- High confidence due to clear migration path
- Slight uncertainty only around specific Vite configurations for web components
- All patterns well documented and tested