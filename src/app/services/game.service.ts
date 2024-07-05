import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { GameState } from '../models/game-state.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private ws!: WebSocket;
  private gameStateSubject = new Subject<GameState>();
  private assignSymbolSubject = new Subject<string>();
  gameState$ = this.gameStateSubject.asObservable();
  assignSymbol$ = this.assignSymbolSubject.asObservable();

  constructor() { }

  connect(): void {
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.onopen = () => {
      console.debug('Conectando no servidor WebSocket.');
    };

    this.ws.onmessage = (message: MessageEvent) => {
      const data = JSON.parse(message.data);
      if (data.type === 'ASSIGN_SYMBOL') {
        this.assignSymbolSubject.next(data.payload);
      } else {
        const gameState: GameState = data;
        console.log('Message received from server:', gameState);
        this.gameStateSubject.next(gameState);
      }
    };

    this.ws.onclose = () => {
      console.debug('Desconectando do servidor WebSocket.');
    };
  }

  sendGameState(gameState: GameState): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      console.debug('Enviando estado do jogo para o servidor');
      this.ws.send(JSON.stringify({ type: 'MOVE', payload: gameState }));
    } else {
      console.debug('Não foi possível estabelecer comunicação com o servidor WebSocket. Estado: ', this.ws.readyState);
    }
  }

  resetGame(): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      console.debug('Enviado comando de RESET para o servidor WebSocket');
      this.ws.send(JSON.stringify({ type: 'RESET' }));
    } else {
      console.debug('Não foi possível estabelecer comunicação com o servidor WebSocket. Estado: ', this.ws.readyState);
    }
  }

  setPlayer(playerId: string, symbol: string): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      console.debug('Adicionando simbolo a jogador:', playerId, symbol);
      this.ws.send(JSON.stringify({ type: 'SET_PLAYER', payload: { playerId, symbol } }));
    } else {
      console.debug('Não foi possível estabelecer comunicação com o servidor WebSocket. Estado: ', this.ws.readyState);
    }
  }

}
