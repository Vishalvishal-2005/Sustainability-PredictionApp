import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username && email && password && confirmPassword) {
        if (password === confirmPassword) {
            try {
                const response = await fetch('http://localhost:3060/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });

                if (response.ok) {
                    alert('Sign up successful!');
                    setError('');
                    navigate('/Login');
                } else if (response.status === 409) {
                    setError('Email already exists');
                } else {
                    const data = await response.text();
                    setError(data || 'Signup failed');
                }
            } catch (err) {
                setError('An error occurred. Please try again.');
            }
        } else {
            setError('Passwords do not match.');
        }
    } else {
        setError('Please fill in all fields.');
    }
};


  return (
    <div className='scn'>
      <div className='scontainer-butterfly'>

      </div>
      <div className="sncontainer">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username} placeholder='Username'
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              placeholder='Re-Type Password'
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Sign Up</button>
          <div className="asksignup">You already have an Account? <Link to="/Login">Sign In</Link></div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
