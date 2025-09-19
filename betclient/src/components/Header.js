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
import BallIcon from '../assets/icons/training.png';


const Header = () => {
  const token = localStorage.getItem('token');
  const { user, isAuthenticated, loading } = useContext(AuthContext);


  if (loading) return <p>Loading...</p>;

  return (
    <div className="header-container">
      <div className="logo">
        <img src={AppIcons} alt="football" className='app_icon'/>
        <span className="button-text">SuperUltras</span></div>
        <div className="stats text-white text-xl">
      
        <div title="Player money">💵 {formatMoney(user?.user.cash)}</div>
        <div title="Player coins">🪙 {user?.user.coins}</div>
        <div className="flex ml-1" title="Training points">
          <img src={BallIcon} className="w-7 " alt="train"/>
          <span className='text-white ml-1'>{user?.user.trainingPoints}</span>
        </div>
        <div className="table-player-level " title="Player Level">
          {user?.user.level}
        </div>

      </div>
    </div>
  );
};

export default Header;
