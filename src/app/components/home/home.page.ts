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
  board: string[] = Array(9).fill('');
  currentPlayer: string = 'X';
  playerId: string = uuidv4();
  playerSymbol: string = '';
  assignedSymbolMessage: string = '';
  roomFullMessage: string = '';
  userCount: number = 0;
  readyToPlay: boolean = false;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.gameService.connect('ws://localhost:8080');
    this.gameService.gameState$.subscribe((gameState: GameState) => {
      this.updateGameState(gameState);
    });
    this.gameService.assignSymbol$.subscribe((symbol: string) => {
      this.playerSymbol = symbol;
      this.assignedSymbolMessage = `Você foi atribuído o símbolo ${symbol}`;
      this.readyToPlay = true;
    });
    this.gameService.roomFull$.subscribe(() => {
      this.roomFullMessage = 'A sala está cheia. Tente novamente mais tarde.';
    });
    this.gameService.userCount$.subscribe((count: number) => {
      this.userCount = count;
      if (this.userCount < 2) {
        this.readyToPlay = false;
      }
    });
  }

  makeMove(index: number): void {
    if (this.board[index] === '' && this.playerSymbol === this.currentPlayer) {
      this.board[index] = this.currentPlayer;
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      const gameState = new GameState([...this.board], this.currentPlayer, { ...this.getCurrentPlayers(), [this.playerId]: this.playerSymbol });
      this.gameService.sendGameState(gameState);
    }
  }

  resetGame(): void {
    this.assignedSymbolMessage = '';
    this.playerSymbol = '';
    this.readyToPlay = false;
    this.gameService.resetGame();
  }

  private updateGameState(gameState: GameState): void {
    this.board = gameState.board;
    this.currentPlayer = gameState.currentPlayer;
    if (gameState.players[this.playerId]) {
      this.playerSymbol = gameState.players[this.playerId];
    }
    if (Object.keys(gameState.players).length === 2) {
      this.readyToPlay = true;
    }
  }

  private getCurrentPlayers(): { [key: string]: string } {
    return this.board.reduce((players, cell, index) => {
      if (cell !== '') {
        players[this.playerId] = this.playerSymbol;
      }
      return players;
    }, {} as { [key: string]: string });
  }
}
