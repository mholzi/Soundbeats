import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { WebSocketService } from "../services/websocket-service";
import { GameState, Team, HomeAssistant } from "../types";

@customElement("soundbeats-game-setup")
export class SoundbeatsGameSetup extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property() entryId!: string;
  
  @state() private gameState?: GameState;
  @state() private loading = false;
  
  private wsService?: WebSocketService;
  private unsubscribe?: () => void;
  
  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    
    .team-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 24px 0;
    }
    
    .team-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: var(--card-background-color);
    }
    
    .team-icon {
      font-size: 24px;
      color: var(--primary-text-color);
    }
    
    .team-name {
      flex: 1;
      font-size: 18px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      outline: none;
      padding: 8px;
    }
    
    .team-name:focus {
      border-bottom: 2px solid var(--primary-color);
    }
    
    .controls {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
    }
    
    mwc-button {
      --mdc-theme-primary: var(--primary-color);
    }
    
    mwc-icon-button {
      --mdc-icon-button-size: 40px;
    }
    
    ha-circular-progress {
      display: block;
      margin: 0 auto;
    }
    
    ha-card {
      max-width: 800px;
      margin: 0 auto;
    }
    
    @media (max-width: 600px) {
      .controls {
        flex-direction: column;
      }
    }
  `;
  
  connectedCallback() {
    super.connectedCallback();
    this.wsService = new WebSocketService(this.hass, this.entryId);
    this.loadGameState();
    
    // Subscribe to state changes
    this.unsubscribe = this.wsService.subscribeToStateChanges((state) => {
      this.gameState = state;
    });
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  
  private async loadGameState() {
    this.loading = true;
    try {
      const { state } = await this.wsService!.getGameState();
      this.gameState = state || undefined;
    } catch (err) {
      console.error("Failed to load game state:", err);
    } finally {
      this.loading = false;
    }
  }
  
  private async createNewGame() {
    this.loading = true;
    try {
      const teamCount = this.gameState?.teams.length || 2;
      await this.wsService!.newGame(teamCount);
    } catch (err) {
      console.error("Failed to create game:", err);
    } finally {
      this.loading = false;
    }
  }
  
  private async updateTeamName(team: Team, event: Event) {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    
    if (newName !== team.name) {
      try {
        await this.wsService!.updateTeamName(team.id, newName);
      } catch (err) {
        console.error("Failed to update team name:", err);
        // Revert on error
        input.value = team.name;
      }
    }
  }
  
  private async addTeam() {
    if (this.gameState && this.gameState.teams.length < 5) {
      try {
        await this.wsService!.addTeam();
      } catch (err) {
        console.error("Failed to add team:", err);
      }
    }
  }
  
  private async removeTeam(teamId: string) {
    if (this.gameState && this.gameState.teams.length > 1) {
      try {
        await this.wsService!.removeTeam(teamId);
      } catch (err) {
        console.error("Failed to remove team:", err);
      }
    }
  }
  
  render() {
    if (this.loading) {
      return html`<ha-circular-progress active></ha-circular-progress>`;
    }
    
    if (!this.gameState) {
      return html`
        <ha-card>
          <div class="card-content">
            <h2>Welcome to Soundbeats!</h2>
            <p>Create a new game to get started.</p>
            <div class="controls">
              <mwc-button raised @click=${this.createNewGame}>
                Create New Game
              </mwc-button>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    return html`
      <ha-card>
        <div class="card-content">
          <h2>Game Setup</h2>
          
          <div class="team-list">
            ${this.gameState.teams.map(team => html`
              <div class="team-item">
                <ha-icon class="team-icon" icon="mdi:account-group"></ha-icon>
                <input
                  class="team-name"
                  type="text"
                  .value=${team.name}
                  @blur=${(e: Event) => this.updateTeamName(team, e)}
                  @keyup=${(e: KeyboardEvent) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                />
                ${this.gameState!.teams.length > 1 ? html`
                  <mwc-icon-button
                    icon="mdi:delete"
                    @click=${() => this.removeTeam(team.id)}
                  ></mwc-icon-button>
                ` : ''}
              </div>
            `)}
          </div>
          
          <div class="controls">
            ${this.gameState.teams.length < 5 ? html`
              <mwc-button outlined @click=${this.addTeam}>
                Add Team
              </mwc-button>
            ` : ''}
            
            <mwc-button raised>
              Start Game
            </mwc-button>
          </div>
        </div>
      </ha-card>
    `;
  }
}