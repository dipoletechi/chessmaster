import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlayerStats, StorageService } from '@/utils/storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function StatsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const playerStats = await StorageService.getPlayerStats();
    setStats(playerStats);
  };

  const winRate = stats
    ? stats.totalGames > 0
      ? ((stats.wins / stats.totalGames) * 100).toFixed(1)
      : '0.0'
    : '0.0';

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Statistics
        </ThemedText>

        {!stats ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No statistics available</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Play some games to see your stats!
            </ThemedText>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/(tabs)')}>
              <ThemedText style={styles.buttonText}>Start a Game</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView style={styles.statsContainer}>
            <ThemedView style={styles.statCard}>
              <ThemedText type="subtitle" style={styles.playerName}>
                {stats.name}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statLabel}>Total Games</ThemedText>
              <ThemedText style={styles.statValue}>{stats.totalGames}</ThemedText>
            </ThemedView>

            <ThemedView style={[styles.statCard, styles.winCard]}>
              <ThemedText style={styles.statLabel}>Wins</ThemedText>
              <ThemedText style={[styles.statValue, styles.winValue]}>
                {stats.wins}
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.statCard, styles.lossCard]}>
              <ThemedText style={styles.statLabel}>Losses</ThemedText>
              <ThemedText style={[styles.statValue, styles.lossValue]}>
                {stats.losses}
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.statCard, styles.drawCard]}>
              <ThemedText style={styles.statLabel}>Draws</ThemedText>
              <ThemedText style={[styles.statValue, styles.drawValue]}>
                {stats.draws}
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.statCard, styles.winRateCard]}>
              <ThemedText style={styles.statLabel}>Win Rate</ThemedText>
              <ThemedText style={[styles.statValue, styles.winRateValue]}>
                {winRate}%
              </ThemedText>
            </ThemedView>

            <View style={styles.progressContainer}>
              <ThemedText style={styles.progressLabel}>Win/Loss/Draw Distribution</ThemedText>
              <View style={styles.progressBar}>
                {stats.totalGames > 0 && (
                  <>
                    <View
                      style={[
                        styles.progressSegment,
                        styles.winSegment,
                        {
                          flex: stats.wins,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.progressSegment,
                        styles.lossSegment,
                        {
                          flex: stats.losses,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.progressSegment,
                        styles.drawSegment,
                        {
                          flex: stats.draws,
                        },
                      ]}
                    />
                  </>
                )}
              </View>
            </View>
          </ThemedView>
        )}

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}>
          <ThemedText style={styles.buttonText}>Back</ThemedText>
        </TouchableOpacity>
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
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
  statsContainer: {
    gap: 16,
  },
  statCard: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  winCard: {
    backgroundColor: '#E8F5E9',
  },
  winValue: {
    color: '#4CAF50',
  },
  lossCard: {
    backgroundColor: '#FFEBEE',
  },
  lossValue: {
    color: '#F44336',
  },
  drawCard: {
    backgroundColor: '#FFF3E0',
  },
  drawValue: {
    color: '#FF9800',
  },
  winRateCard: {
    backgroundColor: '#E3F2FD',
  },
  winRateValue: {
    color: '#2196F3',
  },
  progressContainer: {
    marginTop: 20,
    gap: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    flexDirection: 'row',
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  progressSegment: {
    height: '100%',
  },
  winSegment: {
    backgroundColor: '#4CAF50',
  },
  lossSegment: {
    backgroundColor: '#F44336',
  },
  drawSegment: {
    backgroundColor: '#FF9800',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


