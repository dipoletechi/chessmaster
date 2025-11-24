import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChessBoardProps {
  board: (string | null)[][];
  onSquarePress: (row: number, col: number) => void;
  selectedSquare: { row: number; col: number } | null;
  possibleMoves: Array<{ row: number; col: number }>;
  flipped?: boolean;
}

const pieceSymbols: { [key: string]: string } = {
  wp: '♙',
  wn: '♘',
  wb: '♗',
  wr: '♖',
  wq: '♕',
  wk: '♔',
  bp: '♟',
  bn: '♞',
  bb: '♝',
  br: '♜',
  bq: '♛',
  bk: '♚',
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  onSquarePress,
  selectedSquare,
  possibleMoves,
  flipped = false,
}) => {
  const isLightSquare = (row: number, col: number): boolean => {
    return (row + col) % 2 === 0;
  };

  const isSelected = (row: number, col: number): boolean => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const isPossibleMove = (row: number, col: number): boolean => {
    return possibleMoves.some((move) => move.row === row && move.col === col);
  };

  const getDisplayRow = (row: number): number => {
    return flipped ? 7 - row : row;
  };

  const getDisplayCol = (col: number): number => {
    return flipped ? 7 - col : col;
  };

  const getSquareLabel = (row: number, col: number): string => {
    const file = String.fromCharCode(97 + (flipped ? 7 - col : col));
    const rank = flipped ? row + 1 : 8 - row;
    return `${file}${rank}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {board.map((row, rowIndex) => {
          const displayRow = getDisplayRow(rowIndex);
          return (
            <View key={rowIndex} style={styles.row}>
              {row.map((piece, colIndex) => {
                const displayCol = getDisplayCol(colIndex);
                const isLight = isLightSquare(displayRow, displayCol);
                const selected = isSelected(displayRow, displayCol);
                const possible = isPossibleMove(displayRow, displayCol);

                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={[
                      styles.square,
                      isLight ? styles.lightSquare : styles.darkSquare,
                      selected && styles.selectedSquare,
                      possible && styles.possibleMove,
                    ]}
                    onPress={() => onSquarePress(displayRow, displayCol)}>
                    {piece && (
                      <Text style={styles.piece}>{pieceSymbols[piece] || ''}</Text>
                    )}
                    {possible && !piece && <View style={styles.possibleMoveDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  board: {
    borderWidth: 2,
    borderColor: '#8B4513',
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lightSquare: {
    backgroundColor: '#F0D9B5',
  },
  darkSquare: {
    backgroundColor: '#B58863',
  },
  selectedSquare: {
    backgroundColor: '#7FC8F8',
  },
  possibleMove: {
    backgroundColor: '#90EE90',
  },
  piece: {
    fontSize: 36,
    textAlign: 'center',
  },
  possibleMoveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    position: 'absolute',
  },
  rankLabel: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileLabels: {
    flexDirection: 'row',
    marginTop: 4,
  },
  fileLabel: {
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

