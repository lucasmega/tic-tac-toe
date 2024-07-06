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
      this.updateSymbolsAndScores(state.players, state.scores);
    });
  }

  /**
   * @description Atualiza os símbolos e pontuações dos jogadores com base no estado atual do jogo.
   * @param players - Objeto contendo os jogadores e seus símbolos.
   * @param scores - Objeto contendo as pontuações dos jogadores.
   */
  private updateSymbolsAndScores(players: { [key: string]: string }, scores: { [key: string]: number }): void {
    this.symbols = this.extractSymbols(players);
    this.displayScores = this.createDisplayScores(players, scores);
  }

  /**
   * @description Cria um objeto de pontuações a serem exibidas, mapeando símbolos dos jogadores às suas pontuações.
   * @param players - Objeto contendo os jogadores e seus símbolos.
   * @param scores - Objeto contendo as pontuações dos jogadores.
   * @returns Objeto de pontuações a serem exibidas.
   */
  private createDisplayScores(players: { [key: string]: string }, scores: { [key: string]: number }): { [key: string]: number } {
    const displayScores: { [key: string]: number } = {};
    for (const playerId in players) {
      if (players.hasOwnProperty(playerId)) {
        const symbol = players[playerId];
        displayScores[symbol] = scores[playerId];
      }
    }
    return displayScores;
  }

  /**
   * @description Extrai os símbolos dos jogadores a partir do objeto de jogadores.
   * @param players - Objeto contendo os jogadores e seus símbolos.
   * @returns Array de símbolos dos jogadores.
   */
  private extractSymbols(players: { [key: string]: string }): string[] {
    return this.Object.values(players);
  }

  /**
   * @description Realiza uma jogada no tabuleiro e envia o estado do jogo atualizado ao serviço de jogo.
   * @param index - Índice do movimento no tabuleiro.
   */
  makeMove(index: number): void {
    if (this.board[index] === '' && this.playerSymbol === this.currentPlayer) {
      this.board[index] = this.currentPlayer;
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      const gameState = new GameState([...this.board], this.currentPlayer, { ...this.getCurrentPlayers(), [this.playerId]: this.playerSymbol }, this.scores);
      this.gameService.sendGameState(gameState);
    }
    console.log(this);
  }

  /**
   * @description Reseta o jogo, enviando um comando ao serviço de jogo para reiniciar o estado do jogo.
   */
  resetGame(): void {
    this.gameService.resetGame();
  }

  /**
   * @description Atualiza o estado do jogo com os dados recebidos do serviço de jogo.
   * @param gameState - Estado atual do jogo.
   */
  private updateGameState(gameState: GameState): void {
    this.board = gameState.board;
    this.currentPlayer = gameState.currentPlayer;
    this.scores = gameState.scores || {};
    if (gameState.players[this.playerId]) {
      this.playerSymbol = gameState.players[this.playerId];
    }
    this.readyToPlay = Object.keys(gameState.players).length === 2;
  }

  /**
   * @description Obtém os jogadores atuais do tabuleiro.
   * @returns Objeto contendo os jogadores e seus símbolos.
   */
  private getCurrentPlayers(): { [key: string]: string } {
    return this.board.reduce((players, cell, index) => {
      if (cell !== '') {
        players[this.playerId] = this.playerSymbol;
      }
      return players;
    }, {} as { [key: string]: string });
  }

  /**
   * @description Conecta ao serviço de jogo.
   */
  private connectToGameService(): void {
    this.gameService.connect();
  }

  /**
   * @description Inscreve-se para receber atualizações do estado do jogo.
   */
  private subscribeToGameState(): void {
    this.gameService.gameState$.subscribe((gameState: GameState) => {
      this.updateGameState(gameState);
    });
  }

  /**
   * @description Inscreve-se para receber a atribuição de símbolo do serviço de jogo.
   */
  private subscribeToSymbolAssignment(): void {
    this.gameService.assignSymbol$.subscribe((symbol: string) => {
      this.playerSymbol = symbol;
      this.assignedSymbolMessage = `Você foi atribuído o símbolo ${symbol}`;
      this.readyToPlay = true;
    });
  }

  /**
   * @description Inscreve-se para receber a mensagem de sala cheia do serviço de jogo.
   */
  private subscribeToRoomFull(): void {
    this.gameService.roomFull$.subscribe(() => {
      this.roomFullMessage = 'A sala está cheia. Tente novamente mais tarde.';
    });
  }

  /**
   * @description Inscreve-se para receber a contagem de usuários conectados ao serviço de jogo.
   */
  private subscribeToUserCount(): void {
    this.gameService.userCount$.subscribe((count: number) => {
      this.userCount = count;
      this.readyToPlay = this.userCount >= 2;
    });
  }
}
