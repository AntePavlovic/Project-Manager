import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { supabase } from '../supabaseClient';
import styles from '../styles/PrijavljeniProjekti.css';

const PrijavljeniProjekti = ({ studentId }) => {
  const [prijave, setPrijave] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

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
          zakljucan,         
          tema_id,
          rad_url,           
          ocjena,
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
    // 1. Dohvati temu_id iz prijave
    const { data: prijava, error: prijavaError } = await supabase
      .from('prijave')
      .select('tema_id')
      .eq('id', prijavaId)
      .single();

    if (prijavaError || !prijava) {
      alert('Greška pri dohvaćanju prijave.');
      return;
    }

    // 2. Obriši prijavu
    const { error } = await supabase
      .from('prijave')
      .delete()
      .eq('id', prijavaId);

    if (error) {
      alert('Greška pri poništavanju prijave.');
      return;
    }

    // 3. Dohvati broj prijavljenih i max_broj_studenata za temu
    const { data: tema, error: temaError } = await supabase
      .from('teme')
      .select('broj_prijavljenih, max_broj_studenata')
      .eq('id', prijava.tema_id)
      .single();

    if (temaError || !tema) {
      alert('Greška pri dohvaćanju teme.');
      return;
    }

    // 4. Smanji broj prijavljenih (ne ispod 0) i ažuriraj zauzetost
    const noviBroj = Math.max((tema.broj_prijavljenih || 1) - 1, 0);
    const zauzeta = noviBroj >= tema.max_broj_studenata;

    const { error: updateError } = await supabase
      .from('teme')
      .update({ broj_prijavljenih: noviBroj, zauzeta })
      .eq('id', prijava.tema_id);

    if (updateError) {
      alert('Greška pri ažuriranju teme.');
      return;
    }

    // 5. Ažuriraj lokalno stanje
    setPrijave((prevPrijave) => prevPrijave.filter((prijava) => prijava.id !== prijavaId));
    alert('Prijava uspješno poništena.');
  };

  const handleStartWork = async (prijavaId) => {
    // 1. Zaključaj odabranu prijavu
    const { error } = await supabase
      .from('prijave')
      .update({ zakljucan: true })
      .eq('id', prijavaId);

    if (error) {
      alert('Greška pri zaključavanju teme!');
      return;
    }

    // 2. Dohvati prijavu da saznaš student_id
    const { data: prijava } = await supabase
      .from('prijave')
      .select('student_id')
      .eq('id', prijavaId)
      .single();

    // 3. Obriši sve ostale prijave tog studenta koje nisu zaključane i nisu ova prijava
    await supabase
      .from('prijave')
      .delete()
      .eq('student_id', prijava.student_id)
      .neq('id', prijavaId);

    // 4. Ažuriraj lokalno stanje
    setPrijave((prev) =>
      prev
        .filter((prijava) => prijava.id === prijavaId) // ostavi samo zaključanu
        .map((prijava) =>
          prijava.id === prijavaId ? { ...prijava, zakljucan: true } : prijava
        )
    );

    alert('Tema je zaključana! Sada možete raditi samo na ovoj temi.');
  };

  // Funkcija za upload rada
  const handleUploadRad = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    if (!file) {
      setUploadError('Odaberite datoteku za upload.');
      setUploading(false);
      return;
    }

    // Jedinstveno ime datoteke
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('radovi') // Bucket za radove
      .upload(fileName, file);

    if (error) {
      setUploadError('Greška pri uploadu datoteke: ' + error.message);
      setUploading(false);
      return;
    }

    // Ručno generiranje ispravnog public URL-a
    const publicURL = `https://klnspuosgxokqsjopwer.supabase.co/storage/v1/object/public/radovi/${fileName}`;

    // Spremi URL u prijavu
    const { error: updateError } = await supabase
      .from('prijave')
      .update({ rad_url: publicURL })
      .eq('id', zakljucanaPrijava.id);

    if (updateError) {
      setUploadError('Greška pri spremanju linka na rad.');
      setUploading(false);
      return;
    }

    setUploadSuccess('Rad uspješno uploadan!');
    setUploading(false);
    // Osvježi prikaz
    setPrijave((prev) =>
      prev.map((p) =>
        p.id === zakljucanaPrijava.id ? { ...p, rad_url: publicURL } : p
      )
    );
  };

  const handleFinish = async () => {
    // Ovdje samo otključavamo prijavu i označavamo je kao završenu
    const { error } = await supabase
      .from('prijave')
      .update({ zakljucan: false, zavrsen: true })
      .eq('id', zakljucanaPrijava.id);

    if (error) {
      alert('Greška pri završetku rada!');
      return;
    }

    // Osvježi lokalno stanje
    setPrijave((prev) =>
      prev.map((p) =>
        p.id === zakljucanaPrijava.id
          ? { ...p, zakljucan: false, zavrsen: true }
          : p
      )
    );
    alert('Rad je završen! Sada se možete ponovno prijaviti na druge teme.');
  };

  const zakljucanaPrijava = prijave.find((prijava) => prijava.zakljucan);

  return (
    <>
      <NavBar userRole="student" />
      <div className="prijavljeni-projekti-container">

        {/* Prikaz zaključane teme kao "Moj projekt" */}
        {zakljucanaPrijava && (
          <div className="moj-projekt-card">
            <h1>{zakljucanaPrijava.teme?.naslov}</h1>
            <p>{zakljucanaPrijava.teme?.opis}</p>
            <p><strong>Profesor:</strong> {zakljucanaPrijava.teme?.profesori?.ime} {zakljucanaPrijava.teme?.profesori?.prezime}</p>
            {zakljucanaPrijava.teme?.datoteka_url && (
              <p>
                <strong>Datoteka:</strong>{' '}
                <a href={zakljucanaPrijava.teme.datoteka_url} target="_blank" rel="noopener noreferrer">
                  Dodatna dokumentacija
                </a>
              </p>
            )}
            <p><strong>Status:</strong> {zakljucanaPrijava.status}</p>
            <p><strong>Datum prijave:</strong> {new Date(zakljucanaPrijava.datum_prijave).toLocaleDateString()}</p>
            <p style={{ color: 'green', fontWeight: 'bold' }}>Zaključano - započeli ste rad na ovoj temi</p>

            {/* Upload rada */}
            <form onSubmit={handleUploadRad} style={{ marginTop: 20 }}>
              <label>
                Upload završnog rada:
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.zip"
                  disabled={uploading}
                  style={{ marginLeft: 10 }}
                />
              </label>
              <button type="submit" disabled={uploading || !file} style={{ marginLeft: 10 }}>
                {uploading ? 'Učitavanje...' : 'Pošalji'}
              </button>
            </form>
            {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
            {uploadSuccess && <p style={{ color: 'green' }}>{uploadSuccess}</p>}

            {/* Prikaz linka na rad ako postoji */}
            {zakljucanaPrijava.rad_url && (
              <p style={{ marginTop: 20 }}>
                <strong>Vaš rad:</strong>{' '}
                <a href={zakljucanaPrijava.rad_url} target="_blank" rel="noopener noreferrer">
                  Preuzmi rad
                </a>
              </p>
            )}
            {zakljucanaPrijava.ocjena !== null && zakljucanaPrijava.ocjena !== undefined && (
              <button
                style={{
                  marginTop: 16,
                  background: '#388e3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 24px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                onClick={handleFinish}
              >
                Završi
              </button>
            )}
          </div>
        )}

        <div className="prijave-grid">
          {prijave
            .filter((prijava) => !prijava.zakljucan) // prikazuje samo ne-zaključane prijave
            .map((prijava) => (
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
                {prijava.status === 'accepted' && !prijava.zakljucan && (
                  <button
                    className="start-button"
                    onClick={() => handleStartWork(prijava.id)}
                  >
                    Započni rad
                  </button>
                )}
                {prijava.zakljucan && (
                  <p style={{ color: 'green', fontWeight: 'bold' }}>Zaključano - započeli ste rad na ovoj temi</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default PrijavljeniProjekti;