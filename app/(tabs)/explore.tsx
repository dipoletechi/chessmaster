import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GameHistory, StorageService } from '@/utils/storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<GameHistory[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const gameHistory = await StorageService.getGameHistory();
    setHistory(gameHistory);
  };

  const handleClearHistory = () => {
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
            setHistory([]);
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
    return '#FF9800';
  };

  const getResultText = (game: GameHistory): string => {
    if (game.result === 'white') {
      return `${game.player1Name} (White) won`;
    } else if (game.result === 'black') {
      return game.mode === 'ai'
        ? 'AI (Black) won'
        : `${game.player2Name} (Black) won`;
    }
    return 'Draw';
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Game History
        </ThemedText>

        {history.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No games played yet</ThemedText>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/(tabs)')}>
              <ThemedText style={styles.buttonText}>Start a Game</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClearHistory}>
              <ThemedText style={styles.buttonText}>Clear History</ThemedText>
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
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 20,
  },
  emptyText: {
    fontSize: 18,
    opacity: 0.6,
  },
  gameCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  gameName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameInfo: {
    fontSize: 14,
    opacity: 0.7,
  },
  result: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
