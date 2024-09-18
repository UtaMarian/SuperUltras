import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '../../styles/club.css';
import BallIcon from '../../assets/icons/soccer-ball.png';

const ItemTypes = {
  PLAYER: 'player',
};


const isValidPosition = (playerPosition, fieldPosition) => {
    const positionMap = {
      GK: ['GK'],
      LB: ['LB'],
      RB: ['RB'],
      CB: ['CB1', 'CB2', 'CB'],  // CB can play in CB1 or CB2
      CM: ['CM', 'CM1', 'CM2'],  // CM can play in CM1 or CM2
      ST: ['ST', 'ST1', 'ST2'],  // ST can play in ST1 or ST2
      LM: ['LM'],
      RM: ['RM'],
      LW: ['LW'],
      RW: ['RW'],
    };
  
    // Check if player's position is allowed in the field position
    return positionMap[playerPosition]?.includes(fieldPosition);
  };

// Player component (Draggable)
const Player = ({ player, index }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PLAYER,
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <tr
      ref={drag}
      style={{
        opacity: isDragging ? 0.9 : 1,
      }}
    >
      <td>{index+1}</td>
      <td><div className={`table-player-position p-${player.position}`}>{player.position}</div></td>
      <td ><img src={process.env.REACT_APP_LOGO + `/${player.icon}`} alt='logo' className="table-player-picture" title={player.icon} /></td>
      <td className="table-player-name">{player.name}</td>
      <td >
        <div className="table-player-level">
            <div class="medal-content">{player.level}</div>
        </div>
      </td>
      <td className="table-player-goals">
        <div className="table-goals position-relative" >
        <img src={BallIcon} alt='ball' className='table-goals-icon'/>
            <span className="position-absolute top-0translate-middle badge rounded-pill bg-success table-goals-number">
                {player.goals}
            </span>
            </div>
      </td>
      <td className="tableplayer-matches">{player.influence}</td>
    </tr>
  );
};

const Position = ({ position, player, onDrop }) => {
    

    const [{ isOver }, drop] = useDrop({
      accept: ItemTypes.PLAYER,
      drop: (item) => onDrop(item.index, position),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });
  
    return (
      <div
        ref={drop}
        className={`field-position ${position}`}
        style={{
          backgroundColor: isOver ? 'lightgreen' : 'transparent',
        }}
      >
        {player ? (
          <div className='player-field'>
            <div className='field-player-overlay'>{player.name}</div>
            <div className='field-player-level-overlay'>{player.level}</div>
            <img className='field-player-icon' src={process.env.REACT_APP_LOGO + `/${player.icon}`} alt='logo'/>
          </div>
        ) : (
          <div className={`empty-field ${position}`}><div className='field-position-overlay'>{position}</div></div>
        )}
      </div>
    );
  };

// Formation configurations
const formations = {
  '4-3-3': ['GK', 'LB', 'CB1', 'CB2', 'RB', 'LM', 'CM', 'RM', 'LW', 'ST', 'RW'],
  '4-4-2': ['GK', 'LB', 'CB1', 'CB2', 'RB', 'LM', 'CM1','CM2', 'RM', 'ST1', 'ST2'],
  '4-2-4': ['GK', 'LB', 'CB1', 'CB2', 'RB', 'CM1', 'CM2', 'LW', 'ST1', 'ST2','RW'],
  '3-4-3': ['GK', 'LB', 'CB',  'RB', 'LM', 'CM1','CM2', 'RM', 'LW', 'ST', 'RW'],
  '3-3-4': ['GK', 'LB', 'CB',  'RB', 'LM', 'CM', 'RM', 'LW', 'ST1', 'ST2', 'RW'],
};

// Main component
const SoccerFormation = () => {
    const [players, setPlayers] = useState([
      { id: 1, name: 'Leo Messi', goals: 5, level: 10, influence: '1.5M', position: 'GK', icon: "userspicture/99f6a7b6a71f00375c2f7930b0d23a1d.jpg",},
      { id: 2, name: 'Ronaldo', goals: 8, level: 9, influence: '2.1M', position: 'LB', icon: "userspicture/e084569f98401c234b8e92a8f609aca8.png" },
      { id: 3, name: 'Mbbappe', goals: 62, level: 8, influence: '1.8M', position: 'ST', icon: "userspicture/99f6a7b6a71f00375c2f7930b0d23a1d.jpg" },
      { id: 4, name: 'Neymar', goals: 3, level: 7, influence: '900K', position: 'RM', icon: "userspicture/99f6a7b6a71f00375c2f7930b0d23a1d.jpg" },
      { id: 5, name: 'Vinicius', goals: 5, level: 10, influence: '1.5M', position: 'LM', icon: "userspicture/99f6a7b6a71f00375c2f7930b0d23a1d.jpg" },
      { id: 6, name: 'Haaland', goals: 8, level: 9, influence: '2.1M', position: 'CB', icon: "userspicture/d7e8f4543bd9ad63a9343b57dcee9ad9.jpg" },
      { id: 7, name: 'Dragusin', goals: 6, level: 8, influence: '1.8M', position: 'LB', icon: "userspicture/e6e053e18cb7a557016fc7511bf41ddf.jpg" },
      { id: 8, name: 'Hagi', goals: 3, level: 7, influence: '900K', position: 'CB', icon: "userspicture/99f6a7b6a71f00375c2f7930b0d23a1d.jpg" },
      { id: 9, name: 'Henry', goals: 5, level: 10, influence: '1.5M', position: 'ST', icon: "userspicture/f00de1ff69cb222ec6dda2c66c8f20ca.png" },
      { id: 10, name: 'Ronaldinho', goals: 8, level: 9, influence: '2.1M', position: 'LW', icon: "userspicture/99f6a7b6a71f00375c2f7930b0d23a1d.jpg" },
      { id: 11, name: 'Sergio Ramos', goals: 6, level: 8, influence: '1.8M', position: 'CM', icon: "userspicture/99f6a7b6a71f00375c2f7930b0d23a1d.jpg" },
      { id: 12, name: 'De Light', goals: 3, level: 7, influence: '900K', position: 'CB', icon: "userspicture/99f6a7b6a71f00375c2f7930b0d23a1d.jpg" },
      { id: 13, name: 'Maguire', goals: 5, level: 10, influence: '1.5M', position: 'CB', icon: "userspicture/e084569f98401c234b8e92a8f609aca8.png" },
      { id: 14, name: 'Carvajal', goals: 8, level: 9, influence: '2.1M', position: 'RB', icon: "userspicture/99f6a7b6a71f00375c2f7930b0d23a1d.jpg" },
      { id: 15, name: 'Pedri', goals: 6, level: 8, influence: '1.8M', position: 'CM', icon: "userspicture/863e7bea86159c870c8d79b4f7db7b71.png" },
      
    ]);
  
    const [field, setField] = useState({});
    const [formation, setFormation] = useState('4-3-3');
  
    const movePlayer = (fromIndex, toPosition) => {
      const player = players[fromIndex];
  
      // Check if the player is already placed in any position on the field
      const isPlayerAlreadyOnField = Object.values(field).some(
        (fieldPlayer) => fieldPlayer && fieldPlayer.id === player.id
      );
  
      if (isPlayerAlreadyOnField) {
        alert(`Player ${player.name} is already on the field!`);
        return;
      }
  
      // Check if the player can be moved to the selected position
      if (isValidPosition(player.position, toPosition)) {
        setField({ ...field, [toPosition]: player });
      } else {
        alert(`Player ${player.name} cannot play in ${toPosition}`);
      }
    };
  
    const handleFormationChange = (e) => {
      setFormation(e.target.value);
      setField({});
    };
  
    const handleSaveTeam = () => {
      const team = Object.values(field).filter(player => player); // Get all players on the field
      if (team.length === 11) {
        console.log("Saved Team:", team);
      } else {
        alert(`Incomplete team! Only ${team.length} players on the field.`);
      }
    };
  
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="formation-container">
          <div className='player-list'>
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Pos.</th>
                  <th>Img</th>
                  <th>Player</th>
                  <th>Level</th>
                  <th>Goals</th>
                  <th>Matches</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <Player key={player.id} player={player} index={index} />
                ))}
              </tbody>
            </table>
          </div>
  
          {/* Field */}
          <div className="field">
            <div className='field-actions'>
                  {/* Save Team Button */}
            <button className=" btn btn-success save-team-btn" onClick={handleSaveTeam}>
              Save Team
            </button>

             {/* Formation Dropdown */}
             <select className="formation-select" value={formation} onChange={handleFormationChange}>
              {Object.keys(formations).map((form) => (
                <option key={form} value={form}>
                  {form}
                </option>
              ))}
            </select>
            </div>
           
  
            <div className="field-layout">
              {formations[formation].map((position) => (
                <Position key={position} position={position} player={field[position]} onDrop={movePlayer} />
              ))}
              
            </div>
  
          
          </div>
        </div>
      </DndProvider>
    );
  };
  
  export default SoccerFormation;
  