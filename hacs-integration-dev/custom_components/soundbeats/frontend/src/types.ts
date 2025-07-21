/**
 * Type definitions for Soundbeats game integration
 */

export interface HomeAssistant {
  connection: {
    sendMessagePromise: (message: any) => Promise<any>;
    subscribeMessage: (
      callback: (message: any) => void,
      subscribeMessage: any
    ) => () => void;
  };
  user?: {
    id: string;
    name: string;
    is_admin: boolean;
  };
  config?: {
    config_entries: Record<string, {
      entry_id: string;
      domain: string;
      title: string;
      data: any;
    }>;
  };
}

export interface GameState {
  game_id: string;
  teams: Team[];
  current_round: number;
  rounds_played: GameRound[];
  playlist_id: string;
  played_song_ids: number[];
  is_active: boolean;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  current_guess?: number;
  has_bet: boolean;
}

export interface GameRound {
  round_number: number;
  song_id: number;
  team_guesses: Record<string, number>;
  team_bets: Record<string, boolean>;
  team_scores: Record<string, number>;
  actual_year: number;
  timestamp: string;
}

export interface GameHistory {
  game_id: string;
  teams: Team[];
  rounds_played: GameRound[];
  created_at: string;
}