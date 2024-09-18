import React, { useEffect, useState } from 'react';
import { showNotification } from '../../utils/NotificationMan.js';

function BetComponent() {
    const [teams,setTeams]=useState([]);
    const [bet,setBet] =useState({
        hometeam:null,
        awayteam:null,
        bet1:0.0,
        betx:0.0,
        bet2:0.0,
        datetime:new Date().toISOString()
    })
    useEffect(() => {
        fetch(process.env.REACT_APP_API+'/teams',{
            credentials:'include'
        }).then(res=>{
            res.json().then(_teams=>{
                setTeams(_teams);
            })
        }).catch(err=>{
            showNotification("danger","Failed","Eroare de la server");
        })
    }, []);
    async function  handleBet(ev){
       
        console.log(bet);
        try{
            if( !(bet)){
                showNotification("info","Failed","Trebuie sa completati toate informatii");
                ev.preventDefault();
            }else{
                ev.preventDefault();
                const res= await fetch(process.env.REACT_APP_API+'/bets',{
                    method:'POST',
                    body: JSON.stringify({ bet }),
                    credentials:'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                if(res.ok){

                    showNotification("success","Success","Pariul a fost adaugat");
                }else{
                    showNotification("danger","EROARE","Eroare la transmitere");
                }
            }
        }catch(err){
            showNotification("danger","EROARE","Eroare de server");
        }
    }
  return (
    <div>
         <form onSubmit={handleBet}>
            <div className="mb-3">
                <label className="form-label">Adauga pariu</label>
                
            </div>
            <div className='same-row-input-bet'>
                <select className="form-select"  
                value={bet.hometeam}
                onChange={ev => setBet(prevBet => ({ ...prevBet, hometeam: ev.target.value }))}>
                    <option value="">Echipa gazda</option>
                    {teams.map(team => (
                        <option key={team._id} value={team._id}>{team.name}</option>
                    ))}
                </select>
                
                <input type='number' step='0.01' placeholder='1' className='form-control betnumberbox'  value={bet.bet1} onChange={ev => setBet(prevBet => ({ ...prevBet, bet1: ev.target.value }))} />
                <input type='number' step='0.01' placeholder='1' className='form-control betnumberbox'  value={bet.betx} onChange={ev => setBet(prevBet => ({ ...prevBet, betx: ev.target.value }))}/>
                <input type='number' step='0.01' placeholder='1' className='form-control betnumberbox'  value={bet.bet2} onChange={ev => setBet(prevBet => ({ ...prevBet, bet2: ev.target.value }))}/>
                <select
                    className="form-select"
                    value={bet.awayteam}
                    onChange={ev => setBet(prevBet => ({ ...prevBet, awayteam: ev.target.value }))}>
                    <option value="">Echipa oaspete</option>
                    {teams.map(team => (
                        <option key={team._id} value={team._id}>{team.name}</option>
                    ))}
                    </select>
            </div>
            <div className="mb-3  datetimebox">
                <input type='datetime-local'  className='form-control' id="datetime_input" initialValue={bet.datetime} 
                onChange={ev => {
                       // Get the selected local date-time from the input
                        const localDatetime = new Date(ev.target.value);

                        // Format the date for the Bucharest timezone using Intl.DateTimeFormat
                        const options = { timeZone: 'Europe/Bucharest', hour12: false };
                        
                        // Extract the date in Bucharest's time zone
                        const bucharestDatetimeString = new Intl.DateTimeFormat('en-GB', {
                            ...options,
                            year: 'numeric', 
                            month: '2-digit', 
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        }).format(localDatetime);
                        
                        // Convert the Bucharest date string into a Date object
                        const [datePart, timePart] = bucharestDatetimeString.split(', ');
                        const [day, month, year] = datePart.split('/');
                        const [hour, minute, second] = timePart.split(':');

                        // Create the Date object in Bucharest time zone
                        const bucharestDatetime = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);

                        // Update the state with the Bucharest datetime
                        setBet(prevBet => ({ ...prevBet, datetime: bucharestDatetime }));
                }}/> 

                <button className='btn btn-primary ms-3' type='submit'>Adauga</button>
            </div>
        </form>
    </div>
  )
}

export default BetComponent