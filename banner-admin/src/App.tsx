import React from 'react';
import './App.css';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import TVDisplay from './components/TVDisplay';

function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/tv" element={<TVDisplay />} />
        </Routes>
      </Router>
    </React.Fragment>
  );
}

export default App;
