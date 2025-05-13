import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserPage from './components/UserPage';
import AdminPage from './components/AdminPage';
import ProfesorPage from './components/ProfesorPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/ProfesorPage" element={<ProfesorPage />} />
      </Routes>
    </Router>
  );
}

export default App;