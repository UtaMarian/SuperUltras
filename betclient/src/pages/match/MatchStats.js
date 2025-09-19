import React, { useEffect, useState } from 'react';
import Coregrafie from './Coregrafie';
import { useTranslation } from "react-i18next";
import { Commet } from 'react-loading-indicators';

function MatchStats({ matchid, homeTeamName, awayTeamName,onRefreshMatch, any}) {
  const [choreographies, setChoreographies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
   const fetchChoreographies = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.REACT_APP_API}/choreographies/match/${matchid}`, {
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      const data = await res.json();
      setChoreographies(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChoreographies();
  }, [matchid]);

  if (loading) return <p>  
    <div className="flex items-center justify-center min-h-screen">
          <Commet color={["#4c106a", "#6b1697", "#8b1dc3", "#a632e1"]} />
        </div></p>;

  // Separăm coregrafiile după numele echipei
  const homeChoreographies = choreographies.filter(c => c.team.name === homeTeamName);
  const awayChoreographies = choreographies.filter(c => c.team.name === awayTeamName);

  return (
    <div >
      {!any && <Coregrafie matchid={matchid} homeTeamName={homeTeamName} awayTeamName={awayTeamName} onSaved={() => {
          fetchChoreographies();
          if (onRefreshMatch) onRefreshMatch();   
        }}/>}
      
      <div className='match-stats-coregraphy'>
      <div className='div-coregraphy home-coregraphy'>
        <h3>{homeTeamName} </h3>
        {homeChoreographies.length > 0 ? (
          homeChoreographies.map(c => (
            <div key={c._id} className="coregraphy-item">
              <div className="coregraphy-user">
                 <img  src={process.env.REACT_APP_LOGO + `/${c.user.profilePicture}`} alt={c.user.username}/>
                <span>{c.user.username}</span>
              </div>
              <div className="coregraphy-history">
                {c.history.map((h, i) => {
                  if (h.length === 1) {
                    // litere (ex: "A", "B", "1")
                    return (
                      <div className="letter" key={i}>
                        {h}
                      </div>
                    );
                  } else if (h.includes("png") || h.includes("jpg") || h.includes("jpeg")|| h.includes("gif")) {
                    // imagini
                    return (
                      <div className="letter" key={i}>
                        <img src={h} alt="icon" className="icon" />
                      </div>
                    );
                  } else {
                    // culori (ex: "red", "#FC4F00")
                    return (
                      <div
                        className="color"
                        key={i}
                        style={{ backgroundColor: h }}
                      ></div>
                    );
                  }
                })}
              </div>
              
            </div>
          ))
        ) : <p>  {t("games.noflags")}</p>}
      </div>
        <div></div>
      <div >
        <div className='div-coregraphy away-coregraphy'>
          <h3>{awayTeamName} </h3>
          {awayChoreographies.length > 0 ? (
            awayChoreographies.map(c => (
              <div key={c._id} className="coregraphy-item">
                <div className="coregraphy-user">
                  <img  src={process.env.REACT_APP_LOGO + `/${c.user.profilePicture}`} alt={c.user.username}/>
                  <span>{c.user.username}</span>
                </div>
                <div className="coregraphy-history">
                  {c.history.map((h, i) => {
                    if (h.length === 1) {
                      // litere (ex: "A", "B", "1")
                      return (
                        <div className="letter" key={i}>
                          {h}
                        </div>
                      );
                    } else if (h.includes("png") || h.includes("jpg") || h.includes("jpeg")|| h.includes("gif")) {
                      // imagini
                      return (
                        <div className="letter" key={i}>
                          <img src={h} alt="icon" className="icon" />
                        </div>
                      );
                    } else {
                      // culori (ex: "red", "#FC4F00")
                      return (
                        <div
                          className="color"
                          key={i}
                          style={{ backgroundColor: h }}
                        ></div>
                      );
                    }
                  })}
                </div>
             
              </div>
            ))
          ) : <p>  {t("games.noflags")}</p>}
        </div>
        </div>
    </div> </div>
  );
}

export default MatchStats;
