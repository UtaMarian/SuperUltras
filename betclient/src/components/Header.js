// src/components/Header.js

import React, { useContext, useState } from 'react';
import AppIcons from '../assets/icons/icons8-league-64.png';
import AuthContext from '../AuthContext';
import MyBetsIcon from '../assets/icons/bet.png';
import '../styles/header.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/esm/Badge';
import { formatMoney } from '../utils/FormatMoney.js';
import { Navigate, useNavigate } from 'react-router-dom';



const Header = () => {
  const token = localStorage.getItem('token');
  const [userOptions,setUserOptions]=useState([]);
  const [show, setShow] = useState(false);
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate(); 

  if (loading) return <p>Loading...</p>;

  const handleClose = () => setShow(false);

  async function showMyBets(){
    try{
      const res = await fetch(process.env.REACT_APP_API + '/match/user-bets-with-matches', {
        credentials: 'include',
        headers: {
          'x-auth-token': token  // Attach the token here
        },
      });
      const userBets = await res.json();

      setUserOptions(userBets);
    }
    catch(e){

    }
    setShow(true);
  }

  function calculateWinCash(betCash, option,game) {
    let odds=1;
    if(option==="1"){
      odds=game.bet1;
    }else if(option==="2"){
      odds=game.bet2
    }
    else{
      odds=game.betx
    }
    return (betCash * odds).toFixed(2); 
    
  }

 function changeBetCash(value, id) {
    setUserOptions(prevOptions =>
      prevOptions.map(option => {
        if (option._id === id) {
          const newBetCash = parseFloat(value);
          const betOpion = option.betOpion; // Assuming odds are stored here

          const newWinCash = calculateWinCash(newBetCash, betOpion,option.matchId);
          
          return {
            ...option,
            betCash: newBetCash,
            winCash: newWinCash
          };
        }
        return option;
      })
    );
  }
  function goToProfile(){
      navigate('/profile'); 
      handleClose();
  }
  return (
    <div className="header-container">
      <div className="logo">
        <img src={AppIcons} alt="football" className='app_icon'/>
        <span className="button-text">SuperUltras</span></div>
        <div className="stats">
      
        <div>💵 {formatMoney(user?.user.cash)}</div>
        <div>⚽ {user?.user.coins}</div>
        <button className="my_bet_button" onClick={showMyBets}>
        <img src={MyBetsIcon} alt="my_bet" className="my_bet_icon" />
        <span className="button-text">Biletul meu</span>
      </button>
      </div>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Biletul meu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div className='mybet_body_match'>
          <div>STATUS</div>
          <div></div><div>ACASA</div><div></div> 
          <div>DEPLASARE</div><div></div> 
          <div>BET</div>
          <div>POTENTIAL</div>
        </div>
        {userOptions.length>0 && userOptions.map((bet, index) =>(
          <div className='mybet_body_match'>
            <div>{bet.matchId.status==='in_progress'? <Badge bg='success'>LIVE</Badge>: (bet.matchId.status==='finished'?  <Badge bg='danger'>Finished</Badge>: <Badge bg='warning'>Upcoming</Badge>)}</div>
            <div> <img src={process.env.REACT_APP_LOGO +`/${bet.matchId.hometeam.imageUrl}`} alt='logo' className='team_logo_modal'/></div> 
            <div className='hometeam_modal'>{bet.matchId.hometeam.name}  </div> 
            <div> - </div> 
            <div className='awayteam_modal'>{bet.matchId.awayteam.name}  </div> 
            <div > <img src={process.env.REACT_APP_LOGO +`/${bet.matchId.awayteam.imageUrl}`} alt='logo' className='team_logo_modal'/></div> 
           
            <div>
              <input disabled type='text' className='form-control'  value={bet.betCash} onChange={ev => changeBetCash(ev.target.value, bet._id)} />  
            </div>
            <div>{bet.winCash} 💵</div>
          </div>
        ))}
  
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Inchide
          </Button>
          <Button variant="primary" onClick={goToProfile}>
            Vezi predictiile mele
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Header;
