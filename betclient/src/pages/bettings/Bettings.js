import React, { useContext, useEffect, useState } from 'react';
import LeagueIcon from '../../assets/icons/icons8-league-64.png';
import CoverImage from '../../assets/covers/cover_bets.jpg';
import Badge from 'react-bootstrap/Badge';
import { showNotification } from '../../utils/NotificationMan';
import '../../styles/bets.css';
import AuthContext from '../../AuthContext';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const Bettings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('today');
  const [refresh, setRefresh] = useState(false);
  const [userOptions, setUserOptions] = useState([]); 
  const [userBet, setUserBet] = useState([]);
  const [betsByLeague, setBetsByLeague] = useState([]);
  const token = localStorage.getItem('token');
  const { loadUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pariurile userului
        const res = await fetch(process.env.REACT_APP_API + '/predictions/user-bets', {
          credentials: 'include',
          headers: { 'x-auth-token': token },
        });
        const userBets = await res.json();
        setUserOptions(userBets.map(bet => ({
          matchId: bet.matchId._id,   // ia doar id-ul meciului
          option: bet.betOption,
        })));
        setUserBet(userBets);
        

        // Meciurile grupate pe ligă pentru tab-ul activ
        const betRes = await fetch(process.env.REACT_APP_API + `/leagues/matches/${activeTab}`, {
          credentials: 'include',
          headers: { 'x-auth-token': token },
        });
        const _betsGrouped = await betRes.json();

        // Sortăm meciurile fiecărei ligi după dată
        const sortedBetsGrouped = _betsGrouped.map(group => ({
          ...group,
          matches: group.matches.sort((a, b) => new Date(a.date) - new Date(b.date))
        }));

        setBetsByLeague(sortedBetsGrouped);

      } catch (err) {
        console.error(err);
        showNotification("danger", "Failed", "Error fetching bets");
      }
    };

    fetchData();
  }, [refresh, activeTab, token]);

  const handlePlaceBet = async (matchId, option) => {
    try {
      const res = await fetch(process.env.REACT_APP_API + '/predictions/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        credentials: 'include',
        body: JSON.stringify({
          matchId,
          option,
          betCash: 10,
          winCash: 20,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        loadUser();
        showNotification("success", "Success", data.msg);
        setRefresh(prev => !prev);
      } else {
        showNotification("danger", "Failed", data.msg || "Error placing bet");
      }
    } catch (err) {
      console.error(err);
      showNotification("danger", "Failed", "Error placing bet");
    }
  };

  const isSelected = (matchId, option) => {
    return userOptions.some(sel => sel.matchId === matchId && sel.option === option);
  };


   const colectCash = async (id) => {
    try {
      const res = await fetch(process.env.REACT_APP_API + '/games-played/colectcash/' + id, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });
      const response = await res.json();
      if (res.ok) {
        loadUser();
        showNotification("success", "Success", "Banii au fost colectati");
      } else {
        showNotification("danger", "EROARE", response.message);
      }
    } catch (err) {
      showNotification("danger", "EROARE", err.message);
    }
  };


  return (
    <>
      <div className="bet-section-container">
        {/* Tabs pentru ieri/azi/maine */}
        <div className="tab-container">
          <div className={`tabitem ${activeTab === 'yesterday' ? 'active' : ''}`} 
               onClick={() => { setActiveTab('yesterday'); setRefresh(prev => !prev); }}>{t("bettings.yesterday")}</div>
          <div className={`tabitem ${activeTab === 'today' ? 'active' : ''}`} 
               onClick={() => { setActiveTab('today'); setRefresh(prev => !prev); }}>{t("bettings.today")}</div>
          <div className={`tabitem ${activeTab === 'tomorrow' ? 'active' : ''}`} 
               onClick={() => { setActiveTab('tomorrow'); setRefresh(prev => !prev); }}>{t("bettings.tomorow")}</div>
        </div>

        <div className="bet-section">
          

          {betsByLeague.length === 0 ? (
            <div className='no_betting_games'>{t("bettings.nogames")}</div>
          ) : (
            betsByLeague.map(group => (
              <>
              
              <div key={group.league._id} className="league-block">
                <h3 className="league-title">{group.league.name}</h3>

                {group.matches.map((bet, index) => (
                    <motion.div
    key={bet._id}
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
    className="match-container-bets"
    style={{ cursor: "pointer" }}
    onClick={() => navigate(`/match/${bet._id}`)}
  >
                  
                    <div>{new Date(bet.date).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div>
                      {bet.status === 'scheduled' && <Badge bg="warning">Scheduled</Badge>}
                      {bet.status === 'in_progress' && <Badge bg="success">Live</Badge>}
                      {bet.status === 'finished' && <Badge bg="danger">Finished</Badge>}

                    </div>

                    {/* Echipe */}
                  <div className="team">
                    <img src={process.env.REACT_APP_LOGO + `/${bet.homeTeam.imageUrl}`} alt="team1_logo" className="team_logo" />
                    <div className="team_name">{bet.homeTeam.name}</div>
                  </div>

                  
                    {bet.status === 'finished' 
                      ? <p className='team_score'>{bet.score.home} </p>
                      :  <div className="team_influence">{bet.homeInfluence}🔥</div>
                    }
                 

                  <span>VS</span>

                  {bet.status === 'finished' 
                      ? <p className='team_score'>{bet.score.away} </p>
                      :  <div className="team_influence">{bet.awayInfluence}🔥</div>
                  }

                  <div className="team">
                    <img src={process.env.REACT_APP_LOGO + `/${bet.awayTeam.imageUrl}`} alt="team2_logo" className="team_logo" />
                    <div className="team_name">{bet.awayTeam.name}</div>
                  </div>

                    {/* Opțiuni 1/X/2 */}
                   <div
                    className={`bet-option ${isSelected(bet._id, '1') ? 'selected' : ''}`}
                    onClick={(e) => {
                    e.stopPropagation(); // oprește click-ul să se transmită containerului
                    if (bet.status === 'scheduled') handlePlaceBet(bet._id, '1');
                  }}
                  >
                    <div className="option-type">1</div>
                  </div>

                  <div
                    className={`bet-option ${isSelected(bet._id, 'X') ? 'selected' : ''}`} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (bet.status === 'scheduled') handlePlaceBet(bet._id, 'X');
                    }}
                  >
                    <div className="option-type">X</div>
                  </div>

                  <div
                    className={`bet-option ${isSelected(bet._id, '2') ? 'selected' : ''}`} 
                   onClick={(e) => {
                      e.stopPropagation();
                      if (bet.status === 'scheduled') handlePlaceBet(bet._id, '2');
                    }}
                  >
                    <div className="option-type">2</div>
                  </div>
                     {/* 🔹 Buton colectare */}
                {/* 🔹 Buton colectare */}
                <div className="responsive_trash">
                  {(() => {
                    const currentBet = userBet.find(ub => ub.matchId._id === bet._id); // pariul userului pt acest meci
                    if (!currentBet) return null; // dacă nu are bet pe meciul ăsta

                     // Debug: afișează pariul curent în consolă
                    return currentBet.winCash > 0 ? (
                      currentBet.status === "colect" ? (
                        <button
                          className="btn btn-success colect-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            colectCash(currentBet._id); // trimitem id-ul pariului
                          }}
                        >
                          {currentBet.winCash} 💵
                        </button>
                      ) : currentBet.status === "created" ? (
                        <button disabled className="btn btn-warning colect-button">
                          {currentBet.winCash} 💵
                        </button>
                      ) : (
                        <button disabled className="btn btn-success colect-button">
                          {currentBet.winCash} 💵
                        </button>
                      )
                    ) : (
                      <button disabled className="btn btn-danger colect-button-danger">
                        {currentBet.winCash} 💵
                      </button>
                    );
                  })()}
                </div>

                 
                  </motion.div>
                  
                ))}
              </div>
              
              </>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Bettings;
