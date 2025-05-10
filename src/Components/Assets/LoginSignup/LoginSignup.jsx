import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';

import supabase from '../../../config/supabaseClient';

// Icons
import personIcon from '../../Assets/person.png';
import emailIcon from '../../Assets/email.png';
import passwordIcon from '../../Assets/password.png';
import task1Icon from '../../Assets/task1.png';

export const LoginSignup = () => {
  // State to toggle between login/signup
  const [action, setAction] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  // Handles both sign up and login logic
  const handleSubmit = async () => {
    // Make sure all required fields are filled
    if (!email || !password || (action === 'Sign Up' && !name)) {
      alert('Please fill in all required fields.');
      return;
    }

    // Sign Up flow
    if (action === 'Sign Up') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }, // Store user's name in metadata
        },
      });

      if (error) {
        alert(error.message);
      } else {
        alert('Sign up successful! Please check your email to confirm.');
      }
    } else {
      // Login flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        alert('Login successful!');
        navigate('/dashboard'); // Redirect to dashboard upon login
      }
    }
  };

  // Sends a password reset link to the user's email
  const handleResetPassword = async () => {
    if (!email) {
      alert('Please enter your email first.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/update-password', // Page user lands on after clicking reset link
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Password reset link sent to your email.');
    }
  };

  return (
    <div className="container">
      {/* App Logo */}
      <img src={task1Icon} alt="task1.png" className="logo" />

      {/* Header Section */}
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>

      {/* Input Fields */}
      <div className="inputs">
        {/* Name input only visible in Sign Up mode */}
        {action === 'Sign Up' && (
          <div className="input">
            <img src={personIcon} alt="name" />
            <input
              type="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        {/* Email input */}
        <div className="input">
          <img src={emailIcon} alt="email" />
          <input
            type="email"
            placeholder="Email "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password input */}
        <div className="input">
          <img src={passwordIcon} alt="password" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Password reset only shown in Login mode */}
        {action === 'Login' && (
          <div className="forgot-password" onClick={handleResetPassword}>
            Lost Password? <span>Click Here!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="submit-container">
          {/* Sign Up button: submits form or switches to Sign Up mode */}
          <div
            className={action === 'Login' ? 'submit gray' : 'submit'}
            onClick={async () => {
              if (action === 'Sign Up') {
                await handleSubmit();
              } else {
                setAction('Sign Up');
              }
            }}
          >
            Sign Up
          </div>

          {/* Login button: submits form or switches to Login mode */}
          <div
            className={action === 'Sign Up' ? 'submit gray' : 'submit'}
            onClick={async () => {
              if (action === 'Login') {
                await handleSubmit();
              } else {
                setAction('Login');
              }
            }}
          >
            Login
          </div>
        </div>
      </div>
    </div>
  );
};
