import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { 
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  HeartIcon,
  BuildingOffice2Icon,
  UsersIcon,
  ServerIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

/**
 * Dashboard Sidebar Component
 * Provides navigation for authenticated users based on their role
 */
const Sidebar = ({ 
  isCollapsed = false, 
  onToggleCollapse,
  className = '' 
}) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Role-based navigation configuration
  const navigationConfig = {
    parent: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: HomeIcon,
        path: '/parent',
        exact: true
      },
      {
        id: 'children',
        label: 'I Miei Bambini',
        icon: UserGroupIcon,
        children: [
          { label: 'Panoramica', path: '/parent/children' },
          { label: 'Aggiungi Bambino', path: '/parent/children/add' }
        ]
      },
      {
        id: 'activities',
        label: 'Attività',
        icon: TrophyIcon,
        children: [
          { label: 'Sessioni Gioco', path: '/parent/activities' },
          { label: 'Routine Quotidiane', path: '/parent/routines' },
          { label: 'Obiettivi', path: '/parent/goals' }
        ]
      },
      {
        id: 'progress',
        label: 'Progressi',
        icon: ChartBarIcon,
        children: [
          { label: 'Report', path: '/parent/progress' },
          { label: 'Statistiche', path: '/parent/stats' },
          { label: 'Calendario', path: '/parent/calendar' }
        ]
      },
      {
        id: 'profile',
        label: 'Profilo',
        icon: UserCircleIcon,
        path: '/parent/profile'
      },
      {
        id: 'settings',
        label: 'Impostazioni',
        icon: CogIcon,
        path: '/parent/settings'
      }
    ],
    professional: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: HomeIcon,
        path: '/professional',
        exact: true
      },
      {
        id: 'patients',
        label: 'Pazienti',
        icon: UserGroupIcon,
        children: [
          { label: 'Lista Pazienti', path: '/professional/patients' },
          { label: 'Nuovi Pazienti', path: '/professional/patients/new' },
          { label: 'Appuntamenti', path: '/professional/appointments' }
        ]
      },
      {
        id: 'reports',
        label: 'Report & Analisi',
        icon: ClipboardDocumentListIcon,
        children: [
          { label: 'Report Individuali', path: '/professional/reports' },
          { label: 'Analisi Globali', path: '/professional/analytics' },
          { label: 'Esportazione Dati', path: '/professional/export' }
        ]
      },
      {
        id: 'clinic',
        label: 'Clinica',
        icon: BuildingOffice2Icon,
        children: [
          { label: 'Informazioni', path: '/professional/clinic' },
          { label: 'Orari', path: '/professional/schedule' },
          { label: 'Risorse', path: '/professional/resources' }
        ]
      },
      {
        id: 'profile',
        label: 'Profilo',
        icon: UserCircleIcon,
        path: '/professional/profile'
      },
      {
        id: 'settings',
        label: 'Impostazioni',
        icon: CogIcon,
        path: '/professional/settings'
      }
    ],
    admin: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: HomeIcon,
        path: '/admin',
        exact: true
      },
      {
        id: 'users',
        label: 'Gestione Utenti',
        icon: UsersIcon,
        children: [
          { label: 'Tutti gli Utenti', path: '/admin/users' },
          { label: 'Genitori', path: '/admin/users/parents' },
          { label: 'Professionisti', path: '/admin/users/professionals' },
          { label: 'Moderatori', path: '/admin/users/moderators' }
        ]
      },
      {
        id: 'content',
        label: 'Gestione Contenuti',
        icon: ClipboardDocumentListIcon,
        children: [
          { label: 'Attività', path: '/admin/content/activities' },
          { label: 'Giochi', path: '/admin/content/games' },
          { label: 'Risorse', path: '/admin/content/resources' }
        ]
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: ChartBarIcon,
        children: [
          { label: 'Utilizzo Piattaforma', path: '/admin/analytics' },
          { label: 'Performance', path: '/admin/performance' },
          { label: 'Report', path: '/admin/reports' }
        ]
      },
      {
        id: 'system',
        label: 'Sistema',
        icon: ServerIcon,
        children: [
          { label: 'Configurazione', path: '/admin/system' },
          { label: 'Backup', path: '/admin/backup' },
          { label: 'Logs', path: '/admin/logs' }
        ]
      }
    ]
  };

  const menuItems = navigationConfig[user?.role] || [];

  const toggleGroup = (groupId) => {
    if (isCollapsed) return; // Don't allow expansion when collapsed
    
    const newExpandedGroups = new Set(expandedGroups);
    if (expandedGroups.has(groupId)) {
      newExpandedGroups.delete(groupId);
    } else {
      newExpandedGroups.add(groupId);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const isGroupActive = (item) => {
    if (item.path && isActive(item.path, item.exact)) {
      return true;
    }
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };

  if (!user) {
    return null;
  }

  return (
    <aside className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${className}`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <HeartIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900 capitalize">
                  {user.role === 'professional' ? 'Dentista' : user.role}
                </h2>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                  {user.first_name} {user.last_name}
                </p>
              </div>
            </div>
          )}
          
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title={isCollapsed ? 'Espandi sidebar' : 'Comprimi sidebar'}
            >
              {isCollapsed ? (
                <ChevronDoubleRightIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDoubleLeftIcon className="h-4 w-4 text-gray-500" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.id}>
              {/* Main menu item */}
              {item.path ? (
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive(item.path, item.exact)
                      ? 'bg-primary-50 text-primary-700 border-r-3 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon className={`flex-shrink-0 h-5 w-5 ${
                    isActive(item.path, item.exact) ? 'text-primary-500' : 'text-gray-400'
                  } group-hover:text-gray-500`} />
                  {!isCollapsed && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => toggleGroup(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isGroupActive(item)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon className={`flex-shrink-0 h-5 w-5 ${
                    isGroupActive(item) ? 'text-primary-500' : 'text-gray-400'
                  } group-hover:text-gray-500`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 ml-3 text-left">{item.label}</span>
                      <svg
                        className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                          expandedGroups.has(item.id) ? 'transform rotate-90' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}

              {/* Submenu items */}
              {item.children && !isCollapsed && expandedGroups.has(item.id) && (
                <div className="ml-8 mt-1 space-y-1">                  {item.children.map((child, childIndex) => (
                    <Link
                      key={`${item.id}-${child.path}-${childIndex}`}
                      to={child.path}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive(child.path)
                          ? 'bg-primary-25 text-primary-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="ml-1">{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <TrophyIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900">Smile Points</p>
                <p className="text-xs text-gray-500 truncate">1,247 punti totali</p>
              </div>
            </div>
          </div>
        )}
      </div>    </aside>
  );
};

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  className: PropTypes.string
};

export default Sidebar;
