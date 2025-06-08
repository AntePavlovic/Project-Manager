import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { supabase } from '../supabaseClient';
import styles from '../styles/PrijavljeniProjekti.css';

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

export default PrijavljeniProjekti;