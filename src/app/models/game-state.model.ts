export class GameState {
    constructor(
        public board: string[], 
        public currentPlayer: string,
        public players: { [key: string]: string }
    ) {}
  }
  