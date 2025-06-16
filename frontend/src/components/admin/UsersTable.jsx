/**
 * UsersTable.jsx
 * Tabella per la visualizzazione e gestione degli utenti
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Eye, 
  Edit, 
  Shield,
  ShieldCheck,
  ShieldOff,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const UsersTable = ({
  users,
  loading,
  selectedUsers,
  onUserSelect,
  onSelectAll,
  onUserAction,
  pagination,
  onPageChange
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: it 
      });
    } catch {
      return 'Data non valida';
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      ADMIN: 'destructive',
      PROFESSIONAL: 'default',
      PARENT: 'secondary'
    };
    
    const labels = {
      ADMIN: 'Admin',
      PROFESSIONAL: 'Professionista',
      PARENT: 'Genitore'
    };

    return (
      <Badge variant={variants[role] || 'outline'}>
        {labels[role] || role}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      inactive: 'secondary',
      suspended: 'destructive'
    };

    const labels = {
      active: 'Attivo',
      inactive: 'Inattivo',
      suspended: 'Sospeso'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <ShieldCheck className="w-4 h-4 text-green-600" />;
      case 'suspended':
        return <ShieldOff className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleSelectAll = (e) => {
    onSelectAll(e.target.checked);
  };

  const handleUserSelect = (userId, e) => {
    onUserSelect(userId, e.target.checked);
  };

  const renderPagination = () => {
    const { page, totalPages, total } = pagination;
    const startItem = (page - 1) * pagination.limit + 1;
    const endItem = Math.min(page * pagination.limit, total);

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-gray-700">
          Mostrando {startItem}-{endItem} di {total} utenti
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">
            Pagina {page} di {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-16 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-16 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-16 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-16 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nessun utente trovato
        </h3>
        <p className="text-gray-500">
          Non ci sono utenti che corrispondono ai criteri di ricerca.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ruolo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registrazione
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ultimo accesso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleUserSelect(user.id, e)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(user.status)}
                    <span className="ml-2">{getStatusBadge(user.status)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(user.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.last_login ? formatDate(user.last_login) : 'Mai'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUserAction('view', user)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUserAction('edit', user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-8 w-48 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <div className="py-1">
                          {user.status === 'active' ? (
                            <>
                              <button
                                onClick={() => onUserAction('suspend', user)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Sospendi
                              </button>
                              <button
                                onClick={() => onUserAction('deactivate', user)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Disattiva
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => onUserAction('activate', user)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Attiva
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
};

UsersTable.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string,
    role: PropTypes.string.isRequired,
    status: PropTypes.string,
    created_at: PropTypes.string,
    last_login: PropTypes.string
  })).isRequired,
  loading: PropTypes.bool.isRequired,
  selectedUsers: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  onUserSelect: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onUserAction: PropTypes.func.isRequired,
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired
  }).isRequired,
  onPageChange: PropTypes.func.isRequired
};

export default UsersTable;
