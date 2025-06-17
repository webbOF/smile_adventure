import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>🌟 Smile Adventure</h3>
          <p>Trasformando l&apos;esperienza sanitaria per bambini con ASD</p>
        </div>
        <div className="footer-section">
          <h4>Per Famiglie</h4>
          <ul>
            <li><Link to="/register?role=parent">Registrati</Link></li>
            <li><Link to="/login">Accedi</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Per Professionisti</h4>
          <ul>
            <li><Link to="/register?role=professional">Registrati</Link></li>
            <li><Link to="/login">Accedi</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Risorse</h4>
          <ul>
            <li><Link to="/articles">Articoli</Link></li>
            <li><Link to="/about-us">Chi Siamo</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contatti</h4>
          <p>info@smileadventure.com</p>
          <p>+39 123 456 7890</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Smile Adventure. Tutti i diritti riservati.</p>
      </div>
    </footer>
  );
};

export default Footer;
