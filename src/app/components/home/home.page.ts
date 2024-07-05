import { Component, OnInit } from '@angular/core';

import { v4 as uuidv4 } from 'uuid';

import { GameService } from '../../services/game.service';
import { GameState } from '../../models/game-state.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  board: string[] = Array(9).fill('');
  currentPlayer: string = 'X';
  playerSymbol: string = '';
  playerId: string = uuidv4();
  assignedSymbolMessage: string = '';

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.connect();
    this.gameService.gameState$.subscribe((gameState: GameState) => {
      this.updateGameState(gameState);
    });

    this.gameService.assignSymbol$.subscribe((symbol: string) => {
      this.playerSymbol = symbol;
      this.assignedSymbolMessage = `Outro jogador escolheu ${symbol === 'X' ? 'O' : 'X'}, então você ficará com ${symbol}`;
    });
  }

  makeMove(index: number): void {
    if (this.board[index] === '') {
      this.board[index] = this.currentPlayer;
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      const gameState = new GameState([...this.board], this.currentPlayer);
      this.gameService.sendGameState(gameState);
    }
  }

  private updateGameState(gameState: GameState): void {
    this.board = gameState.board;
    this.currentPlayer = gameState.currentPlayer;
  }

  resetGame(): void {
    this.gameService.resetGame();
  }

  chooseSymbol(symbol: string): void {
    this.playerSymbol = symbol;
    this.gameService.setPlayer(this.playerId, symbol);
  }

}
