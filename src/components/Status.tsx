import React from 'react';
import { Player } from './Types';
import './Status.css';

type StatusProps = {
  message: string;
  players: Player[];
};

const Status: React.FC<StatusProps> = ({ message, players }) => {
  return (
    <div className="status-container">
      <div className="message">{message}</div>
      <div className="players-status">
        {players.map((player) => (
          <div key={player.id} className={`player-status ${player.isCurrentPlayer ? 'active' : ''}`}>
            <div className="player-name">{player.name}</div>
            <div className="player-info">
              <div className="balance">
                Balance: ${player.balance}
              </div>
              {player.bet > 0 && (
                <div className="bet">
                  Current Bet: ${player.bet}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Status;