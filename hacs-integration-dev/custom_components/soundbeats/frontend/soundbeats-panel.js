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