import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { supabase } from '../supabaseClient';
import styles from '../styles/OdabirProjekta.css';

const OdabirProjekta = ({ studentId }) => {
  const [projekti, setProjekti] = useState([]);

  useEffect(() => {
    const fetchProjekti = async () => {
      // 1. Dohvati sve prijave za studenta
      const { data: prijaveStudenta, error: prijaveError } = await supabase
        .from('prijave')
        .select('tema_id')
        .eq('student_id', studentId);

      if (prijaveError) {
        console.error('Greška pri dohvaćanju prijava:', prijaveError);
        return;
      }

      const prijavljeniIdevi = prijaveStudenta.map((prijava) => prijava.tema_id);

      // 2. Dohvati sve dostupne projekte
      const { data: sviProjekti, error: projektiError } = await supabase
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
        .eq('zauzeta', false);

      if (projektiError) {
        console.error('Greška pri dohvaćanju projekata:', projektiError);
        return;
      }

      // 3. Filtriraj projekte na koje se student nije prijavio
      const dostupniProjekti = sviProjekti.filter(
        (projekt) => !prijavljeniIdevi.includes(projekt.id)
      );

      setProjekti(dostupniProjekti);
    };

    fetchProjekti();
  }, [studentId]);

  const handlePrijava = async (projektId) => {
    // Provjera da li je student već prijavljen na projekt
    const { data: existingPrijava, error: checkError } = await supabase
      .from('prijave')
      .select('id')
      .eq('student_id', studentId)
      .eq('tema_id', projektId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Greška pri provjeri prijave:', checkError);
      alert('Greška pri provjeri prijave.');
      return;
    }

    if (existingPrijava) {
      alert('Već ste se prijavili za ovaj projekt!');
      return;
    }

    // Slanje nove prijave
    const { error } = await supabase
      .from('prijave')
      .insert({
        student_id: studentId,
        tema_id: projektId,
      });

    if (error) {
      console.error('Greška pri prijavi na projekt:', error);
      alert('Greška pri prijavi na projekt.');
    } else {
      // Uklanjamo prijavljeni projekat iz lokalnog stanja
      setProjekti((prevProjekti) => prevProjekti.filter((projekt) => projekt.id !== projektId));
      alert('Uspješno ste se prijavili na projekt!');
    }
  };

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
      <NavBar userRole="student" />
      <div className="odabir-projekta-container">
        <h1>Odabir Projekta</h1>
        <div className="projekti-grid">
          {projekti.map((projekt) => (
            <div key={projekt.id} className="projekt-card">
              <h2>{projekt.naslov}</h2>
              <p>{projekt.opis}</p>
              <p><strong>Max broj studenata:</strong> {projekt.max_broj_studenata}</p>
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
              <button onClick={() => handlePrijava(projekt.id)}>Prijavi se</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};



export default OdabirProjekta;
