// src/components/Login.js
import React, { useState, useContext } from 'react';
import AuthContext from '../AuthContext';
import { Form } from 'react-bootstrap'; // Assuming you are using React Bootstrap
import '../styles/auth.css';
import { Link, useNavigate } from 'react-router-dom'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); 
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(email, password); // Call the login function from AuthContext
      navigate('/'); 
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className=' index-auth'>
    <form onSubmit={handleSubmit} className='login'>
      <h1>Login</h1>
      <Form.Group className="mb-3">

        <Form.Control 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={ev => setEmail(ev.target.value)} 
        />
      </Form.Group>
      <Form.Group className="mb-3">
 
        <Form.Control 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={ev => setPassword(ev.target.value)} 
        />
      </Form.Group>
      <button type="submit" className="btn btn-secondary">Login</button>
      <Link className="btn btn-secondary register-btn" to="/register">Register</Link>
    </form>
    </div>
  );
};

export default Login;
