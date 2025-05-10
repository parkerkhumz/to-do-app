import React from 'react';

import { LoginSignup } from './Components/Assets/LoginSignup/LoginSignup';

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './Components/Assets/LoginSignup/dashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import UpdatePassword from './Components/Assets/LoginSignup/UpdatePassword'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/update-password" element={<UpdatePassword />} /> {/* ✅ route added */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
