import React from 'react';
import { supabase } from "./supabaseClient";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserPage from './components/UserPage';
import AdminPage from './components/AdminPage';
import ProfesorPage from './components/ProfesorPage';
import LogInPage from './components/LogInPage'; // Dodajte import za LogInPage
import RegisterPage from './components/RegisterPage'; // Dodajte import za RegisterPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogInPage />} /> {/* Postavite LogInPage kao početnu stranicu */}
        <Route path="/user" element={<UserPage />} /> {/* Promenite rutu za UserPage */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/ProfesorPage" element={<ProfesorPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* Dodajte rutu za RegisterPage */}
      </Routes>
    </Router>
  );
}

export default App;