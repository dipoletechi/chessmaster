import { Chess } from 'chess.js';

export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

export class ChessEngine {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  getBoard(): (string | null)[][] {
    const board: (string | null)[][] = [];
    for (let i = 0; i < 8; i++) {
      board[i] = [];
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (8 - i);
        const piece = this.chess.get(square as any);
        board[i][j] = piece ? `${piece.color}${piece.type}` : null;
      }
    }
    return board;
  }

  getFen(): string {
    return this.chess.fen();
  }

  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  isCheck(): boolean {
    return this.chess.isCheck();
  }

  isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  isDraw(): boolean {
    return this.chess.isDraw();
  }

  isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  turn(): 'w' | 'b' {
    return this.chess.turn();
  }

  move(move: Move): boolean {
    try {
      const result = this.chess.move(move);
      return !!result;
    } catch {
      return false;
    }
  }

  getMoves(square?: string): Move[] {
    if (square) {
      return this.chess.moves({ square: square as any, verbose: true }).map((m) => ({
        from: m.from,
        to: m.to,
        promotion: m.promotion,
      }));
    }
    return this.chess.moves({ verbose: true }).map((m) => ({
      from: m.from,
      to: m.to,
      promotion: m.promotion,
    }));
  }

  getPgn(): string {
    return this.chess.pgn();
  }

  getHistory(): any[] {
    return this.chess.history({ verbose: true });
  }

  // Simple AI move (random valid move)
  getAIMove(): Move | null {
    const moves = this.getMoves();
    if (moves.length === 0) return null;

    // Simple evaluation: prefer captures and checks
    const captures = moves.filter((m) => {
      const testChess = new Chess(this.chess.fen());
      const piece = testChess.get(m.to as any);
      return piece !== null;
    });

    const checks = moves.filter((m) => {
      const testChess = new Chess(this.chess.fen());
      testChess.move(m);
      return testChess.isCheck();
    });

    // Prioritize checkmate moves
    const checkmates = moves.filter((m) => {
      const testChess = new Chess(this.chess.fen());
      testChess.move(m);
      return testChess.isCheckmate();
    });

    if (checkmates.length > 0) {
      return checkmates[Math.floor(Math.random() * checkmates.length)];
    }

    if (checks.length > 0) {
      return checks[Math.floor(Math.random() * checks.length)];
    }

    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    }

    // Random move
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Better AI with minimax (simplified)
  getBestAIMove(depth: number = 2): Move | null {
    const moves = this.getMoves();
    if (moves.length === 0) return null;

    let bestMove: Move | null = null;
    let bestScore = -Infinity;

    for (const move of moves) {
      const testChess = new Chess(this.chess.fen());
      testChess.move(move);

      if (testChess.isCheckmate()) {
        return move; // Immediate checkmate
      }

      const score = this.minimax(testChess, depth - 1, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove || moves[0];
  }

  private minimax(chess: Chess, depth: number, maximizing: boolean): number {
    if (depth === 0 || chess.isGameOver()) {
      return this.evaluate(chess);
    }

    const moves = chess.moves({ verbose: true });
    if (maximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        const testChess = new Chess(chess.fen());
        testChess.move(move);
        const score = this.minimax(testChess, depth - 1, false);
        maxScore = Math.max(maxScore, score);
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        const testChess = new Chess(chess.fen());
        testChess.move(move);
        const score = this.minimax(testChess, depth - 1, true);
        minScore = Math.min(minScore, score);
      }
      return minScore;
    }
  }

  private evaluate(chess: Chess): number {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -1000 : 1000;
    }
    if (chess.isDraw() || chess.isStalemate()) {
      return 0;
    }

    const pieceValues: { [key: string]: number } = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };

    let score = 0;
    const board = chess.board();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          score += piece.color === 'w' ? value : -value;
        }
      }
    }

    return score;
  }
}


