import React, { useEffect, useState } from 'react';
import { showNotification } from '../../utils/NotificationMan.js';

function TeamComponent() {
    const [teams,setTeams]=useState([]);
    const [name,setName]=useState('');
    const [file, setFile] = useState(null);
    const [countries, setCountries] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [fromLeague, setFromLeague] = useState('');
    const [fromCountry, setFromCountry] = useState('');
    const [refresh, setRefresh] = useState(false); 
    const [players, setPlayers] = useState({});
    const [selectedManagers, setSelectedManagers] = useState({});
    const token = localStorage.getItem('token');
   useEffect(() => {
  async function fetchData() {
    try {
      // fetch leagues
      const resLeagues = await fetch(process.env.REACT_APP_API + '/leagues', { credentials: 'include' ,  headers: { 'x-auth-token': token }});
      if(resLeagues.ok) {
        const dataLeagues = await resLeagues.json();
        setLeagues(dataLeagues);
      }

      // fetch countries
      const resCountries = await fetch(process.env.REACT_APP_API + '/countries', { credentials: 'include' });
      if(resCountries.ok) {
        const dataCountries = await resCountries.json();
        setCountries(dataCountries);
      }

      // fetch teams & their players (existing code)
      const resTeams = await fetch(process.env.REACT_APP_API + '/teams', { credentials: 'include' });
      if(resTeams.ok) {
        const dataTeams = await resTeams.json();
        setTeams(dataTeams);

        // fetch players for each team
        const token = localStorage.getItem('token');
        let playersByTeam = {};
        for (let team of dataTeams) {
          const resPlayers = await fetch(`${process.env.REACT_APP_API}/players/by-team/${team._id}`, {
            credentials: 'include',
            headers: { "x-auth-token": token }
          });
          const dataPlayers = await resPlayers.json();
          playersByTeam[team._id] = dataPlayers;
        }
        setPlayers(playersByTeam);
      }

    } catch(err) {
      console.error(err);
    }
  }

  fetchData();
}, [refresh]);


        // schimbă managerul
    async function setManager(teamId) {
        const managerId = selectedManagers[teamId];
        if (!managerId) {
            showNotification("info", "INFO", "Selectează un manager");
            return;
        }

        const res = await fetch(`${process.env.REACT_APP_API}/teams/${teamId}/manager`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ managerId }),
        });

        if (res.ok) {
            showNotification("success", "Success", "Manager actualizat");
            setRefresh(prev => !prev);
        } else {
            const errData = await res.json();
            showNotification("danger", "Error", errData.message || "Eroare la schimbarea managerului");
        }
        }
      async function addNewCountry(ev) {
        ev.preventDefault();
        if(!(fromLeague && fromCountry && name)){
            showNotification("info","INFO","Completeaza toate campurile");
            return;
        }
        try{
            const formData = new FormData();
            formData.append('name', name);
            formData.append('fromCountry', fromCountry);
            formData.append('fromLeague', fromLeague);
            if (file) {
                formData.append('file', file);
            }
            //JSON.stringify({ name,fromCountry,fromLeague,file:file })
            /*                headers: {
                    'Content-Type': 'application/json'
                },*/
            const res= await fetch(process.env.REACT_APP_API+'/teams',{
                method:'POST',
                body: formData,
                credentials:'include'
            });
            if(res.ok){
                setName('');
                showNotification("success","Success","Echipa a fost adaugata");
                setRefresh(prev => !prev);
            }
        }
        catch(err){
            showNotification("danger","EROARE","Eroare de server");
        }
       
      };

      async function deleteTeam(id){
        
        const delresponse = await fetch(process.env.REACT_APP_API+'/teams/'+id, {
          method: 'DELETE',
          credentials: 'include',
        });
        if(delresponse.ok){
            setRefresh(prev => !prev);
          showNotification("success","Deleted","Echipa a fost stearsa");
        }else{
          showNotification("danger","Failed","Eroare la stergere");
        }
      }


  return (
    <div>
        <form onSubmit={addNewCountry}>
            <div className="mb-3">
                <label className="form-label">Adauga echipa</label>
                <div className='same-row-input'>
                    <input type="text" className="form-control" placeholder='Nume echipa' value={name} onChange={ev=> setName(ev.target.value)}/>
                    <button type="submit" className="btn btn-primary">Adauga</button>
                </div>
            </div>
            <div className='same-row-input-large'>
            <div className="mb-3 leaguenamediv">
                <label  className="form-label">Adauga liga</label>
                <select className="form-select"  
                value={fromLeague}
              onChange={ev => setFromLeague(ev.target.value)}>
                    <option value="">Selecteaza liga</option>
                    {leagues.map(league => (
                        <option key={league._id} value={league._id}>{league.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label  className="form-label">Adauga tara</label>
                <select
                    className="form-select"
                    value={fromCountry}
                    onChange={ev => setFromCountry(ev.target.value)}
                    >
                    <option value="">Selecteaza tara</option>
                    {countries.map(country => (
                        <option key={country._id} value={country._id}>{country.name}</option>
                    ))}
                    </select>
            </div>
            </div>
            <div className="mb-3">
                <label  className="form-label">Adauga logo</label>
                <input type='file' className='form-control'  onChange={ev => setFile(ev.target.files[0])}/>
            </div>
           
        </form>
        <label className="form-label pt-4">Echipe existente</label>
        <table className="table  table-hover admin-table-responsive">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nume echipa</th>
                    <th>Liga</th>
                    <th>Tara</th>
                    <th>Manager</th>
                    <th>Sterge</th>
                </tr>
            </thead>
            <tbody>
            {teams.map((team, index) => (
                <tr key={team._id}>
                <td>{index + 1}</td>
                <td>{team.name}</td>
                <td>{team.fromLeague?.name}</td>
                <td>{team.fromCountry?.name}</td>
                <td>
                    <select
                    value={selectedManagers[team._id] || ""}
                    onChange={e =>
                        setSelectedManagers(prev => ({ ...prev, [team._id]: e.target.value }))
                    }
                    >
                    <option value="">Selectează manager</option>
                    {Array.isArray(players[team._id]) &&
                        players[team._id].map(player => (
                            <option key={player._id} value={player._id}>
                            {player.name} ({player.position})
                            </option>
                        ))}
                    </select>
                    <button
                    className="btn btn-sm btn-primary ms-2"
                    onClick={() => setManager(team._id)}
                    >
                    Salvează
                    </button>
                </td>
                <td>
                    <button
                    className="btn btn-outline-danger"
                    onClick={() => deleteTeam(team._id)}
                    >
                    X
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
  )
}

export default TeamComponent