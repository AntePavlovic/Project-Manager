import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import NavBar from './NavBar'; // Importujemo NavBar komponentu

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
    marginTop: '64px', // Dodajemo marginu da se sadržaj ne preklapa s NavBarom
  },
  professorList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
  },
  professorCard: {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    width: '200px',
    height: '250px', // Dodajemo visinu kartice
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'box-shadow 0.2s',
    display: 'flex', // Dodajemo flexbox za centriranje sadržaja
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // Vertikalno centriranje
  },
  professorCardHover: {
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  professorImage: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: '10px', // Dodajemo razmak između ikone i imena
  },
  modalBg: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '1000',
  },
  modal: {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
    width: '400px',
    maxWidth: '90%',
  },
  modalHeader: {
    marginBottom: '10px',
  },
  modalList: {
    listStyle: 'none',
    padding: '0',
  },
  modalListItem: {
    marginBottom: '8px',
  },
  modalButton: {
    marginTop: '10px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    background: '#1976d2',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  modalButtonHover: {
    background: '#1251a3',
  },
};

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