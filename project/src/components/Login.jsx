import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]); // State to hold fetched users
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:3060/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data); // Store users in state
        } else {
          console.error('Failed to fetch users:', res.statusText);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3060/api/users/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const token = await res.text();
        console.log('Token:', token);

        sessionStorage.setItem('token', token);

        // Find the user ID from the users list based on email
        const user = users.find(user => user.email === email);
        if (user) {
          localStorage.setItem('userId',user.id);
          alert('Sign in successful!');
          setError('');
          navigate('/ui');
          setIsAuthenticated(true);
        } else {
          setError('User not found.');
        }
      } else {
        const result = await res.text();
        setError(result || 'Failed to sign in. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className='scn'>
      <div className='welcome'>
        <p>Welcome to our Testing Environment</p>
      </div>
      <div className="sncontainer">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              placeholder='Email'
              id="email"
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
          {error && <p className="error">{error}</p>}
          <button type="submit">Sign In</button>
          <div className="asksignup">Don't have an account? <Link to="/">Sign up</Link></div>
        </form>
      </div>
    </div>
  );
};

export default Login;
