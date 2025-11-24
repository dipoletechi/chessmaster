import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StorageService } from '@/utils/storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ImageBackground, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';


export default function HomeScreen() {
  const router = useRouter();
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [gameName, setGameName] = useState('');
  const [selectedMode, setSelectedMode] = useState<'ai' | 'two-player' | null>(null);

  useEffect(() => {
    loadDefaults();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Clear fields when screen is focused
      setPlayer1Name('');
      setPlayer2Name('');
      setGameName('');
      setSelectedMode(null);
    }, [])
  );

  const loadDefaults = async () => {
    // Don't auto-load names - let user enter fresh each time
  };

  const handleSelectMode = (mode: 'ai' | 'two-player') => {
    setSelectedMode(mode);
  };

  const handleStartAIGame = async () => {
    if (!player1Name.trim()) {
      Alert.alert('Error', 'Please enter Player 1 name');
      return;
    }
    if (!gameName.trim()) {
      Alert.alert('Error', 'Please enter a game name');
      return;
    }

    // Clear any saved game when starting new game
    await StorageService.clearIncompleteGame();

    await StorageService.savePlayer1Name(player1Name.trim());
    await StorageService.saveGameName(gameName.trim());
    router.push({
      pathname: '/game-ai',
      params: {
        player1Name: player1Name.trim(),
        gameName: gameName.trim(),
      },
    });
  };

  const handleStartTwoPlayerGame = async () => {
    if (!player1Name.trim()) {
      Alert.alert('Error', 'Please enter Player 1 name');
      return;
    }
    if (!player2Name.trim()) {
      Alert.alert('Error', 'Please enter Player 2 name');
      return;
    }
    if (!gameName.trim()) {
      Alert.alert('Error', 'Please enter a game name');
      return;
    }

    // Clear any saved game when starting new game
    await StorageService.clearIncompleteGame();

    await StorageService.savePlayer1Name(player1Name.trim());
    await StorageService.saveGameName(gameName.trim());
    router.push({
      pathname: '/game-two-player',
      params: {
        player1Name: player1Name.trim(),
        player2Name: player2Name.trim(),
        gameName: gameName.trim(),
      },
    });
  };

  const handleBack = () => {
    setSelectedMode(null);
    setPlayer1Name('');
    setPlayer2Name('');
    setGameName('');
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('@/assets/images/chess-background.png')} 
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover">
        <View style={styles.backgroundOverlay}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={styles.title}>
              ♟️ CHESS MASTER
            </ThemedText>
            <View style={styles.titleUnderline} />
          </View>

          {!selectedMode ? (
            // Initial screen - Show only buttons
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={() => handleSelectMode('ai')}
                activeOpacity={0.8}>
                <View style={styles.buttonInner}>
                  <ThemedText style={styles.buttonText}>🤖 Play vs AI</ThemedText>
                </View>
                <View style={styles.buttonShadow} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={() => handleSelectMode('two-player')}
                activeOpacity={0.8}>
                <View style={styles.buttonInner}>
                  <ThemedText style={styles.buttonText}>👥 Two Player</ThemedText>
                </View>
                <View style={styles.buttonShadow} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => router.push('/history')}
                activeOpacity={0.8}>
                <View style={[styles.buttonInner, styles.secondaryButtonInner]}>
                  <ThemedText style={styles.buttonText}>📜 Game History</ThemedText>
                </View>
                <View style={[styles.buttonShadow, styles.secondaryButtonShadow]} />
              </TouchableOpacity>
            </View>
          ) : (
            // Game mode selected - Show input fields
            <>
              <View style={styles.cardContainer}>
                <ThemedView style={styles.inputCard}>
                  <ThemedText type="subtitle" style={styles.label}>Player 1 Name *</ThemedText>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={player1Name}
                      onChangeText={setPlayer1Name}
                      placeholder="Enter Player 1 name"
                      placeholderTextColor="#888"
                    />
                  </View>
                </ThemedView>

                {selectedMode === 'two-player' && (
                  <ThemedView style={styles.inputCard}>
                    <ThemedText type="subtitle" style={styles.label}>Player 2 Name *</ThemedText>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        value={player2Name}
                        onChangeText={setPlayer2Name}
                        placeholder="Enter Player 2 name"
                        placeholderTextColor="#888"
                      />
                    </View>
                  </ThemedView>
                )}

                <ThemedView style={styles.inputCard}>
                  <ThemedText type="subtitle" style={styles.label}>Game Name *</ThemedText>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={gameName}
                      onChangeText={setGameName}
                      placeholder="Enter game name"
                      placeholderTextColor="#888"
                    />
                  </View>
                </ThemedView>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]} 
                  onPress={selectedMode === 'ai' ? handleStartAIGame : handleStartTwoPlayerGame}
                  activeOpacity={0.8}>
                  <View style={styles.buttonInner}>
                    <ThemedText style={styles.buttonText}>
                      {selectedMode === 'ai' ? '🤖 Start Game' : '👥 Start Game'}
                    </ThemedText>
                  </View>
                  <View style={styles.buttonShadow} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.backButton]}
                  onPress={handleBack}
                  activeOpacity={0.8}>
                  <View style={[styles.buttonInner, styles.backButtonInner]}>
                    <ThemedText style={styles.buttonText}>← Back</ThemedText>
                  </View>
                  <View style={[styles.buttonShadow, styles.backButtonShadow]} />
                </TouchableOpacity>
              </View>
            </>
          )}
          </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    opacity: 1,
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    gap: 24,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 10,
    paddingHorizontal: 10,
    overflow: 'visible',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    color: '#fff',
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 2,
    marginBottom: 8,
    paddingVertical: 8,
    overflow: 'visible',
  },
  titleUnderline: {
    width: 120,
    height: 4,
    backgroundColor: '#00d4ff',
    borderRadius: 2,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContainer: {
    gap: 20,
  },
  inputCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00d4ff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#0f0f1a',
    color: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 40,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'visible',
    marginTop: 0,
    width: '100%',
    maxWidth: 320,
  },
  buttonInner: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 12,
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
  primaryButton: {
    // Primary button styling
  },
  secondaryButton: {
    // Secondary button styling
  },
  secondaryButtonInner: {
    backgroundColor: '#34C759',
    borderColor: '#4ade80',
  },
  secondaryButtonShadow: {
    backgroundColor: '#22c55e',
  },
  backButton: {
    marginTop: 0,
  },
  backButtonInner: {
    backgroundColor: '#6c757d',
    borderColor: '#8e9aaf',
  },
  backButtonShadow: {
    backgroundColor: '#5a6268',
  },
  buttonShadow: {
    position: 'absolute',
    bottom: -4,
    left: 4,
    right: -4,
    height: '100%',
    backgroundColor: '#0056b3',
    borderRadius: 12,
    zIndex: -1,
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
