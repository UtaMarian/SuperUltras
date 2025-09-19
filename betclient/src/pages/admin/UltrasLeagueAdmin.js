import React, { useEffect, useState } from 'react';
import { showNotification } from '../../utils/NotificationMan';

function UltrasLeagueAdminComponent() {
  const token = localStorage.getItem('token');
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const teamsPerPage = 8;
  const [tournamentName, setTournamentName] = useState("");
  const [tournamentSize, setTournamentSize] = useState(16);


  // Fetch all teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API}/teams`, {
          credentials: 'include',
          headers: { "x-auth-token": token },
        });
        if (res.ok) {
          const data = await res.json();
          setTeams(data || []);
        } else {
          showNotification("danger", "Failed", "Eroare la preluarea echipelor");
        }
      } catch (err) {
        showNotification("danger", "Failed", "Eroare de la server");
      }
    };
    fetchTeams();
  }, [token]);

  // Handle team selection
  const handleSelectTeam = (teamId) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    } else {
      if (selectedTeams.length >= tournamentSize) {
        showNotification("warning", "Limită atinsă", `Poți selecta maxim ${tournamentSize} echipe`);
        return;
      }
      setSelectedTeams([...selectedTeams, teamId]);
    }
  };

  // Pagination logic
  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = teams.slice(indexOfFirstTeam, indexOfLastTeam);
  const totalPages = Math.ceil(teams.length / teamsPerPage);

  const handlePageChange = (page) => {
    if(page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Generate knockout tournament
  const generateTournament = async () => {
    if (selectedTeams.length !== tournamentSize) {
      showNotification("warning", "Selecție incompletă", `Trebuie să selectezi exact ${tournamentSize} echipe`);
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API}/admin/generatecup`, {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({ teamIds: selectedTeams ,cupName:tournamentName})
      });
      if (res.ok) {
        showNotification("success", "Success", "Turneul a fost generat!");
      } else {
        const data = await res.json();
        showNotification("danger", "Failed", data.message || "Eroare la generarea turneului");
      }
    } catch (err) {
      showNotification("danger", "Failed", err.message);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Selectează 16 echipe pentru turneu</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1">Număr echipe:</label>
        <select
          value={tournamentSize}
          onChange={(e) => setTournamentSize(parseInt(e.target.value))}
          className="p-2 border rounded"
        >
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={16}>16</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {currentTeams.map(team => (
          <div 
            key={team._id} 
            className={`p-2 border rounded cursor-pointer ${selectedTeams.includes(team._id) ? 'bg-blue-200 border-blue-500' : ''}`}
            onClick={() => handleSelectTeam(team._id)}
          >
            <div className='flex items-center gap-2 w-[180px]'>
              <img src={process.env.REACT_APP_LOGO + `/${team.imageUrl}`} alt={team.name} className="team_logo w-16 " />
              <p className="font-medium">{team.name}</p>
            </div>
          </div>
        ))}
      </div>


      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
      </div>

      
      <div className="mt-4">
        <p>Selected: {selectedTeams.length} / {tournamentSize}</p>


        <button
          onClick={generateTournament}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Generează Turneu
        </button>

        {/* Numele turneului */}
        <div className="mt-4">
          <label className="block mb-1 font-medium">Numele Turneului:</label>
          <input
            type="text"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            placeholder="Introdu numele turneului"
            className="w-full p-2 border rounded"
          />
        </div>

  {/* Lista echipelor selectate */}
  <div className="mt-4">
    <h4 className="font-semibold mb-2">Echipe selectate:</h4>
    <ul className="list-disc list-inside">
      {selectedTeams.map(teamId => {
        const team = teams.find(t => t._id === teamId);
        return team ? <li key={team._id}>{team.name}</li> : null;
      })}
    </ul>
  </div>
</div>
    </div>
  );
}

export default UltrasLeagueAdminComponent;
