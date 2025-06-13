/**
 * 📱 Navigation Sidebar Component
 * Role-based navigation menu
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  ChartBarIcon, 
  UserIcon,
  AcademicCapIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { USER_ROLES } from '../../types/api.js';

const Sidebar = ({ open, setOpen, userRole }) => {
  const location = useLocation();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon, 
      roles: [USER_ROLES.PARENT, USER_ROLES.PROFESSIONAL, USER_ROLES.ADMIN] 
    },
    { 
      name: 'Children', 
      href: '/children', 
      icon: UsersIcon, 
      roles: [USER_ROLES.PARENT] 
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: ChartBarIcon, 
      roles: [USER_ROLES.PARENT, USER_ROLES.PROFESSIONAL, USER_ROLES.ADMIN] 
    },
    { 
      name: 'Professional', 
      href: '/professional', 
      icon: AcademicCapIcon, 
      roles: [USER_ROLES.PROFESSIONAL] 
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserIcon, 
      roles: [USER_ROLES.PARENT, USER_ROLES.PROFESSIONAL, USER_ROLES.ADMIN] 
    }
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo and close button */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-smile-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">SmileAdventure</span>
          </div>
          
          <button
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            onClick={() => setOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setOpen(false)}
                  >
                    <item.icon 
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0
                        ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}
                      `} 
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            SmileAdventure v1.0.0
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
