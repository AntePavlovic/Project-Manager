import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { supabase } from '../supabaseClient';
import '../styles/DodajKorisnike.css';

const DodajKorisnike = ({ userRole }) => {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showProfessorModal, setShowProfessorModal] = useState(false);
  const [studentData, setStudentData] = useState({ ime: '', prezime: '', email: '', fakultet_id: '', smjer_id: '', password: '' });
  const [professorData, setProfessorData] = useState({ ime: '', prezime: '', email: '', fakultet_id: '', titula: '', password: '' });
  const [fakulteti, setFakulteti] = useState([]);
  const [smjerovi, setSmjerovi] = useState([]);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  const fetchFakulteti = async () => {
    const { data: fakultetiData, error: fakultetiError } = await supabase
      .from('fakulteti')
      .select('id, naziv');

    if (fakultetiError) {
      console.error('Greška pri dohvaćanju fakulteta:', fakultetiError);
      return;
    }

    setFakulteti(fakultetiData);
  };

  useEffect(() => {
    fetchFakulteti();
  }, []);

  const fetchSmjerovi = async (fakultetId) => {
    const { data: smjeroviData, error: smjeroviError } = await supabase
      .from('smjerovi')
      .select('id, naziv')
      .eq('fakultet_id', fakultetId);

    if (smjeroviError) {
      console.error('Greška pri dohvaćanju smjerova:', smjeroviError);
      return;
    }

    setSmjerovi(smjeroviData);
  };

  const handleAddStudent = async () => {
    const { data, error } = await supabase.auth.admin.createUser({
      email: studentData.email,
      password: studentData.password,
    });

    if (error) {
      console.error('Greška pri kreiranju računa:', error);
      alert('Greška pri kreiranju računa.');
      return;
    }

    const { data: studentInsert, error: dbError } = await supabase
      .from('studenti')
      .insert({
        ime: studentData.ime,
        prezime: studentData.prezime,
        email: studentData.email,
        smjer_id: studentData.smjer_id,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Greška pri dodavanju studenta u bazu:', dbError);
      alert('Greška pri dodavanju studenta u bazu.');
      return;
    }

    const { error: korisnikError } = await supabase
      .from('korisnici')
      .insert({
        id: data.user.id,
        uloga: 'student',
        student_id: studentInsert.id,
        email: studentData.email,
      });

    if (korisnikError) {
      console.error('Greška pri dodavanju u korisnici:', korisnikError);
      alert('Greška pri dodavanju u korisnici.');
    } else {
      alert('Student uspješno dodan!');
      setShowStudentModal(false);
    }
  };

  const handleAddProfessor = async () => {
    const { data, error } = await supabase.auth.admin.createUser({
      email: professorData.email,
      password: professorData.password,
    });

    if (error) {
      console.error('Greška pri kreiranju računa:', error);
      alert('Greška pri kreiranju računa.');
      return;
    }

    const { data: profInsert, error: dbError } = await supabase
      .from('profesori')
      .insert({
        ime: professorData.ime,
        prezime: professorData.prezime,
        email: professorData.email,
        fakultet_id: professorData.fakultet_id,
        titula: professorData.titula,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Greška pri dodavanju profesora u bazu:', dbError);
      alert('Greška pri dodavanju profesora u bazu.');
      return;
    }

    const { error: korisnikError } = await supabase
      .from('korisnici')
      .insert({
        id: data.user.id,
        uloga: 'profesor',
        profesor_id: profInsert.id,
        email: professorData.email,
      });

    if (korisnikError) {
      console.error('Greška pri dodavanju u korisnici:', korisnikError);
      alert('Greška pri dodavanju u korisnici.');
    } else {
      alert('Profesor uspješno dodan!');
      setShowProfessorModal(false);
    }
  };

  return (
    <>
      <NavBar userRole={userRole} />
      <div className="dodaj-korisnike-container">
        <h1>Dodaj Korisnike</h1>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button className="add-button" onClick={() => setShowStudentModal(true)}>
            Dodaj Studenta
          </button>
          <button className="add-button" onClick={() => setShowProfessorModal(true)}>
            Dodaj Profesora
          </button>
        </div>

        {showStudentModal && (
          <div className="modal-bg">
            <div className="modal">
              <h2>Dodaj Studenta</h2>
              <input
                type="text"
                placeholder="Ime"
                value={studentData.ime}
                onChange={(e) => setStudentData({ ...studentData, ime: e.target.value })}
              />
              <input
                type="text"
                placeholder="Prezime"
                value={studentData.prezime}
                onChange={(e) => setStudentData({ ...studentData, prezime: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={studentData.email}
                onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
              />
              <select
                value={studentData.fakultet_id}
                onChange={(e) => {
                  setStudentData({ ...studentData, fakultet_id: e.target.value });
                  fetchSmjerovi(e.target.value);
                }}
              >
                <option value="">Odaberite fakultet</option>
                {fakulteti.map((fakultet) => (
                  <option key={fakultet.id} value={fakultet.id}>
                    {fakultet.naziv}
                  </option>
                ))}
              </select>
              <select
                value={studentData.smjer_id}
                onChange={(e) => setStudentData({ ...studentData, smjer_id: e.target.value })}
              >
                <option value="">Odaberite smjer</option>
                {smjerovi.map((smjer) => (
                  <option key={smjer.id} value={smjer.id}>
                    {smjer.naziv}
                  </option>
                ))}
              </select>
              <input
                type="password"
                placeholder="Lozinka"
                value={studentData.password}
                onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
              />
              <button onClick={handleAddStudent}>Dodaj</button>
              <button onClick={() => setShowStudentModal(false)}>Zatvori</button>
            </div>
          </div>
        )}

        {showProfessorModal && (
          <div className="modal-bg">
            <div className="modal">
              <h2>Dodaj Profesora</h2>
              <input
                type="text"
                placeholder="Ime"
                value={professorData.ime}
                onChange={(e) => setProfessorData({ ...professorData, ime: e.target.value })}
              />
              <input
                type="text"
                placeholder="Prezime"
                value={professorData.prezime}
                onChange={(e) => setProfessorData({ ...professorData, prezime: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={professorData.email}
                onChange={(e) => setProfessorData({ ...professorData, email: e.target.value })}
              />
              <select
                value={professorData.fakultet_id}
                onChange={(e) => setProfessorData({ ...professorData, fakultet_id: e.target.value })}
              >
                <option value="">Odaberite fakultet</option>
                {fakulteti.map((fakultet) => (
                  <option key={fakultet.id} value={fakultet.id}>
                    {fakultet.naziv}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Titula"
                value={professorData.titula}
                onChange={(e) => setProfessorData({ ...professorData, titula: e.target.value })}
              />
              <input
                type="password"
                placeholder="Lozinka"
                value={professorData.password}
                onChange={(e) => setProfessorData({ ...professorData, password: e.target.value })}
              />
              <button onClick={handleAddProfessor}>Dodaj</button>
              <button onClick={() => setShowProfessorModal(false)}>Zatvori</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};




export default DodajKorisnike;