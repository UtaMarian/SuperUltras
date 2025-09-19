import React from 'react';
import './jersey.css';

const Jersey = ({name,number}) => {
  return (
    <div className="jersey-container">
      <div className="relative">
        <div className="jersey-body">
          {/* Vertical stripes */}
          <div className="vertical-stripes">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`vertical-stripe ${i % 2 === 0 ? "stripe-yellow" : "stripe-red"}`}
              />
            ))}
          </div>

          {/* Sleeves */}
          <div className="sleeve-left"></div>
          <div className="sleeve-right"></div>

          {/* Collar */}
          <div className="collar"></div>

          {/* Player Name */}
          <div className="player-name">{name}</div>

          {/* Player Number */}
          <div className="player-number">{number}</div>
        </div>

        {/* Bottom Jersey */}
        <div className="jersey-bottom">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={i % 2 === 0 ? "stripe-yellow" : "stripe-red"}
            />
          ))}
        </div>

        {/* Shadow */}
        <div className="jersey-shadow"></div>
      </div>
    </div>
  );
};

export default Jersey;
