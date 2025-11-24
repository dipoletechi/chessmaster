import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlayerStats {
  name: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
}

export interface GameHistory {
  id: string;
  gameName: string;
  player1Name: string;
  player2Name: string;
  mode: 'ai' | 'two-player';
  result: 'white' | 'black' | 'draw' | 'incomplete';
  moves: number;
  date: string;
  pgn?: string;
}

export interface IncompleteGame {
  id: string;
  gameName: string;
  player1Name: string;
  player2Name: string;
  mode: 'ai' | 'two-player';
  fen: string;
  moveHistory: string[];
  currentPlayer?: 'white' | 'black';
  isAITurn?: boolean;
  date: string;
}

const STORAGE_KEYS = {
  PLAYER_STATS: 'player_stats',
  GAME_HISTORY: 'game_history',
  PLAYER1_NAME: 'player1_name',
  GAME_NAME: 'game_name',
  INCOMPLETE_GAME: 'incomplete_game',
};

export const StorageService = {
  // Player Stats
  async getPlayerStats(): Promise<PlayerStats | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting player stats:', error);
      return null;
    }
  },

  async savePlayerStats(stats: PlayerStats): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving player stats:', error);
    }
  },

  async updatePlayerStats(result: 'win' | 'loss' | 'draw', playerName: string): Promise<void> {
    try {
      let stats = await this.getPlayerStats();
      if (!stats || stats.name !== playerName) {
        stats = {
          name: playerName,
          wins: 0,
          losses: 0,
          draws: 0,
          totalGames: 0,
        };
      }

      stats.totalGames++;
      if (result === 'win') stats.wins++;
      else if (result === 'loss') stats.losses++;
      else stats.draws++;

      await this.savePlayerStats(stats);
    } catch (error) {
      console.error('Error updating player stats:', error);
    }
  },

  // Player Name
  async getPlayer1Name(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.PLAYER1_NAME);
    } catch (error) {
      console.error('Error getting player name:', error);
      return null;
    }
  },

  async savePlayer1Name(name: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYER1_NAME, name);
    } catch (error) {
      console.error('Error saving player name:', error);
    }
  },

  // Game Name
  async getGameName(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.GAME_NAME);
    } catch (error) {
      console.error('Error getting game name:', error);
      return null;
    }
  },

  async saveGameName(name: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_NAME, name);
    } catch (error) {
      console.error('Error saving game name:', error);
    }
  },

  // Game History
  async getGameHistory(): Promise<GameHistory[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting game history:', error);
      return [];
    }
  },

  async addGameHistory(game: GameHistory): Promise<void> {
    try {
      const history = await this.getGameHistory();
      history.unshift(game);
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error adding game history:', error);
    }
  },

  async clearGameHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
    } catch (error) {
      console.error('Error clearing game history:', error);
    }
  },

  // Incomplete Game
  async getIncompleteGame(): Promise<IncompleteGame | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INCOMPLETE_GAME);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting incomplete game:', error);
      return null;
    }
  },

  async saveIncompleteGame(game: IncompleteGame): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INCOMPLETE_GAME, JSON.stringify(game));
    } catch (error) {
      console.error('Error saving incomplete game:', error);
    }
  },

  async clearIncompleteGame(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.INCOMPLETE_GAME);
    } catch (error) {
      console.error('Error clearing incomplete game:', error);
    }
  },
};

