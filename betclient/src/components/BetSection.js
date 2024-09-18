// src/components/BetSection.js

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import BetMatch from './BetMatch';
import LeagueIcon from '../assets/icons/icons8-league-64.png'
import { showNotification } from '../utils/NotificationMan.js';
import CoverImage from '../assets/covers/cover_bets.jpg';

const BetSectionContainer = styled.div`
  padding: 20px;
  background-color: #f4f4f4;

  @media (max-width: 768px) {
    padding: 10px; /* Less padding on smaller screens */
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 15px;
  flex-direction: column; /* Stack tabs vertically on mobile */

  @media (min-width: 769px) {
    flex-direction: row; /* Horizontal tabs on larger screens */
  }
`;

const TabItem = styled.div`
  cursor: pointer;
  padding: 10px;
  background-color: ${props => (props.active ? '#ddd' : '#fff')};
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-bottom: 5px; /* Margin for vertical stacking on mobile */

  @media (min-width: 769px) {
    margin-bottom: 0; /* Remove margin for horizontal tabs */
    margin-right: 5px;
  }
`;




const BetSection = () => {

  const [activeTab, setActiveTab] = useState('today');
  const [refresh, setRefresh] = useState(false); 
  const [userOptions,setUserOptions]=useState([]);
  const [bets,setBets]=useState([]);


  const token = localStorage.getItem('token');
  useEffect(() => {
    const fetchBets = async () => {
      try {
        const res = await fetch(process.env.REACT_APP_API + '/match/user-bets', {
          credentials: 'include',
          headers: {
            'x-auth-token': token  // Attach the token here
          },
        });
        const userBets = await res.json();
  
        
        // Pre-select user bets and include winCash and status
        const userOptionsFromDb = userBets.map(bet => ({
          userBetsId:bet._id,
          matchId: bet.matchId,
          option: bet.betOption,
          winCash: bet.winCash,
          status: bet.status
        }));
        setUserOptions(userOptionsFromDb);
       
  
        // Fetch the bets for the active day (today, tomorrow, etc.)
        fetch(process.env.REACT_APP_API + '/bets/date/' + activeTab, {
          credentials: 'include',
          headers: {
            'x-auth-token': token  // Attach the token here
          },
        }).then(res => {
          res.json().then(_bets => {
            setBets(_bets);
          });
        });
      } catch (err) {
        console.error(err);
        showNotification("danger", "Failed", "Error fetching user bets");
      }
    };
  
    fetchBets();
    // eslint-disable-next-line
  }, [refresh, activeTab]); // Ensure this runs when the tab changes or refresh state changes
  

const handleBetSelection = async (matchId, option, betAmount) => {
  try {
    const res = await fetch(process.env.REACT_APP_API + '/match/place-bet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token 
      },
      credentials: 'include', // To send cookies/session data
      body: JSON.stringify({ matchId, option, betAmount }), // Send matchId, option, and betAmount
    });

    const data = await res.json();
    console.log(data);
    if (res.ok) {
    
      showNotification("success", "Success", data.msg);
     
      // Update the user's bet selections (you can use this state for UI feedback)
      setUserOptions(prevOptions => {
        const existingOptionIndex = prevOptions.findIndex(
          (selection) => selection.matchId === matchId
        );

        if (existingOptionIndex !== -1) {
          // Update existing bet option
          const updatedOptions = [...prevOptions];
          updatedOptions[existingOptionIndex].option = option;
          console.log(updatedOptions);
          return updatedOptions;
        } else {
          // Add new selection
          return [...prevOptions, { matchId, option }];
        }
      });
    } else {
      showNotification("danger", "Failed", data.msg || "Error placing bet");
    }
  } catch (err) {
    console.error(err);
    showNotification("danger", "Failed", "Error placing bet");
  }
};

  return (<>
    <img src={CoverImage} alt='cover' className='cover_image_bets'/>
    <BetSectionContainer>
     
      <TabContainer>
        <div
          className={`tabitem ${activeTab === 'yesterday' ? 'active' : ''}`}
          onClick={() => {setActiveTab('yesterday');  setRefresh(prev => !prev);}}>Ieri</div>
        <div
          className={`tabitem ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => {setActiveTab('today');  setRefresh(prev => !prev);}}>Azi</div>
        <div
          className={`tabitem ${activeTab === 'tomorrow' ? 'active' : ''}`}
          onClick={() => {setActiveTab('tomorrow');  setRefresh(prev => !prev);}}>Maine</div>
      </TabContainer>
      <div  className='bet-section'>
        <h3> <img src={LeagueIcon} alt='league' className='app_icon'/>Meciuri</h3>

        {bets.length>0 && bets.map((bet, index) =>(
        <BetMatch
          key={bet._id}  // Ensure each match has a unique key
          matchId={bet._id}  // Pass match ID to BetMatch component
          team1={bet.hometeam}
          team2={bet.awayteam}
          status={bet.status}
          bet1={bet.bet1}
          bet2={bet.bet2}
          betx={bet.betx}
          time={bet.datetime}
          handleBetSelection={handleBetSelection}  // Pass the bet selection handler
          userOptions={userOptions}
        />
        ))}
      </div>
     
    </BetSectionContainer></>
  );
};

export default BetSection;
