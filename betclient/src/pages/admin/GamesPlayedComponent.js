import React, { useEffect, useState } from 'react'
import '../../styles/admin.css';
import { showNotification } from '../../utils/NotificationMan';
import Badge from 'react-bootstrap/esm/Badge';

function GamesPlayedComponent() {
    const [games,setGames]=useState([]);
    const token = localStorage.getItem('token');
    const [homeScore,setHomeScore]=useState(0);
    const [awayScore,setAwayScore]=useState(0);
    useEffect(()=>{
        fetch(process.env.REACT_APP_API+'/games-played',{
            credentials:'include',
            headers: {
                'x-auth-token': token  // Attach the token here
              },
        }).then(res=>{
            res.json().then(_games=>{
                setGames(_games);
            })
        }).catch(err=>{
            showNotification("danger","Failed","Eroare de la server");
        })
    },[]);

    async function saveScore(gameid,ev){
        try{
            if( !(homeScore) && !(awayScore)){
                showNotification("info","Failed","Trebuie sa completati toate informatii");
                ev.preventDefault();
                return;
            }else{
               
                const res= await fetch(process.env.REACT_APP_API+'/games-played/'+gameid,{
                    method:'PUT',
                    body: JSON.stringify({ homeScore,awayScore }),
                    credentials:'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token 
                    },
                });
                if(res.ok){
                    setHomeScore('');
                    setAwayScore('');
      
                    showNotification("success","Success","Rezultatul a fost modificat");
                }
                else{
                    showNotification("danger","EROARE",res.message);
                }
            }
        }catch(err){
            showNotification("danger","EROARE","Eroare de la server");
        }
    }
  return (
    <div>
         <table className="table  table-hover admin-table-responsive">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Status</th>
                    <th scope="col">Gazde</th>
                    <th scope="col">⚽</th>
                    <th scope="col">⚽</th>
                    <th scope="col">Oaspeti</th>
                    <th>Salveaza</th>
                </tr>
            </thead>
            <tbody>
                {games.length>0 && games.map((game,index)=>(
                <tr>
                     <td>{index+1}</td>
                     <td>{game.status==="unset"?<Badge bg="danger">{game.status.toUpperCase()}</Badge> :
                        (game.status==="set"? <Badge bg="info">{game.status.toUpperCase()}</Badge>:
                        <Badge bg="success">{game.status.toUpperCase()}</Badge>)}</td>
                     <td>{game.hometeam.name}</td>
                     <td><input type='number' className='form-control goals_input' placeholder={game.homeScore}  onChange={ev => setHomeScore(ev.target.value)} /></td>
                     <td><input type='number' className='form-control goals_input' placeholder={game.awayScore}  onChange={ev=>setAwayScore(ev.target.value)}/></td>
                     <td>{game.awayteam.name}</td>
                     <td><button className='btn btn-primary'onClick={()=>saveScore(game._id,true)}>Salveaza</button></td>
                 </tr>
                ))}
               
            </tbody>
        </table>
    </div>
  )
}

export default GamesPlayedComponent