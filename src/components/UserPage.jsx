import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from '../styles/UserPage.css'; // Import CSS styles

const UserPage = () => {
  const [userRole, setUserRole] = useState(null); // Dodajemo state za ulogu korisnika
  const [professors, setProfessors] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error('Greška pri dohvaćanju sesije korisnika:', sessionError);
        return;
      }

      const userEmail = sessionData.session.user.email; // Dohvaćamo email korisnika iz sesije

      const { data: userData, error: userError } = await supabase
        .from('korisnici')
        .select('uloga')
        .eq('email', userEmail);

      if (userError) {
        console.error('Greška pri dohvaćanju uloge korisnika:', userError);
        return;
      }

      if (!userData || userData.length === 0) {
        console.error('Korisnik nije pronađen u tablici korisnici.');
        return;
      }

      setUserRole(userData[0].uloga); // Postavljamo ulogu korisnika
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchProfessors = async () => {
      const { data: professorsData, error: professorsError } = await supabase
        .from('profesori')
        .select('id, ime, prezime, titula, email');

      if (professorsError) {
        console.error('Greška pri dohvaćanju profesora:', professorsError);
        return;
      }

      const { data: topicsData, error: topicsError } = await supabase
        .from('teme')
        .select('profesor_id, zauzeta');

      if (topicsError) {
        console.error('Greška pri dohvaćanju tema:', topicsError);
        return;
      }

      const professorsWithTopics = professorsData.map((prof) => {
        const professorTopics = topicsData.filter((topic) => topic.profesor_id === prof.id);
        const totalTopics = professorTopics.length;
        const freeTopics = professorTopics.filter((topic) => !topic.zauzeta).length;

        return {
          ...prof,
          totalTopics,
          freeTopics,
        };
      });

      setProfessors(professorsWithTopics);
    };

    fetchProfessors();
  }, []);

  return (
    <>
      <NavBar userRole={userRole} /> {/* Prosljeđujemo ulogu korisnika */}
      <div className="userpage-container">
        <h1>Dobrodošli!</h1>
        {userRole === 'student' && <p>Ovo je stranica za studente.</p>}
        {userRole === 'profesor' && <p>Ovo je stranica za profesore.</p>}
        {userRole === 'admin' && <p>Ovo je stranica za administratore.</p>}
        {professors.map((prof) => (
          <div
            key={prof.id}
            className={`prof-modal${expandedId === prof.id ? ' expanded' : ''}`}
            onClick={() => setExpandedId(expandedId === prof.id ? null : prof.id)}
          >
            <div className="prof-image">
              {prof.ime[0]}{prof.prezime[0]}
            </div>
            <h2 className="prof-name">{prof.ime} {prof.prezime}</h2>
            <div className="prof-title">
              {expandedId === prof.id ? prof.titula : ''}
            </div>
            <span className="prof-slots">
              {prof.freeTopics} / {prof.totalTopics}
            </span>
            <button
              className="pogledaj-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/ProfesorPage', { state: { profesor: prof } });
              }}
            >
              Pogledaj
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default UserPage;