import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { supabase } from '../supabaseClient';
import styles from '../styles/MojiProjekti.css';

const MojiProjekti = ({ userRole, profesorId }) => {
  const [projekti, setProjekti] = useState([]);

  useEffect(() => {
    const fetchProjekti = async () => {
      if (!profesorId) {
        console.error('Nema ID-a profesora.');
        return;
      }

      const { data, error } = await supabase
        .from('teme')
        .select(`
          id, 
          naslov, 
          opis, 
          max_broj_studenata, 
          broj_prijavljenih,
          zauzeta, 
          datoteka_url, 
          smjerovi(naziv), 
          prijave(id, studenti(ime, prezime), status)
        `)
        .eq('profesor_id', profesorId);

      if (error) {
        console.error('Greška pri dohvaćanju projekata:', error);
        return;
      }

      setProjekti(data);
    };

    fetchProjekti();
  }, [profesorId]);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  const handleAcceptStudent = async (prijavaId, temaId) => {
    const projekt = projekti.find((p) => p.id === temaId);
    if (!prijavaId || !temaId || !projekt) return;

    if (projekt.broj_prijavljenih >= projekt.max_broj_studenata) {
      alert('Maksimalan broj studenata je dosegnut.');
      return;
    }

    const prijava = projekt.prijave.find((p) => p.id === prijavaId);
    if (prijava.status === 'accepted') {
      alert('Prijava je već prihvaćena.');
      return;
    }

    const { error: prijavaError } = await supabase
      .from('prijave')
      .update({ status: 'accepted' })
      .eq('id', prijavaId);

    if (prijavaError) {
      console.error(prijavaError);
      alert('Greška pri prihvaćanju prijave.');
      return;
    }

    const noviBroj = (projekt.broj_prijavljenih || 0) + 1;
    const novaZauzetaVrijednost = noviBroj >= projekt.max_broj_studenata;

    const { error: temaError } = await supabase
      .from('teme')
      .update({
        broj_prijavljenih: noviBroj,
        zauzeta: novaZauzetaVrijednost
      })
      .eq('id', temaId);

    if (temaError) {
      console.error(temaError);
      alert('Greška pri ažuriranju broja prijavljenih.');
      return;
    }

    alert('Student prihvaćen!');
    refreshProjekti();
  };

  const handleCancelStudent = async (prijavaId, temaId) => {
    const projekt = projekti.find((p) => p.id === temaId);
    if (!prijavaId || !temaId || !projekt) return;

    const prijava = projekt.prijave.find((p) => p.id === prijavaId);
    if (prijava.status !== 'accepted') {
      alert('Prijava nije prihvaćena.');
      return;
    }

    const { error: prijavaError } = await supabase
      .from('prijave')
      .update({ status: 'pending' })
      .eq('id', prijavaId);

    if (prijavaError) {
      console.error(prijavaError);
      alert('Greška pri poništavanju prijave.');
      return;
    }

    const noviBroj = (projekt.broj_prijavljenih || 0) - 1;
    const novaZauzetaVrijednost = noviBroj >= projekt.max_broj_studenata;

    const { error: temaError } = await supabase
      .from('teme')
      .update({
        broj_prijavljenih: noviBroj,
        zauzeta: novaZauzetaVrijednost
      })
      .eq('id', temaId);

    if (temaError) {
      console.error(temaError);
      alert('Greška pri ažuriranju broja prijavljenih.');
      return;
    }

    alert('Prijava poništena.');
    refreshProjekti();
  };

  const handleDeleteProjekt = async (projektId) => {
    const potvrda = window.confirm("Jeste li sigurni da želite obrisati ovaj projekt?");
    if (!potvrda) return;

    const { error } = await supabase
      .from('teme')
      .delete()
      .eq('id', projektId);

    if (error) {
      console.error('Greška pri brisanju projekta:', error);
      alert('Greška pri brisanju projekta.');
      return;
    }

    alert('Projekt uspješno obrisan!');
    setProjekti((prev) => prev.filter((p) => p.id !== projektId));
  };

  const refreshProjekti = async () => {
    const { data, error } = await supabase
      .from('teme')
      .select(`
        id, 
        naslov, 
        opis, 
        max_broj_studenata, 
        broj_prijavljenih,
        zauzeta, 
        datoteka_url, 
        smjerovi(naziv), 
        prijave(id, studenti(ime, prezime), status)
      `)
      .eq('profesor_id', profesorId);

    if (error) {
      console.error('Greška pri dohvaćanju projekata:', error);
      return;
    }

    setProjekti(data);
  };

  return (
    <>
      <NavBar userRole={userRole} />
      <div className="moji-projekti-container">
        <h1>Moji Projekti</h1>
        <div className="projekti-grid">
          {projekti.map((projekt) => (
            <div key={projekt.id} className="projekt-card">
              <button className="delete-button" onClick={() => handleDeleteProjekt(projekt.id)}>✕</button>
              <h2>{projekt.naslov}</h2>
              <p>{projekt.opis}</p>
              <p><strong>Max broj studenata:</strong> {projekt.max_broj_studenata}</p>
              <p><strong>Broj prijavljenih:</strong> {projekt.broj_prijavljenih || 0}</p>
              <p><strong>Zauzeta:</strong> {projekt.zauzeta ? 'Da' : 'Ne'}</p>
              <p><strong>Smjer:</strong> {projekt.smjerovi?.naziv || 'N/A'}</p>
              {projekt.datoteka_url && (
                <p>
                  <strong>Datoteka:</strong>{' '}
                  <a href={projekt.datoteka_url} target="_blank" rel="noopener noreferrer">
                    Dodatna dokumentacija
                  </a>
                </p>
              )}
              <div className="prijave-container">
                <h3>Prijave:</h3>
                {projekt.prijave?.length > 0 ? (
                  projekt.prijave.map((prijava, index) => (
                    <div key={index} className="prijava-item">
                      <p>
                        <strong>Student:</strong> {prijava.studenti?.ime} {prijava.studenti?.prezime} - <strong>Status:</strong> {prijava.status}
                      </p>
                      {prijava.status === 'pending' && (
                        <button onClick={() => handleAcceptStudent(prijava.id, projekt.id)}>
                          Prihvati
                        </button>
                      )}
                      {prijava.status === 'accepted' && (
                        <button onClick={() => handleCancelStudent(prijava.id, projekt.id)} style={{ backgroundColor: '#d32f2f' }}>
                          Poništi
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p>Nema prijava za ovu temu.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MojiProjekti;
