import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

const UpdatePassword = () => {
  // Local state for the new password input
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a current session, otherwise try to recover it from the URL
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // If no session found, try restoring it (e.g., after password reset email redirect)
        supabase.auth.getSessionFromUrl().then(({ data, error }) => {
          if (error) console.error('Error restoring session:', error.message);
        });
      }
    });
  }, []);

  // Handles the actual password update
  const handleUpdatePassword = async () => {
    if (!newPassword) {
      alert('Please enter a new password.');
      return;
    }

    // Supabase method to update the user's password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Password updated successfully!');
      navigate('/'); // Redirect user back to login or home after successful update
    }
  };

  return (
    <div className="container">
      <h2>Reset Your Password</h2>
      {/* Input for new password */}
      <input
        type="password"
        placeholder="Enter your new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      {/* Trigger password update */}
      <button onClick={handleUpdatePassword}>Update Password</button>
    </div>
  );
};

export default UpdatePassword;
