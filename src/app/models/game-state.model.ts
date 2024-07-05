export class GameState {
    constructor(
      public board: string[],
      public currentPlayer: string,
      public players: { [key: string]: string },
      public scores: { [key: string]: number } = {} // Novo campo para as pontuações, inicializado como um objeto vazio
    ) {}
  }
  