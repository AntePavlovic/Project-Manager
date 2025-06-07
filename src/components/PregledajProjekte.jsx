import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { supabase } from '../supabaseClient';

const PregledajProjekte = ({ userRole }) => {
  const [projekti, setProjekti] = useState([]);

  useEffect(() => {
    const fetchProjekti = async () => {
      const { data, error } = await supabase
        .from('teme')
        .select(`
          id, 
          naslov, 
          opis, 
          max_broj_studenata, 
          zauzeta, 
          datoteka_url,
          smjerovi(naziv), 
          profesori(ime, prezime)
        `)
        .order('id', { ascending: true });

      if (error) {
        console.error('Greška pri dohvaćanju projekata:', error);
        return;
      }

      setProjekti(data);
    };

    fetchProjekti();
  }, []);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <>
      <NavBar userRole={userRole} />
      <div className="pregledaj-projekte-container">
        <h1>Pregledaj Projekte</h1>
        <div className="projekti-grid">
          {projekti.map((projekt) => (
            <div key={projekt.id} className="projekt-card">
              <h2>{projekt.naslov}</h2>
              <p>{projekt.opis}</p>
              <p><strong>Max broj studenata:</strong> {projekt.max_broj_studenata}</p>
              <p><strong>Zauzeta:</strong> {projekt.zauzeta ? 'Da' : 'Ne'}</p>
              <p><strong>Smjer:</strong> {projekt.smjerovi?.naziv || 'N/A'}</p>
              <p><strong>Profesor:</strong> {projekt.profesori?.ime} {projekt.profesori?.prezime}</p>
              {projekt.datoteka_url && (
                <p>
                  <strong>Datoteka:</strong>{' '}
                  <a href={projekt.datoteka_url} target="_blank" rel="noopener noreferrer">
                    Dodatna dokumentacija
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const styles = `
.pregledaj-projekte-container {
  padding: 80px 20px; /* Dodajemo padding od vrha za prostor ispod navigacijske trake */
  text-align: center;
}

.projekti-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Smanjujemo minimalnu širinu kartica */
  gap: 20px;
  margin-top: 20px;
}

.projekt-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: left;
  max-width: 300px; /* Ograničavamo maksimalnu širinu kartica */
  margin: 0 auto; /* Centriramo kartice unutar grida */
}

.projekt-card h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.projekt-card p {
  font-size: 1rem;
  margin: 5px 0;
}
`;

export default PregledajProjekte;