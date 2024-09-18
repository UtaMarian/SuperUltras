import React, { useState } from 'react'
import SoccerFormation from './SoccerFormation'
import '../../styles/profile.css';
import Trophies from './Trophies';
import Transfers from './Transfers';

function IndexClub() {

    const [activeTab, setActiveTab] = useState('Club');

  const renderActiveComponent = () => {
    switch (activeTab) {
        case 'Club':
            return <SoccerFormation />;
        case 'Trophies':
            return <Trophies />;
        case 'Transfers':
            return <Transfers />;
        default:
            return null;
    }
};
  return (
    <div>
        <div>
        <div className='profile-div'>
    <div className="profile-container">
      <div className="profile-header">
      <img src={process.env.REACT_APP_LOGO + `/teamslogo/5321336ae94e2864d43dd2e4acbb1762.png` } alt="Profile" className="club-team-picture" /> 
      
        <div className="profile-info">
          <h2 className="profile-username">
            <span className="country-flag">
              <img src={process.env.REACT_APP_LOGO + `/teamslogo/0c10963f4364ac6008e18bac42bc4681.png` } alt="Profile"/>
            </span>
            Petrolul Ploiest
          </h2>
          
        </div>
        <div className="favorite-team">
            <p>Manager:</p>
            <div className="team-info">
            <img src={process.env.REACT_APP_LOGO + `/userspicture/99f6a7b6a71f00375c2f7930b0d23a1d.jpg`} alt="manager" className="favorite-team-logo" />
            <span className="favorite-team-name">Marian</span>
            </div>
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
              Jucatori
            </div>
            <div
              className={`tabitem ${activeTab === 'Trophies' ? 'active' : ''}`}
              onClick={() => setActiveTab('Trophies')}
            >
              Trofee
            </div>
            <div
              className={`tabitem ${activeTab === 'Transfers' ? 'active' : ''}`}
              onClick={() => setActiveTab('Transfers')}
            >
              Transferuri
            </div>
        </div>
        <div className='tabcontent'>
            {renderActiveComponent()}
        </div>
    </div>
  )
}

export default IndexClub