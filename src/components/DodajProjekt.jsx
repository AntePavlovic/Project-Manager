import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { supabase } from '../supabaseClient';
import styles from '../styles/DodajProjekt.css';

const DodajProjekt = ({ userRole, profesorId }) => {
  const [projektData, setProjektData] = useState({
    naslov: '',
    opis: '',
    fakultet_id: '',
    smjer_id: '',
    profesor_id: profesorId || '',
    max_broj_studenata: '',
    datoteka_url: '', // Dodano za URL datoteke
  });

  const [fakulteti, setFakulteti] = useState([]);
  const [smjerovi, setSmjerovi] = useState([]);
  const [profesori, setProfesori] = useState([]);
  const [datoteka, setDatoteka] = useState(null); // Stanje za odabranu datoteku

  useEffect(() => {
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

    const fetchSmjerovi = async () => {
      const { data: smjeroviData, error: smjeroviError } = await supabase
        .from('smjerovi')
        .select('id, naziv, fakultet_id');

      if (smjeroviError) {
        console.error('Greška pri dohvaćanju smjerova:', smjeroviError);
        return;
      }

      setSmjerovi(smjeroviData);
    };

    const fetchProfesori = async () => {
      const { data: profesoriData, error: profesoriError } = await supabase
        .from('profesori')
        .select('id, ime, prezime');

      if (profesoriError) {
        console.error('Greška pri dohvaćanju profesora:', profesoriError);
        return;
      }

      setProfesori(profesoriData);
    };

    fetchFakulteti();
    fetchSmjerovi();
    fetchProfesori();

    if (profesorId) {
      setProjektData((prev) => ({ ...prev, profesor_id: profesorId }));
    }
  }, [profesorId]);

  const handleFileUpload = async () => {
    if (!datoteka) return null;

    const fileName = `${Date.now()}_${datoteka.name}`;
    const { data, error } = await supabase.storage
      .from('projekti-datoteke') // Naziv bucket-a
      .upload(fileName, datoteka);

    if (error) {
      console.error('Greška pri uploadu datoteke:', error);
      alert('Greška pri uploadu datoteke.');
      return null;
    }

    // Ručno generiranje ispravnog URL-a
    const publicURL = `https://klnspuosgxokqsjopwer.supabase.co/storage/v1/object/public/projekti-datoteke/${fileName}`;

    console.log('Public URL:', publicURL);

    return publicURL; // Vraćamo ispravan javni URL datoteke
  };

  const handleAddProjekt = async () => {
    let datotekaUrl = null;

    // Ako je datoteka odabrana, pokušavamo je uploadati
    if (datoteka) {
      datotekaUrl = await handleFileUpload(); // Upload datoteke i dohvaćanje URL-a

      if (!datotekaUrl) {
        console.error('Greška pri uploadu datoteke.');
        alert('Greška pri uploadu datoteke.');
        return;
      }
    }

    // Dodavanje projekta u bazu
    const { error } = await supabase
      .from('teme')
      .insert({
        naslov: projektData.naslov,
        opis: projektData.opis,
        fakultet_id: projektData.fakultet_id,
        smjer_id: projektData.smjer_id,
        profesor_id: projektData.profesor_id,
        max_broj_studenata: projektData.max_broj_studenata,
        datoteka_url: datotekaUrl, // Spremanje URL-a datoteke ili null
      });

    if (error) {
      console.error('Greška pri dodavanju projekta:', error);
      alert('Greška pri dodavanju projekta.');
    } else {
      alert('Projekt uspješno dodan!');
      setProjektData({
        naslov: '',
        opis: '',
        fakultet_id: '',
        smjer_id: '',
        profesor_id: profesorId || '',
        max_broj_studenata: '',
        datoteka_url: '',
      });
      setDatoteka(null); // Resetiramo datoteku
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

  useEffect(() => {
    const formSection = document.querySelector('.form-section');
    if (formSection) {
      formSection.style.opacity = '0';
      formSection.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        formSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        formSection.style.opacity = '1';
        formSection.style.transform = 'translateY(0)';
      }, 100);
    }
  }, []);

  const filteredSmjerovi = smjerovi.filter(
    (smjer) => smjer.fakultet_id === parseInt(projektData.fakultet_id)
  );

  return (
    <>
      <NavBar userRole={userRole} />
      <div className="dodaj-projekt-container">
        <div className="form-section">
          <h2>Dodaj Projekt</h2>
          <input
            type="text"
            placeholder="Naslov"
            value={projektData.naslov}
            onChange={(e) => setProjektData({ ...projektData, naslov: e.target.value })}
          />
          <textarea
            placeholder="Opis"
            value={projektData.opis}
            onChange={(e) => setProjektData({ ...projektData, opis: e.target.value })}
          />

          {/* Dropdown za fakultete */}
          <select
            value={projektData.fakultet_id}
            onChange={(e) => setProjektData({ ...projektData, fakultet_id: e.target.value, smjer_id: '' })}
          >
            <option value="">Odaberite fakultet</option>
            {fakulteti.map((fakultet) => (
              <option key={fakultet.id} value={fakultet.id}>
                {fakultet.naziv}
              </option>
            ))}
          </select>

          {/* Dropdown za smjerove filtrirane prema fakultetu */}
          <select
            value={projektData.smjer_id}
            onChange={(e) => setProjektData({ ...projektData, smjer_id: e.target.value })}
            disabled={!projektData.fakultet_id}
          >
            <option value="">Odaberite smjer</option>
            {filteredSmjerovi.map((smjer) => (
              <option key={smjer.id} value={smjer.id}>
                {smjer.naziv}
              </option>
            ))}
          </select>

          {/* Dropdown za profesora */}
          <select
            value={projektData.profesor_id}
            onChange={(e) => setProjektData({ ...projektData, profesor_id: e.target.value })}
          >
            <option value="">Odaberite profesora</option>
            {profesori.map((profesor) => (
              <option key={profesor.id} value={profesor.id}>
                {profesor.ime} {profesor.prezime}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Max broj studenata"
            value={projektData.max_broj_studenata}
            onChange={(e) =>
              setProjektData({ ...projektData, max_broj_studenata: e.target.value })
            }
          />

          {/* Uploader za datoteke */}
          <input
            type="file"
            onChange={(e) => setDatoteka(e.target.files[0])}
          />

          <button onClick={handleAddProjekt}>Dodaj Projekt</button>
        </div>
        <div className="horizontal-field"></div>
      </div>
    </>
  );
};


export default DodajProjekt;
