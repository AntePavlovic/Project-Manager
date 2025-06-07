import React, { useState, useEffect } from 'react';
import { supabase } from "./supabaseClient";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserPage from './components/UserPage';
import AdminPage from './components/AdminPage';
import ProfesorPage from './components/ProfesorPage';
import LogInPage from './components/LogInPage';
import RegisterPage from './components/RegisterPage';
import Pocetna from './components/Pocetna';
import DodajKorisnike from './components/DodajKorisnike';
import DodajProjekt from './components/DodajProjekt';
import PregledajProjekte from './components/PregledajProjekte';
import MojiProjekti from './components/MojiProjekti';
import OdabirProjekta from './components/OdabirProjekta';
import PrijavljeniProjekti from './components/PrijavljeniProjekti';
import PregledProfesora from './components/PregledProfesora';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [profesorId, setProfesorId] = useState(null);
  const [studentId, setStudentId] = useState(null);

  const fetchUserRoleAndIds = async (userEmail) => {
    if (!userEmail) return;

    const { data: userData, error: userError } = await supabase
      .from('korisnici')
      .select('uloga, profesor_id, student_id')
      .eq('email', userEmail)
      .single();

    if (userError) {
      console.error('Greška pri dohvaćanju korisnika:', userError);
      setUserRole(null);
      setProfesorId(null);
      setStudentId(null);
    } else {
      setUserRole(userData?.uloga || null);
      setProfesorId(userData?.profesor_id || null);
      setStudentId(userData?.student_id || null);
    }
  };

  useEffect(() => {
    const getSessionAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        fetchUserRoleAndIds(session.user.email);
      } else {
        setUserRole(null);
        setProfesorId(null);
        setStudentId(null);
      }
    };

    getSessionAndData();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        fetchUserRoleAndIds(session.user.email);
      } else {
        setUserRole(null);
        setProfesorId(null);
        setStudentId(null);
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogInPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/ProfesorPage" element={<ProfesorPage />} />
        <Route path="/Pocetna" element={<Pocetna userRole={userRole} />} />
        <Route path="/DodajKorisnike" element={<DodajKorisnike userRole={userRole} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/PregledProfesora" element={<PregledProfesora />} />
        <Route path="/DodajProjekt" element={<DodajProjekt userRole={userRole} profesorId={profesorId} />} />
        <Route path="/PregledajProjekte" element={<PregledajProjekte userRole="admin" />} />

        {/* Profesor projekti */}
        <Route
          path="/MojiProjekti"
          element={
            profesorId ? (
              <MojiProjekti userRole="profesor" profesorId={profesorId} />
            ) : (
              <p>Učitavanje podataka za profesora...</p>
            )
          }
        />

        {/* Student projekti */}
        <Route
          path="/OdabirProjekta"
          element={
            studentId ? (
              <OdabirProjekta studentId={studentId} />
            ) : (
              <p>Učitavanje podataka za studenta...</p>
            )
          }
        />

        <Route
          path="/PrijavljeniProjekti"
          element={
            studentId ? (
              <PrijavljeniProjekti studentId={studentId} />
            ) : (
              <p>Učitavanje podataka za studenta...</p>
            )
          }
        />

        
      </Routes>
    </Router>
  );
}

export default App;
