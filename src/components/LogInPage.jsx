import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LogInPage.css';
import { supabase } from "../supabaseClient";

const LogInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      alert('Prijava uspješna!');
      navigate('/Pocetna'); // Navigacija na UserPage
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Prijava</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Lozinka:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="forgot-password">
          <a href="/forgot-password">Zaboravili ste lozinku?</a>
        </div>
        <div className="register-link">
          <a href="/register">Nemate račun? Registrirajte se</a>
        </div>
        <button type="submit" className="login-button">Prijavi se</button>
      </form>
    </div>
  );
};

export default LogInPage;