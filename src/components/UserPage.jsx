import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

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
  object-fit: cover;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
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
`;

const UserPage = () => {
  const [professors, setProfessors] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!document.getElementById('userpage-styles')) {
      const style = document.createElement('style');
      style.id = 'userpage-styles';
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const fetchProfessors = async () => {
      const { data: professorsData, error: professorsError } = await supabase
        .from('profesori')
        .select('id, ime, prezime, titula, email');

      if (professorsError) {
        console.error('Greška pri dohvaćanju profesora:', professorsError);
        return;
      }

      const { data: topicsData, error: topicsError } = await supabase
        .from('teme')
        .select('profesor_id, zauzeta');

      if (topicsError) {
        console.error('Greška pri dohvaćanju tema:', topicsError);
        return;
      }

      const professorsWithTopics = professorsData.map((prof) => {
        const professorTopics = topicsData.filter((topic) => topic.profesor_id === prof.id);
        const totalTopics = professorTopics.length;
        const freeTopics = professorTopics.filter((topic) => !topic.zauzeta).length;

        return {
          ...prof,
          totalTopics,
          freeTopics,
        };
      });

      setProfessors(professorsWithTopics);
    };

    fetchProfessors();
  }, []);

  return (
    <>
      <NavBar />
      <div className="userpage-container">
        {professors.map((prof) => (
          <div
            key={prof.id}
            className={`prof-modal${expandedId === prof.id ? ' expanded' : ''}`}
            onClick={() => setExpandedId(expandedId === prof.id ? null : prof.id)}
          >
            <div className="prof-image">
              {prof.ime[0]}{prof.prezime[0]}
            </div>
            <h2 className="prof-name">{prof.ime} {prof.prezime}</h2>
            <div className="prof-title">
              {expandedId === prof.id ? prof.titula : ''}
            </div>
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
        ))}
      </div>
    </>
  );
};

export default UserPage;