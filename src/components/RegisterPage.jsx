import React, { useState } from 'react';
import '../styles/RegisterPage.css';
import { supabase } from '../supabaseClient';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Lozinke se ne podudaraju.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      // Save user data to 'korisnici' table
      const { error: dbError } = await supabase.from('korisnici').insert({
        email,
        created_at: new Date().toISOString(),
      });

      if (dbError) {
        setErrorMessage('Registracija uspješna, ali nije moguće sačuvati podatke u bazu.');
      } else {
        alert('Registracija uspješna!');
      }
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2>Registracija</h2>
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
        <div className="form-group">
          <label htmlFor="confirm-password">Potvrdite lozinku:</label>
          <input
            type="password"
            id="confirm-password"
            name="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="login-link">
          <a href="/">Već imate profil? Prijavite se</a>
        </div>
        <button type="submit" className="register-button">Registruj se</button>
      </form>
    </div>
  );
};

export default RegisterPage;