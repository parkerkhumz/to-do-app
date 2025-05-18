import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';

import supabase from '../../../config/supabaseClient';

// Icons for UI elements
import personIcon from '../../Assets/person.png';
import emailIcon from '../../Assets/email.png';
import passwordIcon from '../../Assets/password.png';
import task1Icon from '../../Assets/task1.png';

export const LoginSignup = () => {
  const [action, setAction] = useState('Login'); // toggles between 'Login' and 'Sign Up'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // toggle for showing password

  const navigate = useNavigate();

  useEffect(() => {
    // Inject Tidio chat script on mount
    const script = document.createElement('script');
    script.src = '//code.tidio.co/htst4pijfyszlp5hndcmjtruii1fqhme.js';
    script.async = true;
    document.body.appendChild(script);

    // Cleanup script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handles both login and signup logic
  const handleSubmit = async () => {
    if (!email || !password || (action === 'Sign Up' && !name)) {
      alert('Please fill in all required fields.');
      return;
    }

    if (action === 'Sign Up') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }, // pass name to user metadata
        },
      });

      if (error) {
        alert(error.message);
      } else {
        alert('Sign up successful! Please check your email to confirm.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        alert('Login successful!');
        navigate('/dashboard'); // redirect to dashboard on successful login
      }
    }
  };

  // Sends a password reset email
  const handleResetPassword = async () => {
    if (!email) {
      alert('Please enter your email first.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/update-password',
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Password reset link sent to your email.');
    }
  };

  return (
    <div className="container">
      {/* App logo */}
      <img src={task1Icon} alt="task1.png" className="logo" />

      {/* Header section */}
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>

      {/* Form Inputs */}
      <div className="inputs">
        {/* Show name input only on Sign Up */}
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

        {/* Email field */}
        <div className="input">
          <img src={emailIcon} alt="email" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password field with show/hide toggle */}
        <div className="input password-container">
          <img src={passwordIcon} alt="password" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Password reset option shown only on Login */}
        {action === 'Login' && (
          <div className="forgot-password" onClick={handleResetPassword}>
            Lost Password? <span>Click Here!</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="submit-container">
          {/* Sign Up button: If already signing up, submit. Otherwise, switch to Sign Up mode */}
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

          {/* Login button: If already logging in, submit. Otherwise, switch to Login mode */}
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
