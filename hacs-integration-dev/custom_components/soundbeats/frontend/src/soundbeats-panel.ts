import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './components/game-setup'
import { HomeAssistant } from './types'

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
  @property({ attribute: false }) public hass!: HomeAssistant
  @property({ type: Boolean }) narrow = false
  @property({ attribute: false }) panel: any
  
  private get entryId(): string {
    // Get entry ID from first config entry for the soundbeats domain
    const entries = Object.keys(this.hass?.config?.config_entries || {})
      .map(id => this.hass.config.config_entries[id])
      .filter(entry => entry.domain === 'soundbeats')
    
    return entries[0]?.entry_id || ''
  }

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
          type: 'ping',
        })
        console.log('WebSocket test successful:', result)
      } catch (error) {
        console.error('WebSocket test failed:', error)
      }
    }
  }

  render() {
    if (!this.entryId) {
      return html`
        <div class="container">
          <div class="header">
            <div class="logo">🎵</div>
            <h1>Soundbeats Game</h1>
            <div class="status">Loading configuration...</div>
          </div>
        </div>
      `
    }
    
    return html`
      <div class="container">
        <div class="header">
          <div class="logo">🎵</div>
          <h1>Soundbeats Game</h1>
        </div>

        <soundbeats-game-setup
          .hass=${this.hass}
          .entryId=${this.entryId}
        ></soundbeats-game-setup>
      </div>
    `
  }
}

// Register card for custom cards if needed
window.customCards = window.customCards || []
window.customCards.push({
  type: 'soundbeats-panel',
  name: 'Soundbeats Panel',
  description: 'Music trivia game panel for Home Assistant',
})
