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
  private roomFullSubject = new Subject<void>();
  private userCountSubject = new Subject<number>();
  gameState$ = this.gameStateSubject.asObservable();
  assignSymbol$ = this.assignSymbolSubject.asObservable();
  roomFull$ = this.roomFullSubject.asObservable();
  userCount$ = this.userCountSubject.asObservable();

  connect(url: string): void {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Connected to WebSocket server');
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
        console.log('Message received from server:', gameState);
        this.gameStateSubject.next(gameState);
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };
  }

  sendGameState(gameState: GameState): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      console.log('Sending game state to server:', gameState);
      this.ws.send(JSON.stringify({ type: 'MOVE', payload: gameState }));
    } else {
      console.log('WebSocket is not open. Ready state:', this.ws.readyState);
    }
  }

  resetGame(): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      console.log('Sending reset command to server');
      this.ws.send(JSON.stringify({ type: 'RESET' }));
    } else {
      console.log('WebSocket is not open. Ready state:', this.ws.readyState);
    }
  }

}
