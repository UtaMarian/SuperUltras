import React, { useContext, useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '../../styles/club.css';
import BallIcon from '../../assets/icons/soccer-ball.png';
import DefaultProfilePicture from '../../assets/icons/man.png';
import Jersey from '../../components/Jersey';
import AuthContext from '../../AuthContext';
import { useTranslation } from "react-i18next";
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

    // Tactical options
  const gameTypes = ["Park the Bus", "Defensiv", "Neutru", "Ofensiv", "All on Attack"];
  const tacticsInField = ["Pe flancuri", "Mingi lungi", "Joc de pase", "Contraatac"];
  const offsideOptions = ["On", "Off"];
  const markingOptions = ["Om la om", "Zonal"];

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
      {/*<td ><img src={process.env.REACT_APP_LOGO + `/${player.icon}`} alt='logo' className="table-player-picture" title={player.icon} /></td>*/}
      <td><img src={DefaultProfilePicture} alt='logo' className="table-player-picture" title={player.icon}/></td>
      <td className="table-player-name">
        {/* <a href={`/profile/${player._id}`}>{player.name}</a></td> */}{player.name}</td>
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
      <td ><button className='btn btn-outline-danger'>X</button></td>
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
            {/* <div className='field-player-overlay'>{player.name}</div> */}
            {/* <div className='field-player-level-overlay'>{player.level}</div> */}
            {/* <img className='field-player-icon' src={process.env.REACT_APP_LOGO + `/${player.icon}`} alt='logo'/>
          </div> */}
         
            <Jersey name={player.name} number={player.level}/>
          
          
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
  // '4-4-2': ['GK', 'LB', 'CB1', 'CB2', 'RB', 'LM', 'CM1','CM2', 'RM', 'ST1', 'ST2'],
  // '4-2-4': ['GK', 'LB', 'CB1', 'CB2', 'RB', 'CM1', 'CM2', 'LW', 'ST1', 'ST2','RW'],
  // '3-4-3': ['GK', 'LB', 'CB',  'RB', 'LM', 'CM1','CM2', 'RM', 'LW', 'ST', 'RW'],
  // '3-3-4': ['GK', 'LB', 'CB',  'RB', 'LM', 'CM', 'RM', 'LW', 'ST1', 'ST2', 'RW'],
};

// Main component
const SoccerFormation = ({club}) => {
   const { t } = useTranslation();
    const [players, setPlayers] = useState([]);
    const [field, setField] = useState({});
    const [formation, setFormation] = useState('4-3-3');
    const clubid =club._id;
    const { user } = useContext(AuthContext);

    
   useEffect(() => {
  const token = localStorage.getItem('token');

  const fetchPlayersAndFormation = async () => {
    try {
      let playersRes;

   
      if (!clubid) {
        // 🔹 Dacă clubid e null -> echipa userului
        playersRes = await fetch(`${process.env.REACT_APP_API}/club/my-team`, {
          method: "GET",
          credentials: "include",
          headers: { "x-auth-token": token }
        });
      } else {
        // 🔹 Dacă există clubid -> echipa altui club
        playersRes = await fetch(`${process.env.REACT_APP_API}/club/${clubid}/players`, {
          method: "GET",
          credentials: "include",
          headers: { "x-auth-token": token }
        });
      }

      if (!playersRes.ok) return console.error("Error fetching players");
      const playersData = await playersRes.json();
      setPlayers(playersData);

      if (!playersData.length) return;

      // 2. Fetch saved formation
      const teamId = clubid || playersData[0].team; 
      const formationRes = await fetch(`${process.env.REACT_APP_API}/club/${teamId}/formation`, {
        method: "GET",
        credentials: "include",
        headers: { "x-auth-token": token }
      });

      if (!formationRes.ok) return console.error("Error fetching formation");
      const savedFormation = await formationRes.json();

      // 3. Map saved player IDs to actual player objects
      const fieldPositions = {};
      for (const [pos, playerId] of Object.entries(savedFormation)) {
        const playerObj = playersData.find(p => p._id === playerId);
        if (playerObj) fieldPositions[pos] = playerObj;
      }

      setField(fieldPositions);

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  fetchPlayersAndFormation();
}, [clubid]);


   const movePlayer = (fromIndex, toPosition) => {
  const player = players[fromIndex];

  // Creează o copie a terenului
  const updatedField = { ...field };

  // Elimină jucătorul dacă există deja în altă poziție
  for (const pos in updatedField) {
    if (updatedField[pos]?._id === player._id) {
      updatedField[pos] = null;
    }
  }

  // Verifică dacă jucătorul poate fi pus pe poziția aleasă
  if (!isValidPosition(player.position, toPosition)) {
    alert(`Player ${player.name} cannot play in ${toPosition}`);
    return;
  }

  // Plasează jucătorul pe poziția dorită
  updatedField[toPosition] = player;
  setField(updatedField);
};

  
    const handleFormationChange = (e) => {
      setFormation(e.target.value);
      setField({});
    };
  
  const handleSaveTeam = async () => {
  const teamFormation = {};
  Object.entries(field).forEach(([pos, player]) => {
    if (player) teamFormation[pos] = player._id;
  });

  if (Object.keys(teamFormation).length === 11) {
    const token = localStorage.getItem('token');
    const res = await fetch(process.env.REACT_APP_API + `/club/${players[0].team}/formation`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ formation: teamFormation })
    });

    if (res.ok) alert("Team formation saved!");
    else alert("Error saving formation");
  } else {
    alert(`Incomplete team! Only ${Object.keys(teamFormation).length} players on the field.`);
  }
};

  
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="formation-container">
          <div className='player-list'>
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th>{t("club.nr")}</th>
                  <th>{t("club.pos")}.</th>
                  <th>{t("club.img")}</th>
                  <th>{t("club.player")}</th>
                  <th>{t("club.level")}</th>
                  <th>{t("club.goals")}</th>
                  <th>{t("club.matches")}</th>
                  <th>X</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <Player key={player._id} player={player} index={index} />
                ))}
              </tbody>
            </table>
          </div>
  
          {/* Field */}
          <div className="field">
            <div className='field-actions'>
                 
            {club.manager&&club.manager._id===user.user.id?
            <>
            
                  {/* Save Team Button */}
              <button className=" btn btn-success save-team-btn" onClick={handleSaveTeam}>
                   {t("club.saveteam")}
              </button>

              {/* Formation Dropdown */}
              <select className="formation-select" value={formation} onChange={handleFormationChange}>
                {Object.keys(formations).map((form) => (
                  <option key={form} value={form}>
                    {form}
                  </option>
                ))}
              </select>
              </> :<></>}
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
  