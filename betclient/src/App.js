// src/App.js

import React from 'react';
import {Routes,Route} from 'react-router-dom';
import styled from 'styled-components';
import './App.css';

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
import IndexClub from './pages/club/IndexClub';
import Profile from './pages/profile/Profile';
import Bettings from './pages/bettings/Bettings';
import Match from './pages/match/IndexMatch';
import AnyMatch from './pages/match/AnyMatch';
import ChampionsKnockout from './pages/standings/ChampionsKnockout';
import Training from './pages/training/Training';
import Events from './pages/events/Events';
import EventPage from './pages/events/EventPage';
import Contact from './pages/Contact';

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
        <Route path="/contact" element={<Contact />} />
        <Route path="/logout" element={<LogoutButton />} />
        <Route path="/test" element={<ChampionsKnockout />} />
        <Route path='/' element={<Layout />}>
          <Route index element={<PrivateRoute component={Homepage} />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<EventPage />} />
          <Route path='/bets' element={<PrivateRoute component={Bettings} />} />
           <Route path='/match' element={<PrivateRoute component={Match} />} />
           <Route path="/match/:id" element={<AnyMatch />} />
          <Route path='/profile/:id' element={<PrivateRoute component={Profile} />} />
          <Route path='/profile' element={<PrivateRoute component={Profile} />} />
          <Route path='/training' element={<PrivateRoute component={Training} />} />
          <Route 
            path='/admin'  
            element={<PrivateRoute component={AdminPanel} allowedRoles={['admin','moderator']} />} 
          />
          <Route path='/leagues' element={<PrivateRoute component={IndexLeague} />} />
          <Route path='/club' element={<PrivateRoute component={IndexClub} />} />
           <Route path='/club/:id' element={<PrivateRoute component={IndexClub} />} />
        </Route>
      </Routes>
    </AppContainer>
  </AuthProvider>
  );
}

export default App;
