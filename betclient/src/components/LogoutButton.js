// src/components/LogoutButton.js
import React, { useContext } from 'react';
import AuthContext from '../AuthContext';
import styled from 'styled-components';
import LogoutIcon from '../assets/icons/logout.png'

const Button = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);

  return (
    <Button onClick={logout}>
        <img src={LogoutIcon} alt='league' className='navbar_icon'/>
      Logout
    </Button>
  );
};

export default LogoutButton;
