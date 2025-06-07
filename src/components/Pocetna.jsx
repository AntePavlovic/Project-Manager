import React from 'react';
import NavBar from './NavBar';

const Pocetna = ({ userRole }) => {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 64px)', // Oduzimamo visinu NavBar-a
    textAlign: 'center',
  };

  return (
    <>
      <NavBar userRole={userRole} />
      <div style={containerStyle}>
        <h1>Dobrodošli!</h1>
      </div>
    </>
  );
};

export default Pocetna;