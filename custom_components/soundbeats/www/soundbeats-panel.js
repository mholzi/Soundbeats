import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit@2.8.0/index.js?module";

class SoundbeatsPanelView extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        height: 100vh;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-family: var(--paper-font-body1_-_font-family);
        -webkit-font-smoothing: antialiased;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
      }

      .panel-header {
        background: var(--app-header-background-color);
        color: var(--app-header-text-color);
        padding: 16px 24px;
        border-bottom: 1px solid var(--divider-color);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .panel-title {
        font-size: 24px;
        font-weight: 500;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .panel-icon {
        width: 32px;
        height: 32px;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
      }

      .panel-content {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
        height: calc(100vh - 80px);
        overflow-y: auto;
      }

      .welcome-message {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 24px;
        border-left: 4px solid var(--primary-color);
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      }

      .welcome-title {
        font-size: 20px;
        font-weight: 500;
        margin: 0 0 8px 0;
        color: var(--primary-color);
      }

      .welcome-description {
        color: var(--secondary-text-color);
        line-height: 1.5;
        margin: 0;
      }

      .soundbeats-card-container {
        background: var(--card-background-color);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      soundbeats-card {
        display: block;
        width: 100%;
      }

      @media (max-width: 768px) {
        .panel-content {
          padding: 16px;
        }
        
        .panel-header {
          padding: 12px 16px;
        }
        
        .panel-title {
          font-size: 20px;
        }
      }
    `;
  }

  render() {
    return html`
      <div class="panel-header">
        <h1 class="panel-title">
          <div class="panel-icon">🎵</div>
          Soundbeats Dashboard
        </h1>
      </div>

      <div class="panel-content">
        <div class="welcome-message">
          <h2 class="welcome-title">Welcome to Soundbeats!</h2>
          <p class="welcome-description">
            Your automated music trivia dashboard is ready! Create teams, configure your audio setup, 
            and start an epic music guessing battle. Everything you need is right here in this dedicated dashboard.
          </p>
        </div>

        <div class="soundbeats-card-container">
          <soundbeats-card .hass=${this.hass}></soundbeats-card>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    // Load the Soundbeats card component
    import("/soundbeats_frontend_assets/soundbeats-card.js").then(() => {
      // Card will be automatically initialized when the import completes
      const card = this.shadowRoot.querySelector('soundbeats-card');
      if (card) {
        card.setConfig({});
      }
    }).catch(error => {
      console.error('Failed to load Soundbeats card:', error);
    });
  }
}

customElements.define("soundbeats-panel-view", SoundbeatsPanelView);