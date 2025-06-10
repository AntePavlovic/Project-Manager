import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import NavBar from './NavBar'; // Importujemo NavBar komponentu
import '../styles/PregledProfesora.css'; // Importujemo CSS stilove


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
      <div className="container">
        <h1>Pregled Profesora</h1>
        <div className="professor-list">
          {professors.map((prof) => (
            <div key={prof.id}>
              <div
                className="professor-card"
                onClick={() => handleProfessorClick(prof)}
                onMouseEnter={(e) => e.currentTarget.classList.add('professor-card-hover')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('professor-card-hover')}
              >
                <div className="professor-image">
                  {prof.ime[0]}{prof.prezime[0]}
                </div>
                <h2>{prof.ime} {prof.prezime}</h2>
                <p>{prof.titula}</p>
              </div>

              {selectedProfessor && selectedProfessor.id === prof.id && (
                <div className="modal-bg" onClick={closeModal}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <h2 className="modal-header">{prof.ime} {prof.prezime}</h2>
                    <p>{prof.titula}</p>
                    <h3>Projekti:</h3>
                    <ul className="modal-list">
                      {professorProjects.map((project, index) => (
                        <li key={index} className="modal-list-item">
                          <strong>{project.naslov}</strong>: {project.opis} ({project.max_broj_studenata} studenata)
                        </li>
                      ))}
                    </ul>
                    <button
                      className="modal-button"
                      onMouseEnter={(e) => e.currentTarget.classList.add('modal-button-hover')}
                      onMouseLeave={(e) => e.currentTarget.classList.remove('modal-button-hover')}
                      onClick={closeModal}
                    >
                      Zatvori
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PregledProfesora;