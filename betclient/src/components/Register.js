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
  
  const [position, setPosition] = useState('ST');

  // Mic helper cu explicații pentru poziții
const positionHelper = {
  GK: "Portar (GK) – Fii eroul echipei! Ultima barieră împotriva golurilor adversarilor.",
  LB: "Fundaș stânga (LB) – Oprește atacurile de pe bandă și sprijină ofensiva echipei.",
  CB: "Fundaș central (CB) – Stâlpul apărării, domină duelurile aeriene și blochează șuturile.",
  RB: "Fundaș dreapta (RB) – Apără partea dreaptă și lansează atacuri rapide pe flanc.",
  CM: "Mijlocaș central (CM) – Inima echipei, distribuie pase și controlează ritmul jocului.",
  LM: "Mijlocaș stânga (LM) – Energie pe bandă, oferă pase decisive și susține atacul.",
  RM: "Mijlocaș dreapta (RM) – Rapid și creativ, creează ocazii de gol din flancul drept.",
  LW: "Extremă stânga (LW) – Viteză și dribling, rupe apărarea și oferă centrări periculoase.",
  RW: "Extremă dreapta (RW) – Exploziv și imprevizibil, creează haos în apărarea adversă.",
  ST: "Atacant (ST) – Marcatorul suprem! Transformă ocaziile în goluri și câștigă meciurile.",
};


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
      await register(username, email, password, favoriteTeam,position); // Pass favoriteTeam to register function
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
        <Form.Group className="mb-3">
          <Form.Label>Position</Form.Label>
          <Form.Control
            as="select"
            value={position}
            onChange={ev => setPosition(ev.target.value)}
            required
          >
            <option value="">Select your position</option>
            {Object.keys(positionHelper).map(pos => (
              <option key={pos} value={pos}>
                {pos} – {positionHelper[pos]}
              </option>
            ))}
          </Form.Control>
          <small className="text-muted">
            {position && positionHelper[position]}
          </small>
        </Form.Group>
        <button type="submit" className="btn btn-secondary">Register</button>
      </form>
    </div>
  );
};

export default Register;