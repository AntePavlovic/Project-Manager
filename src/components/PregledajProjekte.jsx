import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { supabase } from '../supabaseClient';
import styles from '../styles/PregledajProjekte.css';

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

export default PregledajProjekte;