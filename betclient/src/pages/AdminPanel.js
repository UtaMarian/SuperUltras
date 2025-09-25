import React, { useState,useContext } from 'react';
import '../styles/admin.css'
import TeamComponent from './admin/TeamComponent';
import LeagueComponent from './admin/LeagueComponent';
import CountryComponent from './admin/CountryComponent';
import UserComponent from './admin/UserComponent';
import RankComponent from './admin/RankComponent';
import AuthContext from '../AuthContext';
import UltrasLeagueAdminComponent from './admin/UltrasLeagueAdmin';
import EventComponent from './admin/EventComponent';

function AdminPanel() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Ligi');

  const renderActiveComponent = () => {
    switch (activeTab) {
        case 'Echipe':
            return <TeamComponent />;
        case 'Ligi':
            return <LeagueComponent />;
        case 'Tari':
            return <CountryComponent />;
        case 'User':
            return <UserComponent />;
        case 'Rank':
            return <RankComponent />;
        case 'GenerateCup':
            return <UltrasLeagueAdminComponent />;
        case 'Event':
            return <EventComponent />;
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
       
          </>
        )}
    
        <div
          className={`tabitem ${activeTab === 'GenerateCup' ? 'active' : ''}`}
          onClick={() => setActiveTab('GenerateCup')}
        >
          Generate Cup
        </div>
        <div
          className={`tabitem ${activeTab === 'Event' ? 'active' : ''}`}
          onClick={() => setActiveTab('Event')}
        >
          Events
        </div>
        </div>
        <div className='tabcontent'>
            {renderActiveComponent()}
        </div>
    </div>
  )
}

export default AdminPanel