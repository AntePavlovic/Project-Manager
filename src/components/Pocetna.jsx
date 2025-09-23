import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import '../styles/Pocetna.css';
import { supabase } from '../supabaseClient';
import logo from '../images/Logo.png';

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
            <div className="pocetna-header">
              <img src={logo} alt="SUMARUM" className="pocetna-hero-logo" />
              <div className="pocetna-hero-text">
                <h1 className="pocetna-title">Dobrodošli na Projekt Manager</h1>
                <p className="pocetna-subtitle">
                  Mjesto gdje studenti i profesori zajednički rade na praktičnim istraživanjima i projektima koji unapređuju struku.
                </p>
              </div>
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