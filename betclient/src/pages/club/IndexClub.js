import React, { useContext, useEffect, useState } from 'react'
import SoccerFormation from './SoccerFormation'
import '../../styles/profile.css';
import Trophies from './Trophies';
import Transfers from './Transfers';
import { Commet } from 'react-loading-indicators';
import { useParams } from "react-router-dom";
import AuthContext from '../../AuthContext';
import { useTranslation } from "react-i18next";
import VoteManagerModal from './VoteManagerModal';
import PollModal from './PollModal';

function IndexClub() {
    const { id } = useParams();
    const clubid=id;
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('Club');
    const [team, setTeam] = useState(null);
    const { user } = useContext(AuthContext);
    const [isVoteModalOpen, setVoteModalOpen] = useState(false);
    
    const token = localStorage.getItem('token');

   useEffect(() => {
      const fetchTeam = async () => {
        
        try {
          let url;
          if (!clubid) {
            // cazul vechi - clubul propriu
            url = `${process.env.REACT_APP_API}/club/my-team-info`;
          } else {
            // cazul nou - clubul primit prin prop
            url = `${process.env.REACT_APP_API}/club/${clubid}/info`;
          }

          const res = await fetch(url, {
            credentials: 'include',
            headers: { 
              'Content-Type': 'application/json',
              'x-auth-token': token 
            }
          });
          const data = await res.json();
         
          setTeam(data.team);
        } catch (err) {
          console.error(err);
        }
      };

      fetchTeam();
    }, [clubid]);

 
   
  const renderActiveComponent = () => {
    switch (activeTab) {
        case 'Club':
            return <SoccerFormation club={team}/>;
        case 'Trophies':
            return <Trophies teamid={team._id}/>;
        case 'Transfers':
            return <Transfers />;
        default:
            return null;
    }
};


  return (
    
  <div> 
    {!team? (
    <div className="flex items-center justify-center min-h-screen">
      <Commet color={["#4c106a", "#6b1697", "#8b1dc3", "#a632e1"]} />
    </div>)
    :(<>
    <div>
      <div className='profile-div'>
        <div className="profile-container">
          <div className="profile-header flex items-center justify-between">
            {/* Stânga: poza și info echipă */}
            <div className="flex items-center">
              <img
                src={process.env.REACT_APP_LOGO + `/${team.imageUrl}`}
                alt="Profile"
                className="club-team-picture mr-4"
              />
              <div className="profile-info">
                <h2 className="profile-username">{team.name}</h2>
                {team.manager && (
                  <div className="favorite-team flex items-center mt-1">
                    <p className="mr-2">{t("club.manager")}:</p>
                    <div className="team-info-box flex items-center">
                      <img
                        src={process.env.REACT_APP_LOGO + `/${team.manager.profilePicture}`}
                        alt="manager"
                        className="favorite-team-logo mr-2"
                      />
                      <span className="favorite-team-name">{team.manager.username}</span>
                    </div>
                    
                  </div>
                )}
              </div>
            </div>

            {/* Dreapta: butoane */}
            <div className="flex space-x-2">
              {team?.manager&& (team.manager._id===user.user.id)?
              <>
                <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  {t("club.changemanager")}
                </button>
                <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                  {t("club.kickplayer")}
                </button>
              </>
              :<></>}
          
              {team && team._id === user.user.favoriteTeam ? (
                <button
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() =>  setVoteModalOpen(true)}
                >
                  {t("club.votemanager")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className='tabcontainer club-navbar'>
      <div
        className={`tabitem ${activeTab === 'Club' ? 'active' : ''}`}
        onClick={() => setActiveTab('Club')}
      >
        {t("club.players")}
      </div>
      <div
        className={`tabitem ${activeTab === 'Trophies' ? 'active' : ''}`}
        onClick={() => setActiveTab('Trophies')}
      >
        {t("club.trophies")}
      </div>
      <div
        className={`tabitem ${activeTab === 'Transfers' ? 'active' : ''}`}
        onClick={() => setActiveTab('Transfers')}
      >
        {t("club.transfers")}
      </div>
    </div>
    <div className='tabcontent'>
        {renderActiveComponent()}
    </div>
    <VoteManagerModal
      isOpen={isVoteModalOpen}
      onClose={() => setVoteModalOpen(false)}
      clubId={team._id}
    />

   
   </>)}
  </div>
    
  )
}

export default IndexClub