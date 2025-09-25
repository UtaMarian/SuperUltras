import React, { useState } from 'react';
import '../../styles/club.css';
import Pagination from 'react-bootstrap/Pagination';

// Sample data for players (Replace with API call or dynamic data)
const initialPlayers = [
    { id: 1, name: 'Leo Messi', goals: 5, level: 10, position: 'ST' },
    { id: 2, name: 'Cristiano Ronaldo', goals: 8, level: 9, position: 'CM' },
    { id: 3, name: 'Kylian Mbappe', goals: 6, level: 8, position: 'RB' },
    { id: 4, name: 'Neymar', goals: 3, level: 7, position: 'LM' },
    { id: 5, name: 'Vinicius Jr', goals: 5, level: 10, position: 'RM' },
    { id: 6, name: 'Sergio Ramos', goals: 2, level: 9, position: 'RB' },
    { id: 7, name: 'Virgil van Dijk', goals: 1, level: 9, position: 'LB' },
    { id: 8, name: 'Robert Lewandowski', goals: 9, level: 10, position: 'LW' },
    { id: 9, name: 'Luka Modric', goals: 2, level: 8, position: 'ST' },
    { id: 10, name: 'Erling Haaland', goals: 10, level: 9, position: 'GK' },
    { id: 11, name: 'Toni Kroos', goals: 1, level: 9, position: 'RW' },
    { id: 12, name: 'Paul Pogba', goals: 2, level: 7, position: 'ST' },
    { id: 13, name: 'Manuel Neuer', goals: 0, level: 9, position: 'GK' },
    { id: 14, name: 'Alisson Becker', goals: 0, level: 8, position: 'GK' },
    { id: 15, name: 'Joshua Kimmich', goals: 3, level: 8, position: 'CM' },
    { id: 16, name: 'Thiago Silva', goals: 1, level: 9, position: 'CB' },
    { id: 17, name: 'Gerard Piqué', goals: 2, level: 8, position: 'CB' },
    { id: 18, name: 'Raheem Sterling', goals: 4, level: 8, position: 'ST' },
    { id: 19, name: 'Kevin De Bruyne', goals: 7, level: 9, position: 'ST' },
    { id: 20, name: 'Jadon Sancho', goals: 3, level: 8, position: 'ST' },
    { id: 21, name: 'Harry Kane', goals: 8, level: 9, position: 'LW' },
    { id: 22, name: 'Trent Alexander-Arnold', goals: 1, level: 9, position: 'LB' },
];

const positions = ['ST', 'CM', 'RB', 'GK']; // Positions dropdown options

const Transfers = () => {
  const [players, setPlayers] = useState(initialPlayers);
  const [searchName, setSearchName] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [minGoals, setMinGoals] = useState(0);
  const [minLevel, setMinLevel] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const playersPerPage = 20;

  // Function to filter the players based on the search and filter criteria
  const filteredPlayers = players.filter(player => {
    return (
      player.name.toLowerCase().includes(searchName.toLowerCase()) &&
      (filterPosition === '' || player.position === filterPosition) &&
      player.goals >= minGoals &&
      player.level >= minLevel
    );
  });

  // Pagination logic
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Total pages
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);

   // Function to reset filters
   const resetFilters = () => {
    setSearchName('');
    setFilterPosition('');
    setMinGoals(0);
    setMinLevel(0);
    setCurrentPage(1); // Reset to the first page
  };
  
  return (
    <div>
      <h3>Transfer Market</h3>

      <h1 className='items-center text-center text-2xl font-bold'> Cooming soon...</h1>
      {/* Filter Section */}
      {/* <div className="filters">
        <input
          type="text"
          placeholder="Search by name"
          className='form-control'
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)} className='form-control'>
          <option value="">All Positions</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
        <input
          type="number"
          className='form-control'
          placeholder="Min Goals"
          
          onChange={(e) => setMinGoals(Number(e.target.value))}
        />
        <input
          type="number"
          className='form-control'
          placeholder="Min Level"
          onChange={(e) => setMinLevel(Number(e.target.value))}
        />
        <button className='btn btn-primary' onClick={resetFilters}>Reset</button>
      </div> */}
      

      {/* Players Table */}
      {/* <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Goals</th>
            <th>Level</th>
            <th>Make an offer</th>
          </tr>
        </thead>
        <tbody>
          {currentPlayers.map((player) => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td><div className={`table-player-position p-${player.position}`}>{player.position}</div></td>
              <td>{player.goals}</td>
              <td>{player.level}</td>
              <td><button className='btn btn-primary'>Sign</button></td>
            </tr>
          ))}
        </tbody>
      </table> */}

      {/* Pagination */}
      {/* <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={number === currentPage ? 'active page-item page-link' : 'page-item page-link'}
            
          >
            {number}
          </button>
        ))}
      </div> */}
    </div>
  );
};

export default Transfers;
