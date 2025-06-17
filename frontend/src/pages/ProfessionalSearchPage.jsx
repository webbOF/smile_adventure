/**
 * ProfessionalSearchPage - Ricerca professionisti
 * Pagina per cercare e filtrare professionisti sanitari
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Layout, Button, Card, Header } from '../components/UI';
import professionalService from '../services/professionalService';
import notificationService from '../services/notificationService';
import './ProfessionalSearchPage.css';

const ProfessionalCard = ({ professional, onContact }) => (
  <Card className="professional-card">
    <div className="professional-card-header">
      <div className="professional-info">
        <h3>{professional.fullName || `${professional.firstName} ${professional.lastName}`}</h3>
        <p className="specialization">{professional.specialization}</p>
        <p className="license">Licenza: {professional.licenseNumber}</p>
      </div>
      <div className="professional-status">
        {professional.acceptingPatients && (
          <span className="accepting-badge">Accetta nuovi pazienti</span>
        )}
      </div>
    </div>

    <div className="professional-card-body">
      {professional.bio && (
        <div className="bio-section">
          <h4>Biografia</h4>
          <p>{professional.bio}</p>
        </div>
      )}

      {professional.clinicName && (
        <div className="clinic-section">
          <h4>Studio/Clinica</h4>
          <p className="clinic-name">{professional.clinicName}</p>
          {professional.clinicAddress && (
            <p className="clinic-address">{professional.clinicAddress}</p>
          )}
        </div>
      )}

      {professional.certifications && professional.certifications.length > 0 && (
        <div className="certifications-section">
          <h4>Certificazioni</h4>
          <ul className="certifications-list">
            {professional.certifications.slice(0, 3).map((cert, index) => (
              <li key={`${professional.id}-cert-${index}`}>{cert}</li>
            ))}
            {professional.certifications.length > 3 && (
              <li className="more-certs">
                +{professional.certifications.length - 3} altre certificazioni
              </li>
            )}
          </ul>
        </div>
      )}
    </div>

    <div className="professional-card-footer">
      <div className="contact-info">
        {professional.phone && (
          <span className="phone">📞 {professional.phone}</span>
        )}
        {professional.website && (
          <a 
            href={professional.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="website-link"
          >
            🌐 Sito Web
          </a>
        )}
      </div>
      <Button
        onClick={() => onContact(professional)}
        className="primary"
        disabled={!professional.phone && !professional.website}
      >
        Contatta
      </Button>
    </div>
  </Card>
);

ProfessionalCard.propTypes = {
  professional: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fullName: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    specialization: PropTypes.string,
    licenseNumber: PropTypes.string,
    acceptingPatients: PropTypes.bool,
    bio: PropTypes.string,
    clinicName: PropTypes.string,
    clinicAddress: PropTypes.string,
    certifications: PropTypes.arrayOf(PropTypes.string),
    phone: PropTypes.string,
    website: PropTypes.string
  }).isRequired,
  onContact: PropTypes.func.isRequired
};

const ProfessionalSearchPage = () => {
  const [loading, setLoading] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [filters, setFilters] = useState({
    specialty: '',
    location: '',
    accepting_patients: null,
    limit: 20
  });
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    searchProfessionals();
  }, []);

  const searchProfessionals = async (resetPage = false) => {
    setLoading(true);
    try {
      const page = resetPage ? 1 : currentPage;
      const searchFilters = {
        ...filters,
        offset: (page - 1) * filters.limit
      };

      const results = await professionalService.searchProfessionals(searchFilters);
      
      if (resetPage) {
        setProfessionals(results);
        setCurrentPage(1);
      } else {
        setProfessionals(prev => page === 1 ? results : [...prev, ...results]);
      }
      
      setTotalResults(results.length);
    } catch (error) {
      console.error('Error searching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    searchProfessionals(true);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
    searchProfessionals();
  };

  const clearFilters = () => {
    setFilters({
      specialty: '',
      location: '',
      accepting_patients: null,
      limit: 20
    });
    setCurrentPage(1);
    searchProfessionals(true);
  };

  const handleContactProfessional = (professional) => {
    if (professional.phone) {
      window.open(`tel:${professional.phone}`, '_blank');
    } else if (professional.website) {
      window.open(professional.website, '_blank', 'noopener,noreferrer');
    } else {
      notificationService.showInfo('Informazioni di contatto non disponibili');    }
  };
  return (
    <Layout header={<Header />}>
      <div className="professional-search-page">
        <div className="search-header">
          <h1>Trova Professionisti</h1>
          <p>Cerca professionisti sanitari specializzati vicino a te</p>
        </div>

        <div className="search-filters">
          <Card>
            <div className="filters-container">
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="specialty-filter">Specializzazione</label>
                  <select
                    id="specialty-filter"
                    value={filters.specialty}
                    onChange={(e) => handleFilterChange('specialty', e.target.value)}
                  >
                    <option value="">Tutte le specializzazioni</option>
                    {professionalService.getSpecializations().map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="location-filter">Località</label>
                  <input
                    id="location-filter"
                    type="text"
                    placeholder="es. Roma, Milano, Napoli"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="accepting-filter">Disponibilità</label>
                  <select
                    id="accepting-filter"
                    value={filters.accepting_patients || ''}
                    onChange={(e) => handleFilterChange('accepting_patients', 
                      e.target.value === '' ? null : e.target.value === 'true'
                    )}
                  >
                    <option value="">Tutti</option>
                    <option value="true">Solo chi accetta nuovi pazienti</option>
                    <option value="false">Tutti i professionisti</option>
                  </select>
                </div>
              </div>

              <div className="filter-actions">
                <Button onClick={handleSearch} className="primary" disabled={loading}>
                  {loading ? 'Cercando...' : 'Cerca'}
                </Button>
                <Button onClick={clearFilters} className="secondary">
                  Cancella Filtri
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="search-results">
          {professionals.length > 0 && (
            <div className="results-header">
              <p>{totalResults} professionisti trovati</p>
            </div>
          )}          <div className="professionals-grid">
            {professionals.map(professional => (
              <ProfessionalCard 
                key={`professional-${professional.id}`} 
                professional={professional}
                onContact={handleContactProfessional}
              />
            ))}
          </div>

          {professionals.length === 0 && !loading && (
            <div className="no-results">
              <h3>Nessun professionista trovato</h3>
              <p>Prova a modificare i filtri di ricerca o a cercare in un&apos;area più ampia.</p>
            </div>
          )}

          {professionals.length > 0 && totalResults >= filters.limit && (
            <div className="load-more">
              <Button 
                onClick={handleLoadMore} 
                className="secondary large"
                disabled={loading}
              >
                {loading ? 'Caricando...' : 'Carica Altri'}
              </Button>
            </div>
          )}
        </div>

        {loading && professionals.length === 0 && (
          <div className="search-loading">
            <div className="loading-spinner"></div>
            <p>Ricerca in corso...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfessionalSearchPage;
