import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const styles = `
.userpage-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 32px;
  padding-left: 10%;
  padding-top: 64px;
  min-height: 80vh;
  margin-top: 64px;
}
.prof-modal {
  position: relative;
  width: 220px;
  height: 250px;
  min-width: 220px;
  max-width: 220px;
  min-height: 250px;
  max-height: 250px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s, width 0.2s, height 0.2s;
  cursor: pointer;
  overflow: hidden;
}
.prof-modal:hover {
  transform: scale(1.07);
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.prof-modal.expanded {
  width: 340px;
  height: 420px;
  min-width: 340px;
  max-width: 340px;
  min-height: 420px;
  max-height: 420px;
  z-index: 10;
  box-shadow: 0 12px 48px rgba(0,0,0,0.22);
  transform: scale(1.12);
}
.prof-image {
  width: 100px;
  height: 100px;
  min-width: 100px;
  min-height: 100px;
  max-width: 100px;
  max-height: 100px;
  border-radius: 50%;
  margin-top: 24px;
  background: #eee;
  display: flex;
  align-items: center; /* Vertikalno centriranje */
  justify-content: center; /* Horizontalno centriranje */
  font-size: 2.5rem;
  font-weight: 700;
  color: #1976d2;
  text-transform: uppercase;
  user-select: none;
}
.prof-modal.expanded .prof-image {
  width: 150px;
  height: 150px;
  min-width: 150px;
  min-height: 150px;
  max-width: 150px;
  max-height: 150px;
}
.prof-name {
  margin: 18px 0 0 0;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
}
.prof-title {
  margin: 8px 0 0 0;
  font-size: 1.05rem;
  color: #1976d2;
  font-weight: 500;
  text-align: center;
  min-height: 24px;
  transition: opacity 0.3s;
  opacity: 1;
}
.prof-modal:not(.expanded) .prof-title {
  opacity: 0;
  height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.prof-slots {
  position: absolute;
  bottom: 18px;
  right: 18px;
  background: #f5f5f5;
  padding: 7px 16px;
  border-radius: 16px;
  font-size: 1rem;
  color: #333;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.pogledaj-btn {
  position: absolute;
  bottom: 18px;
  left: 18px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 8px 20px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
}
.pogledaj-btn:hover {
  background: #1251a3;
}
.add-modal {
  position: relative;
  width: 220px;
  height: 250px;
  min-width: 220px;
  max-width: 220px;
  min-height: 250px;
  max-height: 250px;
  background: #f5f5f5;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(25,118,210,0.10);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 0;
  transition: box-shadow 0.2s;
}
.add-modal:hover {
  box-shadow: 0 8px 32px rgba(25,118,210,0.18);
  background: #e3eaff;
}
.add-modal-content {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1976d2;
  gap: 12px;
  user-select: none;
}
.add-modal-plus {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1976d2;
  margin-right: 8px;
}
.close-x {
  position: absolute;
  top: 10px;
  right: 14px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 20;
  transition: color 0.2s;
}
.close-x:hover {
  color: #d32f2f;
}
.confirm-modal-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.confirm-modal {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 32px 32px 24px 32px;
  min-width: 320px;
  max-width: 90vw;
  text-align: center;
  z-index: 1001;
}
.confirm-modal-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #222;
}
.confirm-modal-btns {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 18px;
}
.confirm-btn, .cancel-btn {
  padding: 8px 28px;
  border-radius: 12px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.confirm-btn {
  background: #d32f2f;
  color: #fff;
}
.confirm-btn:hover {
  background: #b71c1c;
}
.cancel-btn {
  background: #f5f5f5;
  color: #222;
}
.cancel-btn:hover {
  background: #e0e0e0;
}
.topics-preview {
  margin-top: 8px;
  margin-bottom: 10px;
  width: 90%;
  font-size: 0.98rem;
  color: #444;
  text-align: left;
  font-family: 'Segoe UI', Arial, sans-serif;
  letter-spacing: 0.01em;
}
.topics-preview-title {
  font-size: 0.95rem;
  color: #1976d2;
  font-weight: 600;
  margin-bottom: 4px;
  margin-top: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.topics-list {
  margin: 0;
  padding-left: 32px;
}
.topics-list li {
  font-size: 0.97rem;
  color: #333;
  margin-bottom: 2px;
  text-transform: lowercase;
  list-style: number;
  right: 18px;
}
.modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  width: 400px;
  max-width: 90%;
}

.modal input {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal button {
  margin-right: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #1976d2;
  color: #fff;
  cursor: pointer;
}

.modal button:hover {
  background: #1251a3;
}
`;

const AdminPage = () => {
  const [professors, setProfessors] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showProfessorModal, setShowProfessorModal] = useState(false);
  const [studentData, setStudentData] = useState({ ime: '', prezime: '', email: '', fakultet_id: '', smjer_id: '', password: '' });
  const [professorData, setProfessorData] = useState({ ime: '', prezime: '', email: '', fakultet_id: '', titula: '', password: '' });
  const [fakulteti, setFakulteti] = useState([]); // Dodajemo state za fakultete
  const [smjerovi, setSmjerovi] = useState([]); // Dodajemo state za smjerove
  const navigate = useNavigate();

  useEffect(() => {
    if (!document.getElementById('userpage-styles')) {
      const style = document.createElement('style');
      style.id = 'userpage-styles';
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  // Dohvaćanje podataka iz Supabase baze
  useEffect(() => {
    const fetchProfessors = async () => {
      const { data: professorsData, error: professorsError } = await supabase
        .from('profesori')
        .select('id, ime, prezime, email, titula');

      if (professorsError) {
        console.error('Greška pri dohvaćanju profesora:', professorsError);
        return;
      }

      setProfessors(professorsData);
    };

    const fetchFakulteti = async () => {
      const { data: fakultetiData, error: fakultetiError } = await supabase
        .from('fakulteti')
        .select('id, naziv');

      if (fakultetiError) {
        console.error('Greška pri dohvaćanju fakulteta:', fakultetiError);
        return;
      }

      setFakulteti(fakultetiData); // Postavljamo fakultete u state
    };

    fetchProfessors();
    fetchFakulteti();
  }, []);

  const fetchSmjerovi = async (fakultetId) => {
    const { data: smjeroviData, error: smjeroviError } = await supabase
      .from('smjerovi')
      .select('id, naziv')
      .eq('fakultet_id', fakultetId); // Dohvaćamo smjerove na temelju fakulteta

    if (smjeroviError) {
      console.error('Greška pri dohvaćanju smjerova:', smjeroviError);
      return;
    }

    setSmjerovi(smjeroviData); // Postavljamo smjerove u state
  };

  const handleAddStudent = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: studentData.email,
      password: studentData.password, // Koristi unesenu lozinku
    });

    if (error) {
      console.error('Greška pri kreiranju računa:', error);
      return;
    }

    const { error: dbError } = await supabase.from('studenti').insert({
      ime: studentData.ime,
      prezime: studentData.prezime,
      email: studentData.email,
      smjer_id: studentData.smjer_id,
    });

    if (dbError) {
      console.error('Greška pri dodavanju studenta u bazu:', dbError);
    } else {
      alert('Student uspješno dodan!');
      setShowStudentModal(false);
    }
  };

  const handleAddProfessor = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: professorData.email,
      password: professorData.password, // Koristi unesenu lozinku
    });

    if (error) {
      console.error('Greška pri kreiranju računa:', error);
      return;
    }

    const { error: dbError } = await supabase.from('profesori').insert({
      ime: professorData.ime,
      prezime: professorData.prezime,
      email: professorData.email,
      fakultet_id: professorData.fakultet_id, // Koristi ID fakulteta iz padajućeg izbornika
      titula: professorData.titula,
    });

    if (dbError) {
      console.error('Greška pri dodavanju profesora u bazu:', dbError);
    } else {
      alert('Profesor uspješno dodan!');
      setShowProfessorModal(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="userpage-container">
        {/* Dugmad za dodavanje */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button className="add-button" onClick={() => setShowStudentModal(true)}>
            DODAJ STUDENTA
          </button>
          <button className="add-button" onClick={() => setShowProfessorModal(true)}>
            DODAJ PROFESORA
          </button>
        </div>

        {/* Dodaj profesora modal */}
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

        {/* Svi profesori */}
        {professors.length > 0 ? (
          professors.map((prof) => (
            <div
              key={prof.id}
              className={`prof-modal${expandedId === prof.id ? ' expanded' : ''}`}
              onClick={() => setExpandedId(expandedId === prof.id ? null : prof.id)}
            >
              <div className="prof-image">
                {prof.ime[0]}{prof.prezime[0]} {/* Generiranje inicijala */}
              </div>
              <h2 className="prof-name">{prof.ime} {prof.prezime}</h2>
              <div className="prof-title">Titula: {prof.titula}</div>
              <div className="prof-title">Email: {prof.email}</div>
              <span className="prof-slots">
                {prof.freeTopics} / {prof.totalTopics}
              </span>
              <button
                className="pogledaj-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/ProfesorPage', { state: { profesor: prof } });
                }}
              >
                Pogledaj
              </button>
            </div>
          ))
        ) : (
          <p>Nema dostupnih profesora.</p>
        )}
      </div>

      {/* Dodaj studenta modal */}
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
                fetchSmjerovi(e.target.value); // Dohvaćamo smjerove na temelju odabranog fakulteta
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
    </>
  );
};

export default AdminPage;