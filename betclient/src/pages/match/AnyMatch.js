import React, { useEffect, useState } from "react";
import "../../styles/match.css";
import { useParams } from "react-router-dom";
import MatchStats from "./MatchStats";
import { useTranslation } from "react-i18next";
import Supporters from "./Supporters";

function AnyMatch() {
  const [match, setMatch] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('Meci');
  const fetchMatch = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API}/matches/${id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch match");
      const data = await res.json();
      setMatch(data);

      // Countdown doar dacă meciul nu e terminat
      if (data.status !== "finished") {
        const interval = setInterval(() => {
          const now = new Date();
          const matchDate = new Date(data.date);
          const diff = matchDate - now;

          if (diff > 0) {
            const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
            const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
            const s = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
            setTimeLeft(`${h}:${m}:${s}`);
          } else {
            setTimeLeft("LIVE");
          }
        }, 1000);

        return () => clearInterval(interval);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [id]);

  if (!match) return <p>Loading match...</p>;
    const renderActiveComponent = () => {
            switch (activeTab) {
                case 'Meci':
                    return  <MatchStats 
                      matchid={match._id} 
                      homeTeamName={match.homeTeam.name} 
                      awayTeamName={match.awayTeam.name}  
                      onRefreshMatch={fetchMatch} 
                      any={true} 
                      goals={match.goals || []} // transmitem lista de marcatori
                    />;
                case 'Tactica':
                    return <p>Tactica</p>;
                case 'Suporteri':
                    return <Supporters matchid={match._id} />;
                default:
                    return null;
            }
        };
  return (
    <div className="match-page">
      <div className="match-container  backdrop-blur-xl bg-gradient-to-br from-gray-800/50 via-violet-800/30 to-rose-900/50">
        <div className="match-header">
          {/* Home Team */}
          <div className="team team-left">
            <img
              src={process.env.REACT_APP_LOGO + `/${match.homeTeam.imageUrl}`}
              alt={match.homeTeam.name}
              className="team-logo"
            />
            <div className="team-info-container">
              <h3>{match.homeTeam.name}</h3>
              <div className="team-stats">
              {match.status === "finished" ? (
                <div className="finished-info">
                  <span className="stat supporters">⚽ {match.homeTeam.clubOvr}</span>
                  <span className="stat supporters">🔥 {match.homeInfluence}</span>
                  <div className="scorers">

                    {match.goals
                      .filter((g) => g.team === match.homeTeam._id)
                      .map((g) => `${g.player.name} (${g.minute}')`)
                      .join(", ") || ""}
                  </div>
                </div>
              ) : (<>
                    <span className="stat supporters">⚽ {match.homeTeam.clubOvr}</span>
                    <span className="stat supporters">🔥 {match.homeInfluence}</span>
                  </>
                
              )}
            </div>

            </div>
          </div>

          {/* Center */}
          <div className="match-center">
          {match.status === "finished" ? (
            <div className="final-score">

                 {match.score.home} - {match.score.away} 
              
            </div>
          ) : (
            <div className="timer">{timeLeft}</div>
          )}
        </div>

          {/* Away Team */}
          <div className="team team-right">
            <div className="team-info-container">
              <h3>{match.awayTeam.name}</h3>
              <div className="team-stats">
                {match.status === "finished" ? (
                <div className="finished-info">
                 
                  <span className="stat supporters">⚽ {match.awayTeam.clubOvr}</span>
                   <span className="stat supporters">🔥 {match.awayInfluence}</span>
                  <div className="scorers">

                    {match.goals
                      .filter((g) => g.team === match.awayTeam._id)
                      .map((g) => `${g.player.name} (${g.minute}')`)
                      .join(", ") || ""}
                  </div>
                </div>
              ) : (<>
                  
                  <span className="stat supporters">⚽ {match.awayTeam.clubOvr}</span>
                  <span className="stat supporters">🔥 {match.awayInfluence}</span>
                </>
              )}
              </div>
            </div>
            <img
              src={process.env.REACT_APP_LOGO + `/${match.awayTeam.imageUrl}`}
              alt={match.awayTeam.name}
              className="team-logo"
            />
          </div>
        </div>
      </div>

     <div className='tabcontainer club-navbar'>
            <div
              className={`tabitem ${activeTab === 'Meci' ? 'active' : ''}`}
              onClick={() => setActiveTab('Meci')}
            >
                {t("games.match")}
            </div>
            <div
              className={`tabitem ${activeTab === 'Tactica' ? 'active' : ''}`}
              onClick={() => setActiveTab('Tactica')}
            >
                {t("games.tactics")}
            </div>
            <div
              className={`tabitem ${activeTab === 'Suporteri' ? 'active' : ''}`}
              onClick={() => setActiveTab('Suporteri')}
            >
                {t("games.supporters")}
            </div>
        </div>
        <div className='tabcontent'>
            {renderActiveComponent()}
        </div>
    </div>
  );
}

export default AnyMatch;
