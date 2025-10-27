import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { supabase } from '../supabaseClient';
import styles from '../styles/OdabirProjekta.css';

const OdabirProjekta = ({ studentId }) => {
  const [projekti, setProjekti] = useState([]);
  const [imaZakljucanu, setImaZakljucanu] = useState(false);
  const [tipFilter, setTipFilter] = useState(''); // Dodano za filtriranje

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
          tip_teme,                
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

      console.log('Dostupni projekti:', dostupniProjekti);

      setProjekti(dostupniProjekti);
    };

    fetchProjekti();
  }, [studentId]);

  // Provjera da li je student zaključao temu
  useEffect(() => {
    const provjeriZakljucanu = async () => {
      const { data } = await supabase
        .from('prijave')
        .select('id')
        .eq('student_id', studentId)
        .eq('zakljucan', true)
        .single();

      setImaZakljucanu(!!data);
    };
    provjeriZakljucanu();
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

  // Filtriraj projekte po tipu
  const filtriraniProjekti = tipFilter
    ? projekti.filter((p) => p.tip_teme === tipFilter)
    : projekti;

  return (
    <>
      <NavBar userRole="student" />
      <div className="odabir-projekta-container">
        <h1>Odabir Projekta</h1>
        {/* Dugmad za filtriranje */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setTipFilter('preddiplomski')}
            style={{
              background: tipFilter === 'preddiplomski' ? '#1976d2' : '#e0e0e0',
              color: tipFilter === 'preddiplomski' ? '#fff' : '#000',
              marginRight: 8,
              padding: '8px 16px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Preddiplomski
          </button>
          <button
            onClick={() => setTipFilter('diplomski')}
            style={{
              background: tipFilter === 'diplomski' ? '#1976d2' : '#e0e0e0',
              color: tipFilter === 'diplomski' ? '#fff' : '#000',
              marginRight: 8,
              padding: '8px 16px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Diplomski
          </button>
          <button
            onClick={() => setTipFilter('projekt')}
            style={{
              background: tipFilter === 'projekt' ? '#1976d2' : '#e0e0e0',
              color: tipFilter === 'projekt' ? '#fff' : '#000',
              padding: '8px 16px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Projekt
          </button>
          <button
            onClick={() => setTipFilter('')}
            style={{
              background: tipFilter === '' ? '#1976d2' : '#e0e0e0',
              color: tipFilter === '' ? '#fff' : '#000',
              marginLeft: 8,
              padding: '8px 16px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Prikaži sve
          </button>
        </div>
        {imaZakljucanu ? (
          <p style={{ color: 'red' }}>
            Već ste zaključali temu i ne možete se prijaviti na novu!
          </p>
        ) : (
          <div className="projekti-grid">
            {filtriraniProjekti.map((projekt) => (
              <div key={projekt.id} className="projekt-card">
                <h2>{projekt.naslov}</h2>
                <p>{projekt.opis}</p>
                <p>
                  <strong>Max broj studenata:</strong> {projekt.max_broj_studenata}
                </p>
                <p>
                  <strong>Smjer:</strong> {projekt.smjerovi?.naziv || 'N/A'}
                </p>
                <p>
                  <strong>Profesor:</strong> {projekt.profesori?.ime}{' '}
                  {projekt.profesori?.prezime}
                </p>
                <p>
                  <strong>Tip teme:</strong>{" "}
                  {projekt.tip_teme
                    ? projekt.tip_teme.charAt(0).toUpperCase() + projekt.tip_teme.slice(1)
                    : "N/A"}
                </p>
                {projekt.datoteka_url && (
                  <p>
                    <strong>Datoteka:</strong>{' '}
                    <a
                      href={projekt.datoteka_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Dodatna dokumentacija
                    </a>
                  </p>
                )}
                <button onClick={() => handlePrijava(projekt.id)}>Prijavi se</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OdabirProjekta;
