import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/App.css';
import favicon from './images/LogoAvatar.png';

// ensure favicon is set (works in development and production builds)
function setFavicon(href) {
  try {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = href;
  } catch (err) {
    // ignore if DOM not available (e.g., SSR)
    console.warn('Could not set favicon:', err);
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
  () => setFavicon(favicon)
);