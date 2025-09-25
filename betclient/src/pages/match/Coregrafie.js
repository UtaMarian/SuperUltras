import React, { useState } from 'react';
import '../../styles/coregrafie.css';
import Money from "../../assets/money.png";
import A from "../../assets/a.jpg";
import Color from "../../assets/color.png";
import IcoBall from '../../assets/soccer-ball.png';
import IcoConfetti from '../../assets/confetti.png';
import IcoTrophy from '../../assets/trophy.png';
import IcoMedal from '../../assets/gold-medal.png';
import IcoStadium from '../../assets/stadium.png';
import Coins from '../../assets/dollar.png';
import Fire from '../../assets/fire.gif';
import Ultra from '../../assets/ultra.gif';
import Roumnaia from '../../assets/romania-rou.gif';
import { useTranslation } from "react-i18next";

const flags = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R','S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
 '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const colors=['#da201e','#ef6d32','#fae137','#1f41a1','#1f569c','#2898d7','#0d7750','white','#08111a','#65398b','#832d36'];
const images=[IcoBall,IcoConfetti,IcoTrophy,IcoMedal,IcoStadium,Fire,Ultra,Roumnaia];
const moneyValues = {
    letter: 10,
    icon: 20,
    color: 15,
  };

// Componenta pentru Popup
const Popup = ({ isOpen, handleClose, handleCellClick, history }) => {
    if (!isOpen) {
      return null;
    }
  
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <button className="close-button btn btn-danger" onClick={handleClose}>X</button>
          <div className="grid">
          {flags.map((letter, index) => (
            <GridCell
              key={index}
              value={letter}
              type="letter"
              handleClick={() => handleCellClick(letter,'letter')}
            />
          ))}
           {colors.map((col, index) => (
            <GridCellColor
              key={index}
              value={col}
              type="color"
              handleClick={() => handleCellClick(col,'color')}
            />
          ))}
           {images.map((col, index) => (
            <GridCellImage
              key={index}
              value={col}
              type="icon"
              handleClick={() => handleCellClick(col,'icon')}
            />
          ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Componenta pentru celula din grid
  const GridCell = ({ value, handleClick }) => {
    return (
      <div className="cell">
        <button className="cell-button" onClick={handleClick}>{value}</button>
      </div>
    );
  };
  
  const GridCellColor = ({ value, handleClick }) => {
    return (
      <div className="cell">
        <button className="cell-button" onClick={handleClick} style={{ backgroundColor: value }}></button>
      </div>
    );
  };
  const GridCellImage = ({ value, handleClick }) => {
    return (
      <div className="cell">
        <button className="cell-button" onClick={handleClick}>
            <img src={value} alt='img-grid' className='img-grid'/>
        </button>
      </div>
    );
  };
function Coregrafie({matchid, onSaved }) {
    const { t } = useTranslation();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [moneyTicket,setMoneyTicket] = useState(0);
    const handleBuyTicket = () => {
      setIsPopupOpen(true);
    };
  
    const handleClosePopup = () => {
      setIsPopupOpen(false);
    };
  
    const handleCellClick = (value,type) => {
      setHistory((history) => [...history, value]);
      setMoneyTicket((moneyTicket) => moneyTicket + moneyValues[type]);
    };
    const handleClearHistory = () => {
        setHistory([]);
        setMoneyTicket(0);
      };
    const handleSaveChoreography = async () => {
      const token = localStorage.getItem("token");
      const matchId = matchid; // îl trimiți din props sau context

      try {
        const res = await fetch(`${process.env.REACT_APP_API}/choreographies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            matchId,
            history,
            moneyTicket,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setHistory([]);
          setMoneyTicket(0);
          console.log(data);
          if (onSaved) onSaved();
        } else {
          const errData = await res.json();
          alert("Eroare: " + errData.message);
        }
      } catch (err) {
        console.error(err);
        alert("Eroare server");
      }
    };

    return (
      <div className="App-coregrafie">
        <div>
            <div className='horizontal-div'>
            <button className="btn btn-danger clear-history" onClick={handleClearHistory}>
            {t("games.clear")}
            </button>
        
            <button className="btn btn-warning buy-button" onClick={handleBuyTicket}>
             {t("games.ticket")}
            </button>
      
        
                <div className='flex'>
                    <img src={A} alt="home-team" className='money-icon a-letter' />
                    = 10 
                    <img src={Money} alt="home-team" className='money-icon' />
                </div>
                <div className='flex'>
                    <img src={Color} alt="home-team" className='money-icon' />
                    = 15 
                    <img src={Money} alt="home-team" className='money-icon' />
                </div >
                <div className='flex'>
                    <img src={IcoTrophy} alt="home-team" className='money-icon' />
                    = 20 
                    <img src={Money} alt="home-team" className='money-icon' />
                </div>
        
         <div>
            <button type='button' className='btn btn-success money-btn flex' onClick={handleSaveChoreography}>
            {moneyTicket}<img src={Money} alt="home-team" className='money-icon' />
            </button>
        </div>
         </div></div> 
        <Popup
          isOpen={isPopupOpen}
          handleClose={handleClosePopup}
          handleCellClick={handleCellClick}
          history={history}
        />
  
        <div className="history">
        {history.map((value, index) => {
          if (value.length === 1) {
           
            return (
              <div className="letter" key={index}>
                {value}
              </div>
            );
          } else if(value.includes('png') || value.includes('jpg') || value.includes('jpeg') || value.includes('gif')) {
            
            return (
            <div className="letter" key={index}>
                 <img src={value} alt='icon' className='icon'/>
              </div>
            );
          } 
          else {
          
            return (
                <div className="color" key={index} style={{ backgroundColor: value }}></div>
            );
          }
        })}
        </div>
       
      </div>
    );
  };
  
export default Coregrafie
