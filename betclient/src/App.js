// src/App.js

import React from 'react';
import {Routes,Route} from 'react-router-dom';
import styled from 'styled-components';
import './App.css';

import BetSection from './components/BetSection';
import AdminPanel from './pages/AdminPanel';
import Layout from './pages/Layout';
import Homepage from './pages/homepage/Homepage';
import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import LogoutButton from './components/LogoutButton';
import IndexLeague from './pages/standings/IndexLeague';
import Profile from './pages/profile/Profile';
import Bettings from './pages/bettings/Bettings';

const AppContainer = styled.div`
  font-family: Arial, sans-serif;
  background-color: #e0e0e0;
`;

function App() {
  return (
    <AuthProvider>
    <AppContainer>
      <ReactNotifications />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<LogoutButton />} />
        <Route path='/' element={<Layout />}>
          <Route index element={<PrivateRoute component={Homepage} />} />
          <Route path='/bets' element={<PrivateRoute component={Bettings} />} />
          <Route path='/profile' element={<PrivateRoute component={Profile} />} />
          <Route 
            path='/admin'  
            element={<PrivateRoute component={AdminPanel} allowedRoles={['admin','moderator']} />} 
          />
          <Route path='/leagues' element={<PrivateRoute component={IndexLeague} />} />
        </Route>
      </Routes>
    </AppContainer>
  </AuthProvider>
  );
}

export default App;
