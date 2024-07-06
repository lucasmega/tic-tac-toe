import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GameState } from '../models/game-state.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private ws!: WebSocket;
  private gameStateSubject = new Subject<GameState>();
  private assignSymbolSubject = new Subject<string>();
  private roomFullSubject = new Subject<void>();
  private userCountSubject = new Subject<number>();
  gameState$ = this.gameStateSubject.asObservable();
  assignSymbol$ = this.assignSymbolSubject.asObservable();
  roomFull$ = this.roomFullSubject.asObservable();
  userCount$ = this.userCountSubject.asObservable();

  /**
   * @description Conecta ao servidor WebSocket e configura os manipuladores de eventos.
   */
  connect(): void {
    this.ws = new WebSocket(environment.webSocket);

    this.ws.onopen = () => {
      console.log('Conectado ao servidor WebSocket');
    };

    this.ws.onmessage = (message: MessageEvent) => {
      const data = JSON.parse(message.data);
      if (data.type === 'ASSIGN_SYMBOL') {
        this.assignSymbolSubject.next(data.payload);
      } else if (data.type === 'ROOM_FULL') {
        this.roomFullSubject.next();
      } else if (data.type === 'USER_COUNT') {
        this.userCountSubject.next(data.payload);
      } else {
        const gameState: GameState = data;
        console.log('Mensagem recebida do servidor:', gameState);
        this.gameStateSubject.next(gameState);
      }
    };

    this.ws.onclose = () => {
      console.log('Desconectado do servidor WebSocket');
    };
  }

  /**
   * @description Envia o estado atual do jogo para o servidor WebSocket.
   * @param gameState - O estado atual do jogo.
   */
  sendGameState(gameState: GameState): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      console.log('Enviando estado do jogo para o servidor:', gameState);
      this.ws.send(JSON.stringify({ type: 'MOVE', payload: gameState }));
    } else {
      console.log('WebSocket não está aberto. Estado atual:', this.ws.readyState);
    }
  }

  /**
   * @description Envia um comando para resetar o jogo ao servidor WebSocket.
   */
  resetGame(): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      console.log('Enviando comando de reset para o servidor');
      this.ws.send(JSON.stringify({ type: 'RESET' }));
    } else {
      console.log('WebSocket não está aberto. Estado atual:', this.ws.readyState);
    }
  }
}
