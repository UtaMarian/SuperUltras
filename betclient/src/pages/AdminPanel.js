import React, { useState,useContext } from 'react';
import '../styles/admin.css'
import TeamComponent from './admin/TeamComponent';
import LeagueComponent from './admin/LeagueComponent';
import CountryComponent from './admin/CountryComponent';
import BetComponent from './admin/BetComponent';
import UserComponent from './admin/UserComponent';
import GamesPlayedComponent from './admin/GamesPlayedComponent';
import RankComponent from './admin/RankComponent';
import AuthContext from '../AuthContext';

function AdminPanel() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Bet');

  const renderActiveComponent = () => {
    switch (activeTab) {
        case 'Echipe':
            return <TeamComponent />;
        case 'Ligi':
            return <LeagueComponent />;
        case 'Tari':
            return <CountryComponent />;
        case 'Bet':
            return <BetComponent />;
        case 'User':
            return <UserComponent />;
        case 'GamesPlayed':
            return <GamesPlayedComponent />;
        case 'Rank':
            return <RankComponent />;
        default:
            return null;
    }
};

const isModerator = user?.user.role === 'moderator';
console.log(isModerator);
  return (
    <div className='adminpanel'>
        <div className='tabcontainer'>
        {!isModerator && (
          <>
            <div
              className={`tabitem ${activeTab === 'Echipe' ? 'active' : ''}`}
              onClick={() => setActiveTab('Echipe')}
            >
              Echipe
            </div>
            <div
              className={`tabitem ${activeTab === 'Ligi' ? 'active' : ''}`}
              onClick={() => setActiveTab('Ligi')}
            >
              Ligi
            </div>
            <div
              className={`tabitem ${activeTab === 'Tari' ? 'active' : ''}`}
              onClick={() => setActiveTab('Tari')}
            >
              Tari
            </div>
            <div
              className={`tabitem ${activeTab === 'Rank' ? 'active' : ''}`}
              onClick={() => setActiveTab('Rank')}
            >
              Rank
            </div>
            <div
              className={`tabitem ${activeTab === 'User' ? 'active' : ''}`}
              onClick={() => setActiveTab('User')}
            >
              Utilizatori
            </div>
            <div
              className={`tabitem ${activeTab === 'GamesPlayed' ? 'active' : ''}`}
              onClick={() => setActiveTab('GamesPlayed')}
            >
              Meciuri jucate
            </div>
          </>
        )}
        <div
          className={`tabitem ${activeTab === 'Bet' ? 'active' : ''}`}
          onClick={() => setActiveTab('Bet')}
        >
          Pariuri
        </div>
        </div>
        <div className='tabcontent'>
            {renderActiveComponent()}
        </div>
    </div>
  )
}

export default AdminPanel