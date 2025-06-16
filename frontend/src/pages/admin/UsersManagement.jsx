/**
 * UsersManagement.jsx
 * Pagina di gestione utenti per amministratori
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Users,
  BarChart3
} from 'lucide-react';
import adminService from '../../services/adminService';
import UsersTable from '../../components/admin/UsersTable';
import UserFilters from '../../components/admin/UserFilters';
import UserDetailModal from '../../components/admin/UserDetailModal';
import UserBulkActions from '../../components/admin/UserBulkActions';
import StatisticsDashboard from '../../components/admin/StatisticsDashboard';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  
  // Pagination and filtering state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    date_from: '',
    date_to: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // Load users data
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const skip = (pagination.page - 1) * pagination.limit;
      const searchFilters = {
        ...filters,
        skip,
        limit: pagination.limit,
        search: searchTerm.trim() || undefined
      };
      
      const response = await adminService.getUsersListAdvanced(searchFilters);
      
      setUsers(response.users || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / pagination.limit)
      }));
      
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Errore nel caricamento degli utenti. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, searchTerm]);

  // Initial load and reload on filter changes
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Search handler with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        loadUsers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleUserSelect = (userId, selected) => {
    setSelectedUsers(prev => 
      selected 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAll = (selected) => {
    setSelectedUsers(selected ? users.map(user => user.id) : []);
  };

  const handleUserAction = (action, user) => {
    switch (action) {
      case 'view':
        setSelectedUser(user);
        setShowUserDetail(true);
        break;      case 'edit':
        // Navigate to edit user page or open edit modal
        // TODO: Implement edit user functionality
        break;
      case 'suspend':
      case 'activate':
      case 'deactivate':
        handleStatusChange(user.id, action);
        break;      default:
        // Unknown action - no logging needed
        break;
    }
  };

  const handleStatusChange = async (userId, action) => {
    try {
      let newStatus;
      switch (action) {
        case 'activate':
          newStatus = 'active';
          break;
        case 'deactivate':
          newStatus = 'inactive';
          break;
        case 'suspend':
          newStatus = 'suspended';
          break;
        default:
          return;
      }
      
      await adminService.updateUserStatus(userId, newStatus);      await loadUsers(); // Reload to reflect changes
      
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Errore nell\'aggiornamento dello stato utente.');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminService.exportData('csv', filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting users:', err);
      setError('Errore nell\'esportazione dei dati.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Utenti</h1>
          <p className="text-gray-600 mt-1">
            Amministra tutti gli utenti della piattaforma
          </p>
        </div>        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowStatistics(!showStatistics)}
            variant={showStatistics ? "default" : "outline"}
            className="flex items-center"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showStatistics ? 'Nascondi Statistiche' : 'Mostra Statistiche'}
          </Button>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtri
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Esporta
          </Button>
          <Button
            onClick={loadUsers}
            variant="outline"
            disabled={loading}
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
        </div>
      </div>      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Dashboard */}
      {showStatistics && (
        <StatisticsDashboard />
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Cerca per nome, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <UserFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={() => setFilters({
                role: '',
                status: '',
                date_from: '',
                date_to: '',
                sort_by: 'created_at',
                sort_order: 'desc'
              })}
            />
          )}
        </CardContent>
      </Card>      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <UserBulkActions
          selectedUsers={users.filter(user => selectedUsers.includes(user.id))}
          onActionComplete={loadUsers}
          onClearSelection={() => setSelectedUsers([])}
        />
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Utenti ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={users}
            loading={loading}
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            onSelectAll={handleSelectAll}
            onUserAction={handleUserAction}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <UserDetailModal
          isOpen={showUserDetail}
          onClose={() => {
            setShowUserDetail(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUserUpdate={loadUsers}
        />
      )}
    </div>
  );
};

export default UsersManagement;
