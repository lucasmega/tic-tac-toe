import { TestBed } from '@angular/core/testing';

import { GameService } from './game.service';
import { GameState } from '../models/game-state.model';

class MockWebSocket {
  public static OPEN = 1;
  public static CLOSED = 3;
  public readyState = MockWebSocket.OPEN;
  public onopen: (() => void) | null = null;
  public onmessage: ((event: { data: string }) => void) | null = null;
  public onclose: (() => void) | null = null;

  constructor(public url: string) {}

  send(data: string) { }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose();
    }
  }
}

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
    (window as any).WebSocket = MockWebSocket;
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve se conectar ao servidor WebSocket', () => {
    service.connect();
    expect(service['ws']).toBeTruthy();
    expect(service['ws'].onopen).toBeDefined();
    expect(service['ws'].onmessage).toBeDefined();
    expect(service['ws'].onclose).toBeDefined();
  });

  it('deve lidar com o evento de abertura do WebSocket', () => {
    spyOn(console, 'log');
    service.connect();
    (service['ws'].onopen as Function)();
    expect(console.log).toHaveBeenCalledWith('Conectado ao servidor WebSocket');
  });

  it('deve lidar com o evento de mensagem do WebSocket', () => {
    spyOn(console, 'log');
    const gameState: GameState = {
      board: ['X', 'O', '', '', '', '', '', '', ''],
      currentPlayer: 'O',
      players: { 'player1': 'X', 'player2': 'O' },
      scores: { 'player1': 1, 'player2': 0 }
    };

    service.connect();
    (service['ws'].onmessage as Function)({ data: JSON.stringify(gameState) } as MessageEvent);
    expect(console.log).toHaveBeenCalledWith('Mensagem recebida do servidor:', gameState);
    service.gameState$.subscribe(state => {
      expect(state).toEqual(gameState);
    });
  });

  it('deve lidar com o evento de fechamento do WebSocket', () => {
    spyOn(console, 'log');
    service.connect();
    (service['ws'].onclose as Function)();
    expect(console.log).toHaveBeenCalledWith('Desconectado do servidor WebSocket');
  });

  it('deve enviar o estado do jogo para o servidor', () => {
    const gameState: GameState = {
      board: ['X', 'O', '', '', '', '', '', '', ''],
      currentPlayer: 'O',
      players: { 'player1': 'X', 'player2': 'O' },
      scores: { 'player1': 1, 'player2': 0 }
    };

    service.connect();
    spyOn(service['ws'], 'send');
    service.sendGameState(gameState);
    expect(service['ws'].send).toHaveBeenCalledWith(JSON.stringify({ type: 'MOVE', payload: gameState }));
  });

  it('deve resetar o jogo', () => {
    service.connect();
    spyOn(service['ws'], 'send');
    service.resetGame();
    expect(service['ws'].send).toHaveBeenCalledWith(JSON.stringify({ type: 'RESET' }));
  });
});
