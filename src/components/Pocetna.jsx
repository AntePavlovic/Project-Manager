import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import '../styles/Pocetna.css';
import { supabase } from '../supabaseClient';

const Pocetna = ({ userRole }) => {
  const [activeCount, setActiveCount] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchActive = async () => {
      // Count themes where 'zauzeta' is false (available)
      const { count, error } = await supabase
        .from('teme')
        .select('id', { count: 'exact', head: false })
        .eq('zauzeta', false);

      if (error) {
        console.error('Greška pri dohvaćanju broja aktivnih tema:', error);
        return;
      }

      if (isMounted) setActiveCount(count ?? 0);
    };

    fetchActive();

    // subscribe to realtime changes on 'teme' table to update count
    const subscription = supabase
      .channel('public:teme')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teme' }, () => {
        fetchActive();
      })
      .subscribe();

    return () => {
      isMounted = false;
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <>
      <NavBar userRole={userRole} />
      <section className="pocetna-hero">
        <div className="pocetna-inner">
          <div className="pocetna-main">
            <h1 className="pocetna-title">Dobrodošli na SUMARUM</h1>
            <p className="pocetna-subtitle">
              Fakultet za studije i projekte - mjesto gdje studenti i profesori zajednički rade na praktičnim istraživanjima i projektima koji unapređuju struku.
            </p>

            <div className="pocetna-cta">
              {userRole === 'profesor' && (
                <>
                  <button className="pocetna-btn" onClick={() => window.location.href = '/DodajProjekt'}>Dodaj novu temu</button>
                  <button className="pocetna-btn secondary" onClick={() => window.location.href = '/MojiProjekti'}>Moji projekti</button>
                </>
              )}

              {userRole === 'student' && (
                <>
                  <button className="pocetna-btn" onClick={() => window.location.href = '/PregledProfesora'}>Pogledaj profesore</button>
                  <button className="pocetna-btn secondary" onClick={() => window.location.href = '/PrijavljeniProjekti'}>Prijavljeni projekti</button>
                </>
              )}

              {!userRole && (
                <button className="pocetna-btn secondary" onClick={() => window.location.href = '/PrijavljeniProjekti'}>Prijavljeni projekti</button>
              )}
            </div>
          </div>

          <aside className="pocetna-side">
            <div className="pocetna-stats">
              <div className="pocetna-stat"><strong>Aktivne teme</strong><span>{activeCount === null ? '...' : activeCount}</span></div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

export default Pocetna;