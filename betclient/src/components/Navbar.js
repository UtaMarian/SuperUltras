import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../AuthContext';
import HomeIcon from '../assets/icons/icons8-home-48.png';
import BetIcon from '../assets/icons/icons8-bet-on-sport-48.png';
import LeagueIcon from '../assets/icons/football.png';
import ProfileIcon from '../assets/icons/soccer-player.png';
import AdminIcon from '../assets/icons/icons8-security-configuration-48.png';
import LogoutIcon from '../assets/icons/logout.png';
import '../styles/navbar.css';
import NavbarIcon from '../assets/icons/menu-bar.png';
import TrainingIcon from '../assets/icons/training.png'
import GameIcon from '../assets/icons/stadium.png'
import ClubIcon from '../assets/icons/team-badge.png'
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const { user, logout } = useContext(AuthContext);
  //const hasAdminAccess = user?.user.role?.includes('admin') || user?.user.role?.includes('moderator');
  const isAdmin =user?.user.role?.includes('admin');
  const isModerator= user?.user.role?.includes('moderator');
  const token = localStorage.getItem("token");
  const currentUserId = token ? jwtDecode(token).id : null;
  return (
    <nav className="navbar-container">
    
      <div className={`nav-menu ${isOpen ? 'open' : ''}`}>
        <div className="nav-item">
          <Link to="/" onClick={toggleMenu}>
            <img src={HomeIcon} alt="home" className="navbar_icon" />
            {t("navbar.home")}
          </Link>
        </div>
        <div className="nav-item">
          <Link to="/bets" onClick={toggleMenu}>
            <img src={BetIcon} alt="bets" className="navbar_icon" />
            {t("navbar.bets")}
          </Link>
        </div>
         <div className="nav-item">
          <Link to="/match" onClick={toggleMenu}>
            <img src={GameIcon} alt="leagues" className="navbar_icon" />
            {t("navbar.match")}
          </Link>
        </div>
        <div className="nav-item">
          <Link to="/leagues" onClick={toggleMenu}>
            <img src={LeagueIcon} alt="leagues" className="navbar_icon" />
            {t("navbar.leagues")}
          </Link>
        </div>
        <div className="nav-item">
          <Link to="/club" onClick={toggleMenu}>
            <img src={ClubIcon} alt="club" className="navbar_icon" />
            {t("navbar.club")}
          </Link>
        </div>
        <div className="nav-item">
          <Link to="/training" onClick={toggleMenu}>
            <img src={TrainingIcon} alt="profile" className="navbar_icon" />
            {t("navbar.training")}
          </Link>
        </div>
         <div className="nav-item">
          <Link to="/profile/" onClick={toggleMenu}>
            <img src={ProfileIcon} alt="profile" className="navbar_icon" />
            {t("navbar.profile")}
          </Link>
        </div>
        {isAdmin && (
        <div className="nav-item">
          <Link to="/admin" onClick={toggleMenu}>
            <img src={AdminIcon} alt="admin" className="navbar_icon" />
            {t("navbar.admin")}
          </Link>
        </div>)}
        {isModerator && (
        <div className="nav-item">
          <Link to="/admin" onClick={toggleMenu}>
            <img src={AdminIcon} alt="admin" className="navbar_icon" />
            {t("navbar.moderator")}
          </Link>
        </div>)}
        <div className="nav-item">
          <Link onClick={logout}>
            <img src={LogoutIcon} alt="logout" className="navbar_icon" />
            {t("navbar.logout")}
          </Link>
        </div>
      </div>
      <div className="nav-toggle" onClick={toggleMenu}>
      <img src={NavbarIcon} alt="toggle" className="navbar_icon" />
      </div>
    </nav>
  );
};

export default Navbar;
