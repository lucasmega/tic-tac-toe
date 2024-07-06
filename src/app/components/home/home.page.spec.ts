import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { HomePage } from './home.page';
import { GameService } from '../../services/game.service';
import { GameState } from '../../models/game-state.model';

// Mock do GameService
const gameServiceMock = {
  gameState$: of({} as GameState),
  assignSymbol$: of('X'),
  roomFull$: of(),
  userCount$: of(2),
  connect: jasmine.createSpy('connect'),
  sendGameState: jasmine.createSpy('sendGameState'),
  resetGame: jasmine.createSpy('resetGame')
};

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: GameService, useValue: gameServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve se conectar ao serviço de jogo na inicialização', () => {
    expect(gameServiceMock.connect).toHaveBeenCalled();
  });

  it('deve se inscrever para atualizações do estado do jogo', () => {
    const gameState: GameState = {
      board: ['X', 'O', '', '', '', '', '', '', ''],
      currentPlayer: 'O',
      players: { 'player1': 'X', 'player2': 'O' },
      scores: { 'player1': 1, 'player2': 0 }
    };
    gameServiceMock.gameState$.subscribe = jasmine.createSpy('subscribe').and.callFake((callback: any) => {
      callback(gameState);
    });

    component.ngOnInit();

    expect(component.board).toEqual(gameState.board);
    expect(component.currentPlayer).toBe(gameState.currentPlayer);
    expect(component.scores).toEqual(gameState.scores);
    expect(component.symbols).toEqual(['X', 'O']);
    expect(component._displayScores).toEqual({ 'X': 1, 'O': 0 });
  });

  it('deve atualizar símbolos e pontuações corretamente', () => {
    const players = { 'player1': 'X', 'player2': 'O' };
    const scores = { 'player1': 1, 'player2': 0 };
    component.updateSymbolsAndScores(players, scores);

    expect(component.symbols).toEqual(['X', 'O']);
    expect(component._displayScores).toEqual({ 'X': 1, 'O': 0 });
  });

  it('deve criar pontuações de exibição corretamente', () => {
    const players = { 'player1': 'X', 'player2': 'O' };
    const scores = { 'player1': 1, 'player2': 0 };
    const displayScores = component.createDisplayScores(players, scores);

    expect(displayScores).toEqual({ 'X': 1, 'O': 0 });
  });

  it('deve extrair símbolos corretamente', () => {
    const players = { 'player1': 'X', 'player2': 'O' };
    const symbols = component.extractSymbols(players);

    expect(symbols).toEqual(['X', 'O']);
  });

  it('deve resetar o jogo', () => {
    component.resetGame();
    expect(gameServiceMock.resetGame).toHaveBeenCalled();
  });
});
