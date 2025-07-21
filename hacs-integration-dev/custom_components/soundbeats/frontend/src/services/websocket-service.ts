import { HomeAssistant, GameState, Team } from "../types";

export class WebSocketService {
  private hass: HomeAssistant;
  private entryId: string;
  
  constructor(hass: HomeAssistant, entryId: string) {
    this.hass = hass;
    this.entryId = entryId;
  }
  
  async newGame(teamCount: number): Promise<GameState> {
    const response = await this.hass.connection.sendMessagePromise({
      type: "soundbeats/new_game",
      entry_id: this.entryId,
      team_count: teamCount,
    });
    return response;
  }
  
  async getGameState(): Promise<{ state: GameState | null; history: any[] }> {
    const response = await this.hass.connection.sendMessagePromise({
      type: "soundbeats/get_game_state",
      entry_id: this.entryId,
    });
    return response;
  }
  
  async updateTeamName(teamId: string, name: string): Promise<void> {
    await this.hass.connection.sendMessagePromise({
      type: "soundbeats/update_team_name",
      entry_id: this.entryId,
      team_id: teamId,
      name: name,
    });
  }
  
  async addTeam(): Promise<Team> {
    const response = await this.hass.connection.sendMessagePromise({
      type: "soundbeats/add_team",
      entry_id: this.entryId,
    });
    return response.team;
  }
  
  async removeTeam(teamId: string): Promise<void> {
    await this.hass.connection.sendMessagePromise({
      type: "soundbeats/remove_team",
      entry_id: this.entryId,
      team_id: teamId,
    });
  }
  
  subscribeToStateChanges(callback: (state: GameState) => void): () => void {
    const unsubscribe = this.hass.connection.subscribeMessage(
      (msg) => callback(msg.state),
      {
        type: "soundbeats/subscribe_game_state",
        entry_id: this.entryId,
      }
    );
    
    return unsubscribe;
  }
}