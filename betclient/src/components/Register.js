// src/components/Register.js
import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../AuthContext';
import { Form } from 'react-bootstrap'; 
import '../styles/auth.css';
import { useNavigate } from 'react-router-dom'; 

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState(''); // New state for favorite team
  const [teams, setTeams] = useState([]); // New state for storing teams
  const { register } = useContext(AuthContext);
  const navigate = useNavigate(); 
  
  useEffect(() => {
    // Fetch teams from the API
    async function fetchTeams() {
      try {
        const response = await fetch(process.env.REACT_APP_API + '/teams');
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      }
    }

    fetchTeams();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(username, email, password, favoriteTeam); // Pass favoriteTeam to register function
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className='index-auth'>
      <form onSubmit={handleSubmit} className='register'>
        <h1>Register</h1>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={ev => setUsername(ev.target.value)} 
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={ev => setEmail(ev.target.value)} 
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={ev => setPassword(ev.target.value)} 
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Favorite Team</Form.Label>
          <Form.Control 
            as="select" 
            value={favoriteTeam}
            onChange={ev => setFavoriteTeam(ev.target.value)}
            required // Make it required
          >
            <option value="">Select your favorite team</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <button type="submit" className="btn btn-secondary">Register</button>
      </form>
    </div>
  );
};

export default Register;