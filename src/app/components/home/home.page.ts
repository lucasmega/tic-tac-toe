import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { GameState } from '../../models/game-state.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  Object = Object;
  board: string[] = Array(9).fill('');
  currentPlayer: string = 'X';
  playerId: string = uuidv4();
  playerSymbol: string = '';
  assignedSymbolMessage: string = '';
  roomFullMessage: string = '';
  userCount: number = 0;
  readyToPlay: boolean = false;
  scores: { [key: string]: number } = {};
  symbols: string[] = [];
  displayScores: { [key: string]: number } = {};

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.connectToGameService();
    this.subscribeToGameState();
    this.subscribeToSymbolAssignment();
    this.subscribeToRoomFull();
    this.subscribeToUserCount();

    this.gameService.gameState$.subscribe(state => {
       this.symbols = this.extractSymbols(state.players) 
       this.displayScores = this.createDisplayScores(state.players, state.scores);
    });

  }

  createDisplayScores(players: { [key: string]: string }, scores: { [key: string]: number }): { [key: string]: number } {
    const displayScores: { [key: string]: number } = {};
    for (const playerId in players) {
      if (players.hasOwnProperty(playerId)) {
        const symbol = players[playerId];
        displayScores[symbol] = scores[playerId];
      }
    }
    return displayScores;
  }

  extractSymbols(players: {[key: string]: string}): string[] {
    return this.Object.values(players);
  }

  makeMove(index: number): void {
    if (this.board[index] === '' && this.playerSymbol === this.currentPlayer) {
      this.board[index] = this.currentPlayer;
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      const gameState = new GameState([...this.board], this.currentPlayer, { ...this.getCurrentPlayers(), [this.playerId]: this.playerSymbol }, this.scores);
      this.gameService.sendGameState(gameState);
    }
    console.log(this)
  }

  resetGame(): void {
    this.gameService.resetGame();
  }

  private updateGameState(gameState: GameState): void {
    this.board = gameState.board;
    this.currentPlayer = gameState.currentPlayer;
    this.scores = gameState.scores || {};
    if (gameState.players[this.playerId]) {
      this.playerSymbol = gameState.players[this.playerId];
    }
    this.readyToPlay = Object.keys(gameState.players).length === 2;
  }

  private getCurrentPlayers(): { [key: string]: string } {
    return this.board.reduce((players, cell, index) => {
      if (cell !== '') {
        players[this.playerId] = this.playerSymbol;
      }
      return players;
    }, {} as { [key: string]: string });
  }

  private connectToGameService(): void {
    this.gameService.connect('ws://localhost:8080');
  }

  private subscribeToGameState(): void {
    this.gameService.gameState$.subscribe((gameState: GameState) => {
      this.updateGameState(gameState);
    });
  }

  private subscribeToSymbolAssignment(): void {
    this.gameService.assignSymbol$.subscribe((symbol: string) => {
      this.playerSymbol = symbol;
      this.assignedSymbolMessage = `Você foi atribuído o símbolo ${symbol}`;
      this.readyToPlay = true;
    });
  }

  private subscribeToRoomFull(): void {
    this.gameService.roomFull$.subscribe(() => {
      this.roomFullMessage = 'A sala está cheia. Tente novamente mais tarde.';
    });
  }

  private subscribeToUserCount(): void {
    this.gameService.userCount$.subscribe((count: number) => {
      this.userCount = count;
      this.readyToPlay = this.userCount >= 2;
    });
  }
}
