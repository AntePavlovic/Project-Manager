import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../styles/NavBar.css'; // Dodano povezivanje CSS datoteke

const NavBar = ({ userRole }) => {
  const [active, setActive] = useState('odabir-teme');
  const navRef = useRef(null);
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (navRef.current) {
      const activeLink = navRef.current.querySelector('.nav-link.active');
      if (activeLink) {
        const { offsetLeft, offsetWidth } = activeLink;
        setHighlightStyle({ left: offsetLeft, width: offsetWidth });
      }
    }
  }, [active]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="custom-navbar">
      <a href="#" className="navbar-brand">
        <img
          src="https://eucenje.sum.ba/moodle/pluginfile.php/1/core_admin/logocompact/300x300/1746443490/Logo%20sumarum.png"
          className="logo"
          alt="SUMARUM"
        />
      </a>
      <ul className="nav" ref={navRef}>
        <li>
          <a className="nav-link" onClick={() => navigate('/Pocetna')}>
            Početna
          </a>
        </li>
        {userRole === 'student' && (
          <>
            <li>
              <a className="nav-link" onClick={() => navigate('/PregledProfesora')}>
                Profesori
              </a>
            </li>
            <li>
              <a className="nav-link" onClick={() => navigate('/OdabirProjekta')}>
                Odabir Projekta
              </a>
            </li>
            <li>
              <a className="nav-link" onClick={() => navigate('/PrijavljeniProjekti')}>
                Prijavljeni Projekti
              </a>
            </li>
          </>
        )}
        {userRole === 'profesor' && (
          <>
            <li>
              <a className="nav-link" onClick={() => navigate('/DodajProjekt')}>
                Dodaj Projekt
              </a>
            </li>
            <li>
              <a className="nav-link" onClick={() => navigate('/MojiProjekti')}>
                Moji Projekti
              </a>
            </li>
          </>
        )}
        {userRole === 'admin' && (
          <>
            <li>
              <a className="nav-link" onClick={() => navigate('/DodajKorisnike')}>
                Dodaj Korisnike
              </a>
            </li>
            <li>
              <a className="nav-link" onClick={() => navigate('/DodajProjekt')}>
                Dodaj Projekat
              </a>
            </li>
            <li>
              <a className="nav-link" onClick={() => navigate('/PregledajProjekte')}>
                Pregledaj Projekte
              </a>
            </li>
          </>
        )}
        <li>
          <button className="logout-button" onClick={handleLogout}>
            Odjavi me
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;