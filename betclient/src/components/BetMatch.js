import React, { useState } from 'react';
import styled from 'styled-components';
import '../styles/bets.css';
import Badge from 'react-bootstrap/Badge';
import { showNotification } from '../utils/NotificationMan';
import { formatMoney } from '../utils/FormatMoney.js';


const Team = styled.div`
  display: flex;
  align-items: center;
`;

const TeamName = styled.div`
  font-weight: bold;
  margin-right: 10px;
`;


const MatchContainer = styled.div`
  display: grid;
  grid-template-columns: 60px 80px 300px 100px 300px 60px 200px 80px;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 10px;
  border: 1px solid #ccc;
  margin-bottom: 5px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr; /* Stack columns for smaller screens */
    padding: 5px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr; /* Single column layout for very small screens */
  }
`;

const Options = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column; /* Stack options vertically on mobile */

  @media (min-width: 769px) {
    flex-direction: row; /* Horizontal options on larger screens */
  }
`;

const BetOption = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px; /* Margin for vertical stacking on mobile */
  padding: 5px 10px;
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'not-allowed')};
  background-color: ${({ isSelected }) => (isSelected ? '#68ac8c' : '#fff')};
  border: 1px solid #3333;
  border-radius: 3px;
  margin-right:5px;
  transition: background-color 0.3s ease;

  .optiontype {
    font-weight: bold;
    color: ${({ isSelected }) => (isSelected ? 'white' : 'black')};
  }
  .optionvalue {
    font-style: oblique;
    color: ${({ isSelected }) => (isSelected ? 'white' : 'black')};
  }

  &:hover {
    background-color: ${({ isClickable }) => (isClickable ? '#f0f0f0' : 'inherit')};
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 14px; /* Adjust font size */
  }
`;


const BetMatch = ({ matchId, team1, bet1, team2, bet2, betx, time, status, handleBetSelection, userOptions }) => {

  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Use 24-hour format
  };

  const [betAmount,setBetAmount]=useState(10);
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const formattedTime = formatter.format(new Date(time));

  const selectedUserBet = userOptions.find(bet => bet.matchId === matchId);

  // Check if the current match and option is selected
  const isSelected = (option) => {
    const selectedOption = userOptions.find(
      (selection) => selection.matchId === matchId && selection.option === option
    );
    
    return selectedOption !== undefined;
  };

  async function colectCash(id) {
    try{
          const token = localStorage.getItem('token');
         
          const res= await fetch(process.env.REACT_APP_API+'/games-played/colectcash/'+id,{
              method:'POST',
              credentials:'include',
              headers: {
                  'Content-Type': 'application/json',
                  'x-auth-token': token 
              },
          });
          const response= await res.json();
          if(res.ok){
              showNotification("success","Success","Banii au fost colectati");
          }
          else{
              showNotification("danger","EROARE",response.message);
          }
      
  }catch(err){
      showNotification("danger","EROARE",err);
  }
  }
  return (
    <MatchContainer>
      <div>{formattedTime}</div>
      <div>{status === "upcoming" ? "" : (status==="in_progress"?  <Badge bg="success">Live</Badge>:  <Badge bg="danger">Finished</Badge>)}</div>
      <Team>
       
        <img src={process.env.REACT_APP_LOGO + `/${team1.imageUrl}`} alt='logo' className='team_logo'/>
        <TeamName>{team1.name}</TeamName>
      </Team>
      <span>VS</span>
      <Team>
        <img src={process.env.REACT_APP_LOGO +`/${team2.imageUrl}`} alt='logo' className='team_logo'/>
        <TeamName>{team2.name}</TeamName>
      </Team>
      <div>{status === "upcoming" ?   <input type='text' className='form-control bet-amount-input'  value={betAmount} onChange={ev => setBetAmount(ev.target.value)} />
      :  <input type='text' disabled className='form-control bet-amount-input'/>} </div>
    
      <Options>
        <BetOption
          onClick={() => status === 'upcoming' && handleBetSelection(matchId, '1', betAmount)}  // Bet amount example: 10
          isSelected={isSelected('1')}
          isClickable={status === 'upcoming'}
        >
          <div className='optiontype'>1</div>
          <div className='optionvalue'>{bet1}</div>
        </BetOption>
        <BetOption
          onClick={() => status === 'upcoming' && handleBetSelection(matchId, 'X', betAmount)}  // Bet amount example: 10
          isSelected={isSelected('X')}
          isClickable={status === 'upcoming'}
        >
          <div className='optiontype'>X</div>
          <div className='optionvalue'>{betx}</div>
        </BetOption>
        <BetOption
          onClick={() => status === 'upcoming' && handleBetSelection(matchId, '2', betAmount)}  // Bet amount example: 10
          isSelected={isSelected('2')}
          isClickable={status === 'upcoming'}
        >
          <div className='optiontype'>2</div>
          <div className='optionvalue'>{bet2}</div>
        </BetOption>
      </Options>
       {/* Display the WinCash button if the bet status is 'colect' */}
       {selectedUserBet && selectedUserBet.status !== 'created' && (
        selectedUserBet.winCash>0 ?
        (selectedUserBet.status==="colect"?
          <button className='btn btn-success colect-button' onClick={()=>colectCash(selectedUserBet.userBetsId,true)}>
            {formatMoney(selectedUserBet.winCash)} 💵
          </button>
        :
        <button disabled className='btn btn-success colect-button' >
            {formatMoney(selectedUserBet.winCash)} 💵
          </button>
        )
       
        :
        <button disabled className='btn btn-danger colect-button-danger'>
         {formatMoney(selectedUserBet.winCash)} 💵
        </button>
      )}
    </MatchContainer>
  );
};

export default BetMatch;
