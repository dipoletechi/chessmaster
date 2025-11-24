import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GameHistory, IncompleteGame, StorageService } from '@/utils/storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [savedGame, setSavedGame] = useState<IncompleteGame | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
      loadSavedGame();
    }, [])
  );

  const loadHistory = async () => {
    const gameHistory = await StorageService.getGameHistory();
    setHistory(gameHistory);
  };

  const loadSavedGame = async () => {
    const incomplete = await StorageService.getIncompleteGame();
    setSavedGame(incomplete);
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all game history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearGameHistory();
            await loadHistory();
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getResultColor = (result: string): string => {
    if (result === 'white') return '#4CAF50';
    if (result === 'black') return '#2196F3';
    if (result === 'incomplete') return '#FF9500';
    return '#FF9800';
  };

  const getResultText = (game: GameHistory): string => {
    if (game.result === 'white') {
      return `${game.player1Name} (White) won`;
    } else if (game.result === 'black') {
      return game.mode === 'ai'
        ? 'AI (Black) won'
        : `${game.player2Name} (Black) won`;
    } else if (game.result === 'incomplete') {
      return 'In Progress';
    }
    return 'Draw';
  };

  const handleResumeGame = async (game: IncompleteGame) => {
    if (game.mode === 'two-player') {
      router.push({
        pathname: '/game-two-player',
        params: {
          player1Name: game.player1Name,
          player2Name: game.player2Name,
          gameName: game.gameName,
          resume: 'true',
        },
      });
    } else if (game.mode === 'ai') {
      router.push({
        pathname: '/game-ai',
        params: {
          player1Name: game.player1Name,
          gameName: game.gameName,
          resume: 'true',
        },
      });
    }
  };

  const handleDeleteSavedGame = async () => {
    Alert.alert('Delete Saved Game', 'Are you sure you want to delete the saved game?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await StorageService.clearIncompleteGame();
          setSavedGame(null);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.backgroundGradient}>
        <ThemedView style={styles.content}>
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={styles.title}>
              📜 GAME HISTORY
            </ThemedText>
            <View style={styles.titleUnderline} />
          </View>

        {savedGame && (
          <ThemedView style={styles.savedGameCard}>
            <ThemedText type="subtitle" style={styles.savedGameTitle}>
              💾 {savedGame.gameName} (Saved)
            </ThemedText>
            <ThemedText style={styles.gameInfo}>
              {savedGame.player1Name} vs {savedGame.mode === 'ai' ? 'AI' : savedGame.player2Name}
            </ThemedText>
            <ThemedText style={styles.gameInfo}>
              Mode: {savedGame.mode === 'ai' ? 'AI' : 'Two Player'}
            </ThemedText>
            <ThemedText style={[styles.result, { color: '#FF9500' }]}>
              Status: In Progress
            </ThemedText>
            <ThemedText style={styles.gameInfo}>
              Moves: {savedGame.moveHistory.length} | {formatDate(savedGame.date)}
            </ThemedText>
            <View style={styles.savedGameActions}>
              <TouchableOpacity
                style={[styles.button, styles.resumeButton]}
                onPress={() => handleResumeGame(savedGame)}
                activeOpacity={0.8}>
                <View style={styles.buttonInner}>
                  <ThemedText style={styles.buttonText}>▶️ Resume</ThemedText>
                </View>
                <View style={styles.buttonShadow} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDeleteSavedGame}
                activeOpacity={0.8}>
                <View style={styles.buttonInner}>
                  <ThemedText style={styles.buttonText}>🗑️ Delete</ThemedText>
                </View>
                <View style={styles.buttonShadow} />
              </TouchableOpacity>
            </View>
          </ThemedView>
        )}

        {history.length === 0 && !savedGame ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No games played yet</ThemedText>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.8}>
              <View style={styles.buttonInner}>
                <ThemedText style={styles.buttonText}>🎮 Start a Game</ThemedText>
              </View>
              <View style={styles.buttonShadow} />
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClearHistory}
              activeOpacity={0.8}>
              <View style={[styles.buttonInner, styles.clearButtonInner]}>
                <ThemedText style={styles.buttonText}>🗑️ Clear History</ThemedText>
              </View>
              <View style={[styles.buttonShadow, styles.clearButtonShadow]} />
            </TouchableOpacity>

            {history.map((game) => (
              <ThemedView key={game.id} style={styles.gameCard}>
                <ThemedText type="subtitle" style={styles.gameName}>
                  {game.gameName}
                </ThemedText>
                <ThemedText style={styles.gameInfo}>
                  {game.player1Name} vs {game.mode === 'ai' ? 'AI' : game.player2Name}
                </ThemedText>
                <ThemedText style={styles.gameInfo}>
                  Mode: {game.mode === 'ai' ? 'AI' : 'Two Player'}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.result,
                    { color: getResultColor(game.result) },
                  ]}>
                  Result: {getResultText(game)}
                </ThemedText>
                <ThemedText style={styles.gameInfo}>
                  Moves: {game.moves} | {formatDate(game.date)}
                </ThemedText>
              </ThemedView>
            ))}
          </>
        )}

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}
          activeOpacity={0.8}>
          <View style={[styles.buttonInner, styles.backButtonInner]}>
            <ThemedText style={styles.buttonText}>← Back</ThemedText>
          </View>
          <View style={[styles.buttonShadow, styles.backButtonShadow]} />
        </TouchableOpacity>
      </ThemedView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    textAlign: 'center',
    color: '#fff',
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 2,
    marginBottom: 8,
  },
  titleUnderline: {
    width: 140,
    height: 4,
    backgroundColor: '#00d4ff',
    borderRadius: 2,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    opacity: 0.8,
  },
  gameCard: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gameName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#00d4ff',
  },
  gameInfo: {
    fontSize: 14,
    color: '#aaa',
    opacity: 0.9,
  },
  result: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  button: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'visible',
    marginTop: 10,
  },
  buttonInner: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00a8ff',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ translateY: -2 }],
  },
  buttonShadow: {
    position: 'absolute',
    bottom: -4,
    left: 4,
    right: -4,
    height: '100%',
    backgroundColor: '#0056b3',
    borderRadius: 16,
    zIndex: -1,
    opacity: 0.6,
  },
  clearButton: {
    marginBottom: 20,
  },
  clearButtonInner: {
    backgroundColor: '#FF3B30',
    borderColor: '#ff6b6b',
  },
  clearButtonShadow: {
    backgroundColor: '#cc2e24',
  },
  backButton: {
    marginTop: 20,
  },
  backButtonInner: {
    backgroundColor: '#34C759',
    borderColor: '#4ade80',
  },
  backButtonShadow: {
    backgroundColor: '#22c55e',
  },
  savedGameCard: {
    backgroundColor: '#2a1a0e',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    gap: 10,
    borderWidth: 2,
    borderColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  savedGameTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FF9500',
  },
  savedGameActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  resumeButton: {
    flex: 1,
    marginTop: 0,
  },
  deleteButton: {
    flex: 1,
    marginTop: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});


