// src/types.ts

export type Player = {
  id: string;
  name: string;
  cards: any[];
  score: number;
  balance: number;
  bet: number;
  isCurrentPlayer: boolean;
}

// Vous pouvez également y déplacer vos enums
export enum GameState {
  bet,
  init,
  userTurn,
  dealerTurn
}

export enum Deal {
  user,
  dealer,
  hidden
}

export enum Message {
  bet = 'Place a Bet!',
  hitStand = 'Hit or Stand?',
  bust = 'Bust!',
  userWin = 'You Win!',
  dealerWin = 'Dealer Wins!',
  tie = 'Tie!'
}