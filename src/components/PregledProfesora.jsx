import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import NavBar from './NavBar'; // Importujemo NavBar komponentu
import styles from '../styles/PregledProfesora.css'; // Importujemo CSS stilove


const PregledProfesora = () => {
  const [professors, setProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [professorProjects, setProfessorProjects] = useState([]);

  useEffect(() => {
    const fetchProfessors = async () => {
      const { data: professorsData, error: professorsError } = await supabase
        .from('profesori')
        .select('id, ime, prezime, titula, email')
        .order('ime', { ascending: true }); // Sortiramo profesore abecedno

      if (professorsError) {
        console.error('Greška pri dohvaćanju profesora:', professorsError);
        return;
      }

      setProfessors(professorsData);
    };

    fetchProfessors();
  }, []);

  const handleProfessorClick = async (professor) => {
    setSelectedProfessor(professor);

    const { data: projectsData, error: projectsError } = await supabase
      .from('teme')
      .select('naslov, opis, max_broj_studenata, zauzeta')
      .eq('profesor_id', professor.id);

    if (projectsError) {
      console.error('Greška pri dohvaćanju projekata profesora:', projectsError);
      return;
    }

    setProfessorProjects(projectsData);
  };

  const closeModal = () => {
    setSelectedProfessor(null);
    setProfessorProjects([]);
  };

  return (
    <>
      <NavBar userRole="student" /> {/* Dodajemo NavBar */}
      <div style={styles.container}>
        <h1>Pregled Profesora</h1>
        <div style={styles.professorList}>
          {professors.map((prof) => (
            <div
              key={prof.id}
              style={styles.professorCard}
              onClick={() => handleProfessorClick(prof)}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = styles.professorCardHover.boxShadow)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = styles.professorCard.boxShadow)}
            >
              <div style={styles.professorImage}>
                {prof.ime[0]}{prof.prezime[0]}
              </div>
              <h2>{prof.ime} {prof.prezime}</h2>
              <p>{prof.titula}</p>
            </div>
          ))}
        </div>

        {selectedProfessor && (
          <div style={styles.modalBg} onClick={closeModal}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalHeader}>{selectedProfessor.ime} {selectedProfessor.prezime}</h2>
              <p>{selectedProfessor.titula}</p>
              <h3>Projekti:</h3>
              <ul style={styles.modalList}>
                {professorProjects.map((project, index) => (
                  <li key={index} style={styles.modalListItem}>
                    <strong>{project.naslov}</strong>: {project.opis} ({project.max_broj_studenata} studenata)
                  </li>
                ))}
              </ul>
              <button
                style={styles.modalButton}
                onMouseEnter={(e) => (e.currentTarget.style.background = styles.modalButtonHover.background)}
                onMouseLeave={(e) => (e.currentTarget.style.background = styles.modalButton.background)}
                onClick={closeModal}
              >
                Zatvori
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PregledProfesora;