import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { supabase } from '../supabaseClient';

const PrijavljeniProjekti = ({ studentId }) => {
  const [prijave, setPrijave] = useState([]);

  useEffect(() => {
    const fetchPrijave = async () => {
      if (!studentId) {
        console.error('Student ID nije dostupan.');
        return;
      }

      const { data, error } = await supabase
        .from('prijave')
        .select(`
          id, 
          status, 
          datum_prijave, 
          teme(naslov, opis, datoteka_url, profesori(ime, prezime))
        `)
        .eq('student_id', studentId);

      if (error) {
        console.error('Greška pri dohvaćanju prijava:', error);
        return;
      }

      setPrijave(data);
    };

    fetchPrijave();
  }, [studentId]);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  const handleCancelPrijava = async (prijavaId) => {
    const { error } = await supabase
      .from('prijave')
      .delete()
      .eq('id', prijavaId); // Brišemo prijavu iz baze na temelju ID-a

    if (error) {
      console.error('Greška pri poništavanju prijave:', error);
      alert('Greška pri poništavanju prijave.');
      return;
    }

    // Ažuriramo lokalno stanje nakon uspješnog brisanja
    setPrijave((prevPrijave) => prevPrijave.filter((prijava) => prijava.id !== prijavaId));
    alert('Prijava uspješno poništena.');
  };

  return (
    <>
      <NavBar userRole="student" />
      <div className="prijavljeni-projekti-container">
        <h1>Prijavljeni Projekti</h1>
        <div className="prijave-grid">
          {prijave.map((prijava) => (
            <div key={prijava.id} className="prijava-card">
              <h2>{prijava.teme?.naslov}</h2>
              <p>{prijava.teme?.opis}</p>
              <p><strong>Profesor:</strong> {prijava.teme?.profesori?.ime} {prijava.teme?.profesori?.prezime}</p>
              {prijava.teme?.datoteka_url && (
                <p>
                  <strong>Datoteka:</strong>{' '}
                  <a href={prijava.teme.datoteka_url} target="_blank" rel="noopener noreferrer">
                    Dodatna dokumentacija
                  </a>
                </p>
              )}
              <p><strong>Status:</strong> {prijava.status}</p>
              <p><strong>Datum prijave:</strong> {new Date(prijava.datum_prijave).toLocaleDateString()}</p>
              <button
                className="cancel-button"
                onClick={() => handleCancelPrijava(prijava.id)}
              >
                Poništi Prijavu
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const styles = `
.prijavljeni-projekti-container {
  padding: 80px 20px; /* Dodajemo padding od vrha za prostor ispod navigacijske trake */
  text-align: center;
}

.prijave-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Smanjujemo minimalnu širinu kartica */
  gap: 20px;
  margin-top: 20px;
}

.prijava-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: left;
  max-width: 300px; /* Ograničavamo maksimalnu širinu kartica */
  margin: 0 auto; /* Centriramo kartice unutar grida */
}

.prijava-card h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.prijava-card p {
  font-size: 1rem;
  margin: 5px 0;
}

.cancel-button {
  margin-top: 10px;
  padding: 10px 20px;
  background: #d32f2f; /* Crvena boja za dugme */
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background 0.2s;
}

.cancel-button:hover {
  background: #b71c1c; /* Tamnija crvena boja na hover */
}
`;

export default PrijavljeniProjekti;