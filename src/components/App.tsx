import React, { useState, useEffect } from 'react';
import { Player, GameState, Deal, Message } from './Types';
import Status from './Status';
import Controls from './Controls';
import Hand from './Hand';
import jsonData from '../deck.json';

const App: React.FC = () => {
  const data = JSON.parse(JSON.stringify(jsonData.cards));
  const [deck, setDeck]: any[] = useState(data);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const [dealerCards, setDealerCards]: any[] = useState([]);
  const [dealerScore, setDealerScore] = useState(0);
  const [dealerCount, setDealerCount] = useState(0);

  const [gameState, setGameState] = useState(GameState.bet);
  const [message, setMessage] = useState(Message.bet);
  const [buttonState, setButtonState] = useState({
    hitDisabled: false,
    standDisabled: false,
    resetDisabled: true
  });

  // Initialiser le jeu avec un nombre de joueurs
  useEffect(() => {
    initializePlayers(2); // Par exemple, pour 2 joueurs
  }, []);

  const initializePlayers = (numberOfPlayers: number) => {
    const newPlayers: Player[] = [];
    for (let i = 0; i < numberOfPlayers; i++) {
      newPlayers.push({
        id: `player-${i}`,
        name: `Player ${i + 1}`,
        cards: [],
        score: 0,
        balance: 100,
        bet: 0,
        isCurrentPlayer: i === 0
      });
    }
    setPlayers(newPlayers);
  };

  useEffect(() => {
    if (gameState === GameState.init) {
      // Distribuer les cartes initiales à tous les joueurs
      players.forEach(() => {
        drawCard(Deal.user);
      });
      drawCard(Deal.hidden);
      players.forEach(() => {
        drawCard(Deal.user);
      });
      drawCard(Deal.dealer);
      setGameState(GameState.userTurn);
      setMessage(Message.hitStand);
    }
  }, [gameState]);

  useEffect(() => {
    players.forEach((player, index) => {
      calculate(player.cards, (score: number) => {
        const updatedPlayers = [...players];
        updatedPlayers[index].score = score;
        setPlayers(updatedPlayers);
      });
    });
  }, [players]);

  useEffect(() => {
    calculate(dealerCards, setDealerScore);
    setDealerCount(dealerCount + 1);
  }, [dealerCards]);

  useEffect(() => {
    if (gameState === GameState.userTurn) {
      const currentPlayer = players[currentPlayerIndex];
      if (currentPlayer.score === 21) {
        nextPlayer();
      } else if (currentPlayer.score > 21) {
        bustCurrentPlayer();
      }
    }
  }, [players]);

  useEffect(() => {
    if (gameState === GameState.dealerTurn) {
      if (dealerScore >= 17) {
        checkWin();
      } else {
        drawCard(Deal.dealer);
      }
    }
  }, [dealerCount]);

  const nextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      const updatedPlayers = players.map((player, index) => ({
        ...player,
        isCurrentPlayer: index === currentPlayerIndex + 1
      }));
      setPlayers(updatedPlayers);
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      setGameState(GameState.dealerTurn);
      revealCard();
    }
  };

  const resetGame = () => {
    console.clear();
    setDeck(data);
    setPlayers(players.map(player => ({
      ...player,
      cards: [],
      score: 0,
      bet: 0
    })));
    setCurrentPlayerIndex(0);
    setDealerCards([]);
    setDealerScore(0);
    setDealerCount(0);
    setGameState(GameState.bet);
    setMessage(Message.bet);
    setButtonState({
      hitDisabled: false,
      standDisabled: false,
      resetDisabled: true
    });
  };

  const placeBet = (amount: number) => {
    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[currentPlayerIndex];
    currentPlayer.bet = amount;
    currentPlayer.balance = Math.round((currentPlayer.balance - amount) * 100) / 100;
    setPlayers(updatedPlayers);

    if (currentPlayerIndex === players.length - 1) {
      setGameState(GameState.init);
    } else {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
  };

  const drawCard = (dealType: Deal) => {
    if (deck.length > 0) {
      const randomIndex = Math.floor(Math.random() * deck.length);
      const card = deck[randomIndex];
      deck.splice(randomIndex, 1);
      setDeck([...deck]);

      const suit = getSuit(card.suit);
      
      if (dealType === Deal.user) {
        const updatedPlayers = [...players];
        const currentPlayer = updatedPlayers[currentPlayerIndex];
        currentPlayer.cards.push({
          value: card.value,
          suit: suit,
          hidden: false
        });
        setPlayers(updatedPlayers);
      } else {
        dealCard(dealType, card.value, suit);
      }
    } else {
      alert('All cards have been drawn');
    }
  };

  const getSuit = (suit: string): string => {
    switch (suit) {
      case 'spades': return '♠';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'hearts': return '♥';
      default: return '';
    }
  };

  const dealCard = (dealType: Deal, value: string, suit: string) => {
    switch (dealType) {
      case Deal.dealer:
        setDealerCards([...dealerCards, { value, suit, hidden: false }]);
        break;
      case Deal.hidden:
        setDealerCards([...dealerCards, { value, suit, hidden: true }]);
        break;
    }
  };

  const revealCard = () => {
    const updatedDealerCards = dealerCards.map((card: any) => ({
      ...card,
      hidden: false
    }));
    setDealerCards(updatedDealerCards);
  };

  const calculate = (cards: any[], setScore: (score: number) => void) => {
    let total = 0;
    cards.forEach((card: any) => {
      if (card.hidden === false && card.value !== 'A') {
        switch (card.value) {
          case 'K':
          case 'Q':
          case 'J':
            total += 10;
            break;
          default:
            total += Number(card.value);
            break;
        }
      }
    });

    const aces = cards.filter((card: any) => card.value === 'A' && !card.hidden);
    aces.forEach(() => {
      if ((total + 11) <= 21) {
        total += 11;
      } else {
        total += 1;
      }
    });

    setScore(total);
  };

  const hit = () => {
    drawCard(Deal.user);
  };

  const stand = () => {
    nextPlayer();
  };

  const bustCurrentPlayer = () => {
    nextPlayer();
  };

  const checkWin = () => {
    const updatedPlayers = players.map(player => {
      if (player.score > dealerScore || dealerScore > 21) {
        return {
          ...player,
          balance: Math.round((player.balance + (player.bet * 2)) * 100) / 100
        };
      } else if (dealerScore > player.score) {
        return player;
      } else {
        return {
          ...player,
          balance: Math.round((player.balance + player.bet) * 100) / 100
        };
      }
    });
    setPlayers(updatedPlayers);
    buttonState.hitDisabled = true;
    buttonState.standDisabled = true;
    buttonState.resetDisabled = false;
    setButtonState({ ...buttonState });
  };

  return (
    <>
      <Status message={message} players={players} />
      <Controls
        currentPlayer={players[currentPlayerIndex]}
        gameState={gameState}
        buttonState={buttonState}
        betEvent={placeBet}
        hitEvent={hit}
        standEvent={stand}
        resetEvent={resetGame}
      />
      <Hand title={`Dealer's Hand (${dealerScore})`} cards={dealerCards} />
      {players.map(player => (
        <Hand
          key={player.id}
          title={`${player.name}'s Hand (${player.score})`}
          cards={player.cards}
          isActive={player.isCurrentPlayer}
        />
      ))}
    </>
  );
};

export default App;