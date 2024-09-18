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

    useEffect(() => {
        // Fetch countries
        fetch(`${process.env.REACT_APP_API}/countries`, {
          credentials: 'include'
        })
          .then(res => res.json())
          .then(data => setCountries(data))
          .catch(err => console.error('Failed to fetch countries', err));
    
        // Fetch leagues
        fetch(`${process.env.REACT_APP_API}/leagues`, {
          credentials: 'include'
        })
          .then(res => res.json())
          .then(data => setLeagues(data))
          .catch(err => console.error('Failed to fetch leagues', err));
        fetch(process.env.REACT_APP_API+'/teams',{
                credentials:'include'
            }).then(res=>{
                res.json().then(_teams=>{
                    setTeams(_teams);
                })
            }).catch(err=>{
                showNotification("danger","Failed","Eroare de la server");
            })
        }, [refresh]);

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
                    <th scope="col">#</th>
                    <th scope="col">Nume echipa</th>
                    <th scope="col">Liga</th>
                    <th scope="col">Tara</th>
                    <th scope='col'>Sterge</th>
                </tr>
            </thead>
            <tbody>
            {teams.length>0 && teams.map((team,index) =>(
                <tr key={team._id}>
                    <th scope="row">{index+1}</th>
                    <td>{team.name}</td>
                    <td>{team.fromLeague.name}</td>
                    <td>{team.fromCountry.name}</td>
                    <td><button className='btn btn-outline-danger' onClick={() => deleteTeam(team._id,true)}>X</button></td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
  )
}

export default TeamComponent