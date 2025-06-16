/**
 * UserFilters.jsx
 * Componente per filtri avanzati ricerca utenti
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { RotateCcw, Calendar } from 'lucide-react';

const UserFilters = ({ filters, onFilterChange, onReset }) => {
  const handleFilterChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <div className="border-t pt-4 space-y-4">
      <h4 className="font-medium text-gray-900">Filtri Avanzati</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">        {/* Role Filter */}
        <div>
          <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Ruolo
          </label>
          <select
            id="role-filter"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tutti i ruoli</option>
            <option value="PARENT">Genitore</option>
            <option value="PROFESSIONAL">Professionista</option>
            <option value="ADMIN">Amministratore</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Stato
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tutti gli stati</option>
            <option value="active">Attivo</option>
            <option value="inactive">Inattivo</option>
            <option value="suspended">Sospeso</option>
            <option value="pending">In attesa</option>
          </select>
        </div>

        {/* Date From Filter */}
        <div>
          <label htmlFor="date-from-filter" className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline w-4 h-4 mr-1" />
            Registrato dal
          </label>
          <Input
            id="date-from-filter"
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            placeholder="Data inizio"
          />
        </div>

        {/* Date To Filter */}
        <div>
          <label htmlFor="date-to-filter" className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline w-4 h-4 mr-1" />
            Registrato fino al
          </label>
          <Input
            id="date-to-filter"
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            placeholder="Data fine"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">        {/* Sort By */}
        <div>
          <label htmlFor="sort-by-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Ordina per
          </label>
          <select
            id="sort-by-filter"
            value={filters.sort_by}
            onChange={(e) => handleFilterChange('sort_by', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created_at">Data registrazione</option>
            <option value="last_login">Ultimo accesso</option>
            <option value="email">Email</option>
            <option value="first_name">Nome</option>
            <option value="last_name">Cognome</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="sort-order-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Ordine
          </label>
          <select
            id="sort-order-filter"
            value={filters.sort_order}
            onChange={(e) => handleFilterChange('sort_order', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Decrescente</option>
            <option value="asc">Crescente</option>
          </select>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex items-center"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Filtri
        </Button>
      </div>
    </div>
  );
};

UserFilters.propTypes = {
  filters: PropTypes.shape({
    role: PropTypes.string,
    status: PropTypes.string,
    date_from: PropTypes.string,
    date_to: PropTypes.string,
    sort_by: PropTypes.string,
    sort_order: PropTypes.string
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
};

export default UserFilters;
