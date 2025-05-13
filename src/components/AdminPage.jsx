import React, { useState } from 'react';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';

const professors = [
  {
    id: 1,
    name: 'Marko Marković',
    title: 'doc. dr. sc. Informatika',
    image: 'https://via.placeholder.com/100',
    slots: '0/3',
    topics: ['uvod u React', 'komponente i props', 'state i lifecycle', 'hooks', 'routing'],
  },
  {
    id: 2,
    name: 'Ana Anić',
    title: 'izv. prof. dr. sc. Dizajn',
    image: 'https://via.placeholder.com/100',
    slots: '1/3',
    topics: ['osnove CSS-a', 'flexbox i grid', 'responsive dizajn', 'animacije', 'sass/scss'],
  },
  {
    id: 3,
    name: ' Ivan Ivić',
    title: 'prof. dr. sc. Baze podataka',
    image: 'https://via.placeholder.com/100',
    slots: '2/3',
    topics: ['uvod u baze podataka', 'SQL upiti', 'relacijski modeli', 'normalizacija', 'indexiranje'],
  },
];

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
  transition: width 1.2s, height 1.2s;
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
`;

const AdminPage = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!document.getElementById('userpage-styles')) {
      const style = document.createElement('style');
      style.id = 'userpage-styles';
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  // Dummy handler for deleting professor
  const handleDelete = () => {
    setShowConfirm(false);
    // Ovdje bi išla logika za brisanje profesora po deleteId
    alert('Profesor obrisan!');
  };

  return (
    <>
      <NavBar />
      <div className="userpage-container">
        {/* Dodaj profesora modal */}
        <div className="add-modal">
          <div className="add-modal-content">
            <span className="add-modal-plus">+</span>
            Dodaj profesora
          </div>
        </div>
        {/* Svi profesori */}
        {professors.map((prof) => (
          <div
            key={prof.id}
            className={`prof-modal${expandedId === prof.id ? ' expanded' : ''}`}
            onClick={() => setExpandedId(expandedId === prof.id ? null : prof.id)}
          >
            {/* X za zatvaranje/brisanje */}
            <button
              className="close-x"
              onClick={e => {
                e.stopPropagation();
                setDeleteId(prof.id);
                setShowConfirm(true);
              }}
              title="Obriši profesora"
            >
              ×
            </button>
            <div
              className="prof-image"
              style={{
                width: expandedId === prof.id ? 150 : 100,
                height: expandedId === prof.id ? 150 : 100,
                minWidth: expandedId === prof.id ? 150 : 100,
                minHeight: expandedId === prof.id ? 150 : 100,
                maxWidth: expandedId === prof.id ? 150 : 100,
                maxHeight: expandedId === prof.id ? 150 : 100,
                borderRadius: '50%',
                marginTop: 24,
                background: '#eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: expandedId === prof.id ? '2.2rem' : '1.5rem',
                fontWeight: 700,
                color: '#1976d2',
                textTransform: 'uppercase',
                userSelect: 'none',
                transition: 'width 1.2s, height 1.2s',
              }}
            >
              {prof.name.trim().split(/\s+/).map(word => word[0]).join('')}
            </div>
            <h2 className="prof-name">{prof.name}</h2>
            <div className="prof-title">
              {expandedId === prof.id ? prof.title : ''}
            </div>
            <span className="prof-slots">{prof.slots}</span>
            <button
              className="pogledaj-btn"
              onClick={e => {
                e.stopPropagation();
                navigate('/ProfesorPage', { state: { profesor: prof } });
              }}
            >
              Pogledaj
            </button>
            {expandedId === prof.id && (
              <div className="topics-preview">
                <div className="topics-preview-title">Pregled tema:</div>
                <ul className="topics-list">
                  {prof.topics.slice(0, 3).map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Custom confirm modal */}
      {showConfirm && (
        <div className="confirm-modal-bg" onClick={() => setShowConfirm(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-title">
              Jeste li sigurni da želite obrisati ovog profesora?
            </div>
            <div className="confirm-modal-btns">
              <button className="confirm-btn" onClick={handleDelete}>Da</button>
              <button className="cancel-btn" onClick={() => setShowConfirm(false)}>Ne</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPage;