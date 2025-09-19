import React, { useEffect, useState } from "react";
import '../../styles/cup.css'


function Match({ home, away, score }) {

  

  return (
    <div className="p-2 border rounded bg-gray-50 text-center ">
      {home.name && home.name!=="TBD"? 
      <div className=" flex font-bold center">
        <img src={process.env.REACT_APP_LOGO + `/${home.imageUrl}`} alt="team1_logo" className="team_logo" />
        {home.name}
      </div>
      :<div>TBD</div>}
       <div className="mt-1 font-bold text-gray-500">{score ?? "vs"}</div>
       {away.name&& away.name!=="TBD"?<div className="flex font-bold">
        <img src={process.env.REACT_APP_LOGO + `/${away.imageUrl}`} alt="team1_logo" className="team_logo" />
        {away.name}
       </div>:<div>TBD</div>}
      
    </div>
  );
}

function ChampionsKnockout({tournamentId}) {
  const [tournament, setTournament] = useState(null);

  if(!tournamentId){
    tournamentId="68c55261f3871538215f3b76"
  }
  const token=localStorage.getItem("token");
  useEffect(() => {
    const fetchTournament = async () => {
      const res = await fetch(`${process.env.REACT_APP_API}/leagues/cup/${tournamentId}`,{
          credentials: 'include',
          headers: { "x-auth-token": token },
    });
      const data = await res.json();
      setTournament(data);
    }
    fetchTournament();
  }, [tournamentId,token]);
  if (!tournament) {
      return <div>Loading tournament...</div>;
    }
  return (
    <div className="overflow-x-auto p-6 tournament-container">
      <h3 className="text-2xl font-bold mb-6 text-center">Champions Cup</h3>

      

 

  <div 
    className="grid gap-x-8 gap-y-6" 
    style={{ gridTemplateColumns: `repeat(${tournament.rounds.length}, minmax(0, 1fr))` }}
  >
    
    {tournament.rounds.map((round, roundIndex) =>
  round.matches.map((match, matchIndex) => {
    let rowStart;

   if (roundIndex === 0) {
      rowStart = matchIndex * 2 + 1; // optimile
    } else if (roundIndex === 1) {
      rowStart = matchIndex * 4 + 2; // sferturile
    } else if (roundIndex === 2) {
      rowStart = matchIndex === 0 ? 3 : 9; // semifinalele
    } else if (roundIndex === 3) {
      rowStart = 7; // finala
    }

    const colStart = roundIndex + 1;

    return (
      <div key={match.id} className={`col-start-${colStart}`} style={{ gridRowStart: rowStart }}>
        {/* Trofeu deasupra finalei */}
        {roundIndex === 3 && matchIndex === 0 && (
          <div className="flex justify-center mb-2">
            <div
            
              alt="Trophy"
              className="trophy-champions-cup trophy"
            />
          </div>
        )}
        <Match
          home={match.homeTeam || { name: "TBD", imageUrl: "" }}
          away={match.awayTeam || { name: "TBD", imageUrl: "" }}
          score={match.played ? `${match.homeScore} - ${match.awayScore}` : null}
        />
      </div>
    );
  })
)}
  </div>
</div>




    
   
  );
}

export default ChampionsKnockout;
