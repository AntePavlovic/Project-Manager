import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import { supabase } from '../supabaseClient';

const styles = `
.profesor-page-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: left;
  width: 90%;
  margin-left: 5%;
  margin-bottom: 5%;
  max-width: 900px;
  min-height: 60%;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.profesor-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.profesor-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #222;
  margin-top: 160px;
}
.profesor-title {
  font-size: 1.1rem;
  color: #1976d2;
  font-weight: 500;
}
`;

const ProfesorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profesor, setProfesor] = React.useState(null); // Stanje za podatke o profesoru
  const profesorId = location.state?.profesor?.id; // Dohvaćanje ID-a iz state-a

  React.useEffect(() => {
    if (!document.getElementById('profesor-page-styles')) {
      const style = document.createElement('style');
      style.id = 'profesor-page-styles';
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  React.useEffect(() => {
    const fetchProfesor = async () => {
      if (!profesorId) {
        navigate('/'); // Ako nema ID-a, vrati korisnika na početnu
        return;
      }

      // Dohvaćanje podataka o profesoru
      const { data: profesorData, error: profesorError } = await supabase
        .from('profesori')
        .select('id, ime, prezime, email, fakultet_id, titula')
        .eq('id', profesorId)
        .single();

      if (profesorError) {
        console.error('Greška pri dohvaćanju profesora:', profesorError);
        navigate('/'); // Ako postoji greška, vrati korisnika na početnu
        return;
      }

      // Dohvaćanje tema povezanih s profesorom
      const { data: temeData, error: temeError } = await supabase
        .from('teme')
        .select('id, naslov, opis, smjer_id, max_broj_studenata, zauzeta')
        .eq('profesor_id', profesorId);

      if (temeError) {
        console.error('Greška pri dohvaćanju tema:', temeError);
      }

      // Postavljanje podataka u stanje
      setProfesor({ ...profesorData, teme: temeData || [] });
    };

    fetchProfesor();
  }, [profesorId, navigate]);

  if (!profesor) {
    return null; // Prikaz dok se podaci učitavaju ili ako nema profesora
  }

  return (
    <>
      <NavBar />
      <div className="profesor-page-container">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 0, justifyContent: 'flex-start', width: '100%', maxWidth: 900 }}>
          <div
            className="profesor-image"
            style={{
              width: 200,
              height: 200,
              marginTop: '17%',
              borderRadius: '50%',
              background: '#eee',
              marginRight: 40,
              boxShadow: '0 2px 12px rgba(25, 118, 210, 0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#1976d2',
              textTransform: 'uppercase',
              userSelect: 'none',
            }}
          >
            {profesor.ime[0]}{profesor.prezime[0]}
          </div>
          <div className="profesor-info">
            <div className="profesor-name">{profesor.ime} {profesor.prezime}</div>
            <div className="profesor-title">Titula: {profesor.titula}</div>
            <div className="profesor-title">Email: {profesor.email}</div>
            <div className="profesor-title">Fakultet ID: {profesor.fakultet_id}</div>
          </div>
        </div>
      </div>
      {profesor.teme && profesor.teme.length > 0 && (
        <div
          style={{
            position: 'relative',
            width: '85%',
            margin: '0 auto',
            background: '#fafbfc',
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(25,118,210,0.07)',
            padding: '24px 28px',
            textAlign: 'left',
            border: '1px solid #e3e8ee',
          }}
        >
          <div
            style={{
              color: '#1976d2',
              fontWeight: 600,
              marginBottom: 10,
              textTransform: 'uppercase',
              fontSize: '1.05rem',
              letterSpacing: '0.04em',
              borderBottom: '1px solid #e3e8ee',
              paddingBottom: 6,
            }}
          >
            Teme
          </div>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
            {profesor.teme.map((tema) => (
              <li key={tema.id} style={{
                fontSize: '1.04rem',
                color: '#222',
                marginBottom: 6,
                padding: '7px 0 7px 0',
                borderBottom: '1px solid #f0f1f3',
                letterSpacing: '0.01em',
                fontWeight: 400,
                background: 'none',
              }}>
                <strong>{tema.naslov}</strong> - {tema.opis} <br />
                <span style={{ color: '#1976d2' }}>Max broj studenata: {tema.max_broj_studenata}</span> | Zauzeta: {tema.zauzeta ? 'Da' : 'Ne'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default ProfesorPage;