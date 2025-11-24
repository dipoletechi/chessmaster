import { ChessBoard } from '@/components/ChessBoard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChessEngine } from '@/utils/chessEngine';
import { GameHistory, IncompleteGame, StorageService } from '@/utils/storage';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    AppState,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TwoPlayerGameScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const isResume = params.resume === 'true';
  const player1Name = params.player1Name as string;
  const player2Name = params.player2Name as string;
  const gameName = params.gameName as string;

  const [engine, setEngine] = useState<ChessEngine | null>(null);
  const [board, setBoard] = useState<(string | null)[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<{ row: number; col: number } | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Array<{ row: number; col: number }>>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hasSavedRef = useRef(false);
  const engineRef = useRef(engine);
  const gameOverRef = useRef(gameOver);
  const moveHistoryRef = useRef(moveHistory);
  const currentPlayerRef = useRef(currentPlayer);

  // Keep refs updated
  useEffect(() => {
    engineRef.current = engine;
    gameOverRef.current = gameOver;
    moveHistoryRef.current = moveHistory;
    currentPlayerRef.current = currentPlayer;
  }, [engine, gameOver, moveHistory, currentPlayer]);

  const saveGameState = useCallback(async () => {
    const currentEngine = engineRef.current;
    const currentGameOver = gameOverRef.current;
    const currentMoveHistory = moveHistoryRef.current;
    const currentPlayerValue = currentPlayerRef.current;
    
    if (!currentEngine || currentGameOver || hasSavedRef.current) return;
    
    hasSavedRef.current = true;
    
    const incompleteGame: IncompleteGame = {
      id: Date.now().toString(),
      gameName,
      player1Name,
      player2Name,
      mode: 'two-player',
      fen: currentEngine.getFen(),
      moveHistory: currentMoveHistory,
      currentPlayer: currentPlayerValue,
      date: new Date().toISOString(),
    };
    await StorageService.saveIncompleteGame(incompleteGame);
    
    // Also save to history as incomplete game
    const gameHistory: GameHistory = {
      id: incompleteGame.id,
      gameName,
      player1Name,
      player2Name,
      mode: 'two-player',
      result: 'incomplete',
      moves: currentMoveHistory.length,
      date: new Date().toISOString(),
    };
    await StorageService.addGameHistory(gameHistory);
  }, [gameName, player1Name, player2Name]);

  useEffect(() => {
    loadGame();
    
    // Save when component unmounts (app kill, refresh, etc.)
    return () => {
      if (!hasSavedRef.current && engineRef.current && !gameOverRef.current) {
        saveGameState();
      }
    };
  }, []);

  useEffect(() => {
    // Handle app state changes (background, kill, etc.)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (engineRef.current && !gameOverRef.current && !hasSavedRef.current) {
          saveGameState();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Handle navigation back button
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasSavedRef.current && engineRef.current && !gameOverRef.current) {
        saveGameState();
      }
    });

    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitleText}>
            {currentPlayer === 'white' ? `${player1Name} (White)` : `${player2Name} (Black)`}
          </ThemedText>
        </View>
      ),
      headerTitleStyle: { color: '#fff' },
      headerTitleAlign: 'left',
      headerLeftContainerStyle: { paddingTop: 25, paddingBottom: 0 },
      headerTitleContainerStyle: { paddingTop: 25, paddingBottom: 0, paddingLeft: 0 },
    });

    return unsubscribe;
  }, [navigation, saveGameState, currentPlayer, player1Name, player2Name]);

  const loadGame = async () => {
    if (isResume) {
      const savedGame = await StorageService.getIncompleteGame();
      if (savedGame && savedGame.mode === 'two-player') {
        const loadedEngine = new ChessEngine(savedGame.fen);
        setEngine(loadedEngine);
        setBoard(loadedEngine.getBoard());
        setMoveHistory(savedGame.moveHistory || []);
        setCurrentPlayer(savedGame.currentPlayer || 'white');
        setIsLoading(false);
        return;
      }
    }
    // New game
    const newEngine = new ChessEngine();
    setEngine(newEngine);
    setBoard(newEngine.getBoard());
    setIsLoading(false);
  };

  const updateBoard = () => {
    if (engine) {
      setBoard(engine.getBoard());
    }
  };

  const squareToNotation = (row: number, col: number): string => {
    const file = String.fromCharCode(97 + col);
    const rank = 8 - row;
    return `${file}${rank}`;
  };

  const notationToSquare = (notation: string): { row: number; col: number } => {
    const file = notation.charCodeAt(0) - 97;
    const rank = 8 - parseInt(notation[1]);
    return { row: rank, col: file };
  };

  const handleSquarePress = (row: number, col: number) => {
    if (gameOver || !engine) return;

    const square = squareToNotation(row, col);
    const piece = engine.getBoard()[row][col];
    const isWhitePiece = piece && piece.startsWith('w');
    const isBlackPiece = piece && piece.startsWith('b');
    const isCurrentPlayerPiece =
      (currentPlayer === 'white' && isWhitePiece) || (currentPlayer === 'black' && isBlackPiece);

    // If a square is selected, try to move
    if (selectedSquare) {
      const from = squareToNotation(selectedSquare.row, selectedSquare.col);
      const move = engine.move({ from, to: square });

      if (move) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        updateBoard();
        setMoveHistory([...moveHistory, `${from}-${square}`]);

        // Switch player
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');

        // Check game over
        checkGameOver();
      } else {
        // Invalid move, select new square if it's the current player's piece
        if (isCurrentPlayerPiece) {
          selectSquare(row, col);
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      // Select square if it's the current player's piece
      if (isCurrentPlayerPiece) {
        selectSquare(row, col);
      }
    }
  };

  const selectSquare = (row: number, col: number) => {
    if (!engine) return;
    const square = squareToNotation(row, col);
    const moves = engine.getMoves(square);
    setSelectedSquare({ row, col });
    setPossibleMoves(
      moves.map((move) => {
        const sq = notationToSquare(move.to);
        return { row: sq.row, col: sq.col };
      })
    );
  };

  const checkGameOver = () => {
    if (!engine) return;
    if (engine.isCheckmate()) {
      const winner = engine.turn() === 'w' ? 'black' : 'white';
      setGameOver(true);
      endGame(winner);
    } else if (engine.isDraw() || engine.isStalemate()) {
      setGameOver(true);
      endGame('draw');
    }
  };

  const endGame = async (result: 'white' | 'black' | 'draw') => {
    if (!engine) return;
    
    // Clear incomplete game
    await StorageService.clearIncompleteGame();
    
    const gameHistory: GameHistory = {
      id: Date.now().toString(),
      gameName,
      player1Name,
      player2Name,
      mode: 'two-player',
      result,
      moves: moveHistory.length,
      date: new Date().toISOString(),
      pgn: engine.getPgn(),
    };

    await StorageService.addGameHistory(gameHistory);

    if (result === 'white') {
      await StorageService.updatePlayerStats('win', player1Name);
      await StorageService.updatePlayerStats('loss', player2Name);
    } else if (result === 'black') {
      await StorageService.updatePlayerStats('loss', player1Name);
      await StorageService.updatePlayerStats('win', player2Name);
    } else {
      await StorageService.updatePlayerStats('draw', player1Name);
      await StorageService.updatePlayerStats('draw', player2Name);
    }

    const winnerText =
      result === 'white'
        ? `${player1Name} (White) won!`
        : result === 'black'
        ? `${player2Name} (Black) won!`
        : "It's a draw!";

    Alert.alert('Game Over', winnerText, [
      {
        text: 'New Game',
        onPress: () => router.replace('/(tabs)'),
      },
      {
        text: 'View History',
        onPress: () => router.push('/history'),
      },
    ]);
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.backgroundGradient}>
        <ThemedView style={styles.content}>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00d4ff" />
            <ThemedText style={styles.loadingText}>Loading game...</ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.gameNameCard}>
              <View style={styles.gameNameCardInner}>
                <ThemedText style={styles.gameNameIcon}>♟️</ThemedText>
                <ThemedText style={styles.gameNameText}>{gameName}</ThemedText>
                <ThemedText style={styles.gameNameIcon}>♟️</ThemedText>
              </View>
            </View>

            {engine && engine.isCheck() && !gameOver && (
              <View style={styles.checkWarningCard}>
                <ThemedText style={styles.checkWarning}>
                  ⚠️ {currentPlayer === 'white' ? player1Name : player2Name} is in check!
                </ThemedText>
              </View>
            )}

            {engine && (
              <View style={styles.boardContainer}>
                <ChessBoard
                  board={board}
                  onSquarePress={handleSquarePress}
                  selectedSquare={selectedSquare}
                  possibleMoves={possibleMoves}
                  flipped={false}
                />
              </View>
            )}
          </>
        )}

        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.button, styles.playerInfoButton]}
            activeOpacity={1}
            disabled={true}>
            <View style={[styles.buttonInner, styles.playerInfoButtonInner]}>
              <ThemedText style={styles.buttonText}>
                {player1Name} (White) vs {player2Name} (Black)
              </ThemedText>
            </View>
            <View style={[styles.buttonShadow, styles.playerInfoButtonShadow]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={async () => {
              if (!hasSavedRef.current) {
                await saveGameState();
              }
              router.replace('/(tabs)');
            }}
            activeOpacity={0.8}>
            <View style={[styles.buttonInner, styles.secondaryButtonInner]}>
              <ThemedText style={styles.buttonText}>← Back to Menu</ThemedText>
            </View>
            <View style={[styles.buttonShadow, styles.secondaryButtonShadow]} />
          </TouchableOpacity>
        </View>
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
    paddingTop: 10,
    alignItems: 'center',
  },
  headerTitleContainer: {
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 0,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  gameNameCard: {
    backgroundColor: '#1a1a2e',
    padding: 3,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#00d4ff',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
    alignItems: 'center',
  },
  gameNameCardInner: {
    backgroundColor: '#0f0f1a',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  gameNameIcon: {
    fontSize: 24,
  },
  gameNameText: {
    fontSize: 22,
    color: '#00d4ff',
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  footerContainer: {
    width: '100%',
    gap: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  playerInfoButton: {
    width: '100%',
    maxWidth: 400,
  },
  playerInfoButtonInner: {
    backgroundColor: '#1a1a2e',
    borderColor: '#2a2a3e',
  },
  playerInfoButtonShadow: {
    backgroundColor: '#0f0f1a',
  },
  currentPlayerCard: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    width: '100%',
  },
  currentPlayer: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 0,
    color: '#007AFF',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  checkWarningCard: {
    backgroundColor: '#2a1a1a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    width: '100%',
  },
  checkWarning: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  boardContainer: {
    marginTop: 0,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'visible',
    width: '100%',
    maxWidth: 400,
  },
  buttonInner: {
    backgroundColor: '#007AFF',
    padding: 16,
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
  secondaryButton: {
    width: '100%',
    maxWidth: 400,
  },
  secondaryButtonInner: {
    backgroundColor: '#007AFF',
    borderColor: '#00a8ff',
  },
  secondaryButtonShadow: {
    backgroundColor: '#0056b3',
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#00d4ff',
    fontWeight: '600',
  },
});



