import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from './NavBar';

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
  const profesor = location.state?.profesor;

  React.useEffect(() => {
    if (!document.getElementById('profesor-page-styles')) {
      const style = document.createElement('style');
      style.id = 'profesor-page-styles';
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }, []);

  if (!profesor) {
    // Ako nema podataka, vrati korisnika na početnu
    navigate('/');
    return null;
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
          {profesor.name.trim().split(/\s+/).map(word => word[0]).join('')}
        </div>
        <div className="profesor-info">
          <div className="profesor-name">{profesor.name}</div>
          <div className="profesor-title">{profesor.title}</div>
        </div>
      </div>
    </div>
    {/* Modalni prozor za teme ispod cijelog kontejnera */}
    {profesor.topics && profesor.topics.length > 0 && (
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
          {profesor.topics.map((topic, idx) => (
            <li key={idx} style={{
              fontSize: '1.04rem',
              color: '#222',
              marginBottom: 6,
              padding: '7px 0 7px 0',
              borderBottom: idx !== profesor.topics.length - 1 ? '1px solid #f0f1f3' : 'none',
              letterSpacing: '0.01em',
              fontWeight: 400,
              background: 'none',
            }}>
              {topic}
            </li>
          ))}
        </ul>
      </div>
    )}
  </>
);
};

export default ProfesorPage;