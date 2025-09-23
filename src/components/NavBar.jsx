import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../styles/NavBar.css'; // Dodano povezivanje CSS datoteke
import logo from '../images/Logo.png';

const NavBar = ({ userRole }) => {
  const [active, setActive] = useState('odabir-teme');
  const navRef = useRef(null);
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    const currentPath = location.pathname;
    const pageName = currentPath.split('/')[1];
    setActive(pageName);

    const activeLink = navRef.current.querySelector(`.nav-link.${pageName}`);
    if (activeLink) {
      const { offsetLeft, offsetWidth } = activeLink;
      setHighlightStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNavClick = (path, name) => {
    setActive(name); // Update active state first
    const activeLink = navRef.current.querySelector(`.nav-link.${name}`);
    if (activeLink) {
      const { offsetLeft, offsetWidth } = activeLink;
      setHighlightStyle({ left: offsetLeft, width: offsetWidth });
    }
    navigate(path); // Navigate after updating state
  };

  const handleNavHover = (name) => {
    const hoverLink = navRef.current.querySelector(`.nav-link.${name}`);
    if (hoverLink) {
      const { offsetLeft, offsetWidth } = hoverLink;
      setHighlightStyle({ left: offsetLeft, width: offsetWidth });
    }
  };

  return (
    <nav className="custom-navbar">
      <a href="#" className="navbar-brand">
        <img src={logo} className="logo" alt="SUMARUM" />
      </a>
      <ul className="nav" ref={navRef}>
        <li>
          <a
            className={`nav-link ${active === 'Pocetna' ? 'active' : ''}`}
            onClick={() => handleNavClick('/Pocetna', 'Pocetna')}
            onMouseEnter={() => handleNavHover('Pocetna')}
          >
            Početna
          </a>
        </li>
        {userRole === 'student' && (
          <>
            <li>
              <a
                className={`nav-link ${active === 'PregledProfesora' ? 'active' : ''}`}
                onClick={() => handleNavClick('/PregledProfesora', 'PregledProfesora')}
                onMouseEnter={() => handleNavHover('PregledProfesora')}
              >
                Profesori
              </a>
            </li>
            <li>
              <a
                className={`nav-link ${active === 'OdabirProjekta' ? 'active' : ''}`}
                onClick={() => handleNavClick('/OdabirProjekta', 'OdabirProjekta')}
                onMouseEnter={() => handleNavHover('OdabirProjekta')}
              >
                Odabir Projekta
              </a>
            </li>
            <li>
              <a
                className={`nav-link ${active === 'PrijavljeniProjekti' ? 'active' : ''}`}
                onClick={() => handleNavClick('/PrijavljeniProjekti', 'PrijavljeniProjekti')}
                onMouseEnter={() => handleNavHover('PrijavljeniProjekti')}
              >
                Moj Projekat
              </a>
            </li>
          </>
        )}
        {userRole === 'profesor' && (
          <>
            <li>
              <a
                className={`nav-link ${active === 'DodajProjekt' ? 'active' : ''}`}
                onClick={() => handleNavClick('/DodajProjekt', 'DodajProjekt')}
                onMouseEnter={() => handleNavHover('DodajProjekt')}
              >
                Dodaj Projekt
              </a>
            </li>
            <li>
              <a
                className={`nav-link ${active === 'MojiProjekti' ? 'active' : ''}`}
                onClick={() => handleNavClick('/MojiProjekti', 'MojiProjekti')}
                onMouseEnter={() => handleNavHover('MojiProjekti')}
              >
                Moji Projekti
              </a>
            </li>
          </>
        )}
        {userRole === 'admin' && (
          <>
            <li>
              <a
                className={`nav-link ${active === 'DodajKorisnike' ? 'active' : ''}`}
                onClick={() => handleNavClick('/DodajKorisnike', 'DodajKorisnike')}
                onMouseEnter={() => handleNavHover('DodajKorisnike')}
              >
                Dodaj Korisnike
              </a>
            </li>
            <li>
              <a
                className={`nav-link ${active === 'DodajProjekt' ? 'active' : ''}`}
                onClick={() => handleNavClick('/DodajProjekt', 'DodajProjekt')}
                onMouseEnter={() => handleNavHover('DodajProjekt')}
              >
                Dodaj Projekat
              </a>
            </li>
            <li>
              <a
                className={`nav-link ${active === 'PregledajProjekte' ? 'active' : ''}`}
                onClick={() => handleNavClick('/PregledajProjekte', 'PregledajProjekte')}
                onMouseEnter={() => handleNavHover('PregledajProjekte')}
              >
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
      <div className="nav-highlight" style={highlightStyle}></div>
    </nav>
  );
};

export default NavBar;