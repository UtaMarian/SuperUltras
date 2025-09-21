import React, { useEffect, useState } from 'react';
import { showNotification } from '../../utils/NotificationMan.js';
import '../../styles/leagues.css';
import BarLoader from 'react-spinners/BarLoader';
import ChampionsKnockout from './ChampionsKnockout.js';
import {Commet} from 'react-loading-indicators'
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function IndexLeague() {
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("standings");
  const [leagueName, setLeagueName] = useState("");
  const [activeLeagues, setActiveLeagues] = useState([]); // pentru dropdown
  const [selectedLeague, setSelectedLeague] = useState(null); // liga curentă
  const [selectedLeagueData, setSelectedLeagueData] = useState(null);
  const token = localStorage.getItem("token");
  const [lastMatches, setLastMatches] = useState({});
   const { t } = useTranslation();
const navigate = useNavigate();

  // Fetch active leagues on mount
  useEffect(() => {
  async function fetchInitialData() {
    try {
      setLoading(true);

      // 🔹 1. Liga userului curent (ca până acum)
      const resStandings = await fetch(`${process.env.REACT_APP_API}/leagues/standings`, {
        credentials: "include",
        headers: { "x-auth-token": token }
      });
      const standingsData = await resStandings.json();
      setLeagueName(standingsData.league);
      setStandings(standingsData.standings);

      const resMatches = await fetch(`${process.env.REACT_APP_API}/leagues/matches/current`, {
        credentials: "include",
        headers: { "x-auth-token": token }
      });
      const matchesData = await resMatches.json();

      const groupedMatches = {};
      matchesData.matches.forEach(match => {
        if (!groupedMatches[match.stage]) groupedMatches[match.stage] = [];
        groupedMatches[match.stage].push(match);
      });
      setMatches(groupedMatches);

    


      // 🔹 2. Active leagues pentru dropdown
      const resLeagues = await fetch(`${process.env.REACT_APP_API}/leagues/active`, {
        credentials: "include",
        headers: { "x-auth-token": token }
      });
      const leaguesData = await resLeagues.json();
      setActiveLeagues(leaguesData);

      const initialLeagueId =leaguesData[0]._id
        // Fetch form pentru echipe
      const resForm = await fetch(`${process.env.REACT_APP_API}/teams/form/${initialLeagueId}`, {
        credentials: "include",
        headers: { "x-auth-token": token }
      });
      const formData = await resForm.json();
      setLastMatches(formData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  fetchInitialData();
}, [token]);


  async function handleLeagueChange(e) {
      const leagueId = e.target.value;
      setSelectedLeague(leagueId);

      try {
        setLoading(true);

        // găsește liga selectată din lista de activeLeagues
        const league = activeLeagues.find(l => l._id === leagueId);
        setSelectedLeagueData(league);
        

        if (league.leagueType === 'cup') {
          // aici poți doar să setezi id-ul pentru ChampionsKnockout
          setSelectedLeagueData(league);
          return; // nu mai faci fetch pentru standings/matches normale
        }

        // Fetch standings pentru league de tip league
        const resStandings = await fetch(`${process.env.REACT_APP_API}/leagues/${leagueId}/standings`, {
          credentials: "include",
          headers: { "x-auth-token": token }
        });
        const standingsData = await resStandings.json();
        setLeagueName(standingsData.league);
        setStandings(standingsData.standings);

        // Fetch matches
        const resMatches = await fetch(`${process.env.REACT_APP_API}/leagues/${leagueId}/matches`, {
          credentials: "include",
          headers: { "x-auth-token": token }
        });
        const matchesData = await resMatches.json();

        const groupedMatches = {};
        matchesData.matches.forEach(match => {
          if (!groupedMatches[match.stage]) groupedMatches[match.stage] = [];
          groupedMatches[match.stage].push(match);
        });
        setMatches(groupedMatches);


          // Fetch form pentru echipe
      const resForm = await fetch(`${process.env.REACT_APP_API}/teams/form/${leagueId}`, {
        credentials: "include",
        headers: { "x-auth-token": token }
      });
      const formData = await resForm.json();
      setLastMatches(formData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

  return (
    <div className='index-league-container'>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Commet color={["#4c106a", "#6b1697", "#8b1dc3", "#a632e1"]} />
        </div>
      ) : (
        <>
          <div className="tabs-with-select">
  <div className="tabs">
    <button
      className={`tab-btn tabitem ${activeTab === 'standings' ? 'active' : ''}`}
      onClick={() => setActiveTab('standings')}
    >
        {t("standings.standings")}
    </button>
    <button
      className={`tab-btn tabitem ${activeTab === 'matches' ? 'active' : ''}`}
      onClick={() => setActiveTab('matches')}
    >
      {t("standings.matches")}
    </button>
  </div>

  <select className="league-select tabitem" onChange={handleLeagueChange} value={selectedLeague || ""}>
    <option value="">{t("standings.yourleague")} ({leagueName})</option>
    {activeLeagues.map(league => (
      <option key={league._id} value={league._id}>
        {league.name}
      </option>
    ))}
  </select>
</div>
{selectedLeagueData?.leagueType  === 'cup' ? (
  <ChampionsKnockout tournamentId={selectedLeagueData._id} />
) : (
  <>

          {/* Standings Table */}
          {activeTab === 'standings' && (
            <table className="table table-hover table-league">
              <thead className='table-head-league'>
                <tr className='table-head-league'>
                  <th>#</th>
                  <th>{t("standings.team")}</th>
                  <th>{t("standings.form")}</th>
                  <th>{t("standings.played")}</th>
                  <th>{t("standings.wins")}</th>
                  <th>{t("standings.draws")}</th>
                  <th>{t("standings.losses")}</th>
                  <th>{t("standings.points")}</th>
                </tr>
              </thead>
              <tbody>
  {standings.length > 0 ? (
    standings.map((team, index) => {
      let rowClass = "";
      if (index < 2) rowClass = "green-row";          // top 4
      else if (index < 4) rowClass = "blue-row";   
      else if (index < 8) rowClass = "yellow-row";  // next 2
      else if (index >= standings.length - 2) rowClass = "red-row"; // last

      return (
        <tr key={team._id} className={rowClass}>
          <td>{index + 1}</td>
          <td className="team-cell-logo" onClick={() => navigate(`/club/${team._id}`)} style={{cursor:'pointer'}} >
            {team.imageUrl && (
              <img
                src={process.env.REACT_APP_LOGO + `/${team.imageUrl}`}
                alt={team.name}
                className="team_logo"
              />
            )}
            {team.name}
          </td>
           <td className='responsive_hidden'>
              <div className='user_bets_form'>
                    {lastMatches[team._id] && lastMatches[team._id].form ? (
          lastMatches[team._id].form.map((res, i) => (
            <div 
              key={i} 
              className={
                res === 'W' ? 'W' : res === 'D' ? 'D' : 'L'
              }
            >
              {res}
            </div>
          ))
        ) : (
          <div>-</div>
        )}
              </div>
            </td>
          <td>{team.played}</td>
          <td>{team.wins}</td>
          <td>{team.draws}</td>
          <td>{team.losses}</td>
          <td>{team.points}</td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="7">{t("standings.noleague")}</td>
    </tr>
  )}
</tbody>

            </table>
          )}

          {/* Matches Table */}
          {activeTab === 'matches' && (
            <>
              {Object.keys(matches).length > 0 ? (
                Object.keys(matches).sort((a,b) => a-b).map(stage => (
                  <div key={stage} className="stage-group">
                    <h5 className='match-tab'>{t("standings.stage")} {stage}</h5>
                    <table className="table table-hover table-league">
                      <thead>
                        <tr>
                          <th>{t("date")}</th>
                          <th>{t("home")}</th>
                          <th>{t("away")}</th>
                          <th>{t("standings.score")}</th>
                          <th>{t("standings.status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches[stage].map(match => (
                          <tr key={match._id}>
                            <td>{new Date(match.date).toLocaleDateString()}</td>
                            <td>{match.homeTeam?.name}</td>
                           
                            <td>{match.awayTeam?.name}</td>
                             <td className='matches_score'><div>{match.score ? `${match.score.home} - ${match.score.away}` : '-'}</div></td>
                            <td>{match.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <p>No matches available</p>
              )}
            </>
          )}
          </>
)}
        </>
      )}
    </div>
  );
}

export default IndexLeague;
