import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../AuthContext';
import HomeIcon from '../assets/icons/icons8-home-48.png';
import BetIcon from '../assets/icons/icons8-bet-on-sport-48.png';
import LeagueIcon from '../assets/icons/icons8-league-64.png';
import ProfileIcon from '../assets/icons/icons8-admin-settings-male-48.png';
import AdminIcon from '../assets/icons/icons8-security-configuration-48.png';
import LogoutIcon from '../assets/icons/logout.png';
import '../styles/navbar.css';
import NavbarIcon from '../assets/icons/menu-bar.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const { user, logout } = useContext(AuthContext);
  //const hasAdminAccess = user?.user.role?.includes('admin') || user?.user.role?.includes('moderator');
  const isAdmin =user?.user.role?.includes('admin');
  const isModerator= user?.user.role?.includes('moderator');
  return (
    <nav className="navbar-container">
      <div className="nav-item"  >
        <Link to="/">SuperUltras</Link>  {/* Replace with your logo or text */}
      </div>
      <div className={`nav-menu ${isOpen ? 'open' : ''}`}>
        <div className="nav-item">
          <Link to="/" onClick={toggleMenu}>
            <img src={HomeIcon} alt="home" className="navbar_icon" />
            Acasă
          </Link>
        </div>
        <div className="nav-item">
          <Link to="/bets" onClick={toggleMenu}>
            <img src={BetIcon} alt="bets" className="navbar_icon" />
            Predicții
          </Link>
        </div>
        <div className="nav-item">
          <Link to="/leagues" onClick={toggleMenu}>
            <img src={LeagueIcon} alt="leagues" className="navbar_icon" />
            Clasament
          </Link>
        </div>
        <div className="nav-item">
          <Link to="/profile" onClick={toggleMenu}>
            <img src={ProfileIcon} alt="profile" className="navbar_icon" />
            Profil
          </Link>
        </div>
        {isAdmin && (
        <div className="nav-item">
          <Link to="/admin" onClick={toggleMenu}>
            <img src={AdminIcon} alt="admin" className="navbar_icon" />
            Admin
          </Link>
        </div>)}
        {isModerator && (
        <div className="nav-item">
          <Link to="/admin" onClick={toggleMenu}>
            <img src={AdminIcon} alt="admin" className="navbar_icon" />
            Moderator
          </Link>
        </div>)}
        <div className="nav-item">
          <Link onClick={logout}>
            <img src={LogoutIcon} alt="logout" className="navbar_icon" />
            Logout
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
