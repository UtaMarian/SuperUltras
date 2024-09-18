import React , { useEffect, useState } from 'react'
import { showNotification } from '../../utils/NotificationMan.js';

function LeagueComponent() {

    const [leagues,setLeagues]=useState([]);
    const [name,setName]=useState([]);
    const [refresh, setRefresh] = useState(false); 

    useEffect(()=>{
        fetch(process.env.REACT_APP_API+'/leagues',{
            credentials:'include'
        }).then(res=>{
            res.json().then(_leagues=>{
                setLeagues(_leagues);
            })
        }).catch(err=>{
            showNotification("danger","Failed","Eroare de la server");
        })
    },[refresh]);

    async function addNewLeague(ev) {
        try{
            if( !(name)){
                showNotification("info","Failed","Trebuie sa completati toate informatii");
                ev.preventDefault();
            }else{
                ev.preventDefault();
                const res= await fetch(process.env.REACT_APP_API+'/leagues',{
                    method:'POST',
                    body: JSON.stringify({ name }),
                    credentials:'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                if(res.ok){
                    setName('');
                    setRefresh(prev => !prev);
                    showNotification("success","Success","Liga a fost adaugata");
                }
            }
        }catch(err){
            showNotification("danger","EROARE","Eroare de server");
        }
    }
    async function deleteLeague(id){
        
        const delresponse = await fetch(process.env.REACT_APP_API+'/leagues/'+id, {
          method: 'DELETE',
          credentials: 'include',
        });
        if(delresponse){
            setRefresh(prev => !prev);
          showNotification("success","Deleted","Liga a fost stearsa");
        }else{
          showNotification("danger","Failed","Eroare la stergere");
        }
      }

  return (
    <div>
        <form onSubmit={addNewLeague}>
            <div className="mb-3">
                <label className="form-label">Adauga numele ligii</label>
                <div className='same-row-input'>
                    <input type="text" className="form-control" value={name} onChange={ev=> setName(ev.target.value)}/>
                    <button type="submit" className="btn btn-primary">Adauga</button>
                </div>
                <div className="form-text">Numele ligii trebuie sa fie unic</div>
               
            </div>
        </form>
        <label className="form-label pt-4">Ligi existente</label>
        <table className="table  table-hover admin-table-responsive">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Nume</th>
                    <th scope="col">Numar de echipe</th>
                    <th scope="col">Activa</th>
                    <th scope="col">Sterge</th>
                </tr>
            </thead>
            <tbody>
            {leagues.length>0 && leagues.map((league, index) =>(
                <tr  key={league._id}>
                    <th scope="row">{index + 1}</th>
                    <td>{league.name}</td>
                    <td>{league.no_teams}</td>
                    <td>{league.is_active? "Da" : "Nu"}</td>
                    <td><button className='btn btn-outline-danger' onClick={() => deleteLeague(league._id,true)}>X</button></td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
  )
}

export default LeagueComponent