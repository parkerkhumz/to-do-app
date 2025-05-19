import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const { data, error } = await supabase.auth.exchangeCodeForSession();

        if (error) {
          console.error('Error restoring session:', error.message);
        } else {
          console.log('Session restored:', data.session);
        }
      }
    };

    restoreSession();
  }, []);

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      alert('Please enter a new password.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      alert(error.message);
    } else {
      alert('Password updated successfully!');
      navigate('/');
    }
  };

  return (
    <div className="container">
      <h2>Reset Your Password</h2>
      <input
        type="password"
        placeholder="Enter your new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleUpdatePassword}>Update Password</button>
    </div>
  );
};

export default UpdatePassword;
