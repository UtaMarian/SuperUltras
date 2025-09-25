import React, { useEffect, useState } from "react";
import "../../styles/match.css";
import MatchStats from "./MatchStats";
import { useTranslation } from "react-i18next";
import { Commet } from 'react-loading-indicators';
import Supporters from "./Supporters";

function IndexMatch() {
  const [match, setMatch] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [activeTab, setActiveTab] = useState('Meci');
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  const fetchMatch = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_API}/matches/next/my-team`,
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      }
    );

      if (res.ok) {
        const data = await res.json();
        setMatch(data);

        // countdown timer
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
    }

    useEffect(() => {
      fetchMatch();
    }, []);

  if (!match) return  <p>  
      <div className="flex items-center justify-center min-h-screen">
            <Commet color={["#4c106a", "#6b1697", "#8b1dc3", "#a632e1"]} />
          </div></p>;

  const renderActiveComponent = () => {
        switch (activeTab) {
            case 'Meci':
                return <MatchStats matchid={match._id} homeTeamName={match.homeTeam.name} awayTeamName={match.awayTeam.name}  onRefreshMatch={fetchMatch}/>;
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
      <div className="match-header ">
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
              <span className="stat supporters">⚽ {match.homeTeam.clubOvr}</span>
              <span className="stat supporters">🔥 {match.homeInfluence}</span>
            </div>
          </div>
        </div>

        {/* Center section */}
        <div className="match-center">
          
          <div className="timer">{timeLeft}</div>
        </div>

        {/* Away Team */}
        <div className="team team-right">
          <div className="team-info-container">
            <h3 >{match.awayTeam.name}</h3>
            <div className="team-stats">
              <span className="stat supporters">🔥 {match.awayInfluence}</span>
              <span className="stat supporters">⚽ {match.awayTeam.clubOvr}</span>
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

export default IndexMatch;
