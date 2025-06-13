/**
 * ⚡ Quick Actions Component
 * Role-based quick action buttons
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  UserPlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const QuickActions = ({ userRole }) => {
  const getActionsForRole = () => {
    if (userRole === 'parent') {
      return [
        {
          name: 'Add Child',
          description: 'Add a new child profile',
          icon: UserPlusIcon,
          href: '/children/add',
          color: 'bg-primary-600 hover:bg-primary-700'
        },
        {
          name: 'Start Session',
          description: 'Begin a new game session',
          icon: PlusIcon,
          href: '/sessions/new',
          color: 'bg-green-600 hover:bg-green-700'
        },
        {
          name: 'View Reports',
          description: 'Check progress reports',
          icon: DocumentTextIcon,
          href: '/reports',
          color: 'bg-blue-600 hover:bg-blue-700'
        }
      ];
    } else {
      return [
        {
          name: 'Generate Report',
          description: 'Create clinical report',
          icon: DocumentTextIcon,
          href: '/reports/generate',
          color: 'bg-primary-600 hover:bg-primary-700'
        },
        {
          name: 'View Analytics',
          description: 'Access detailed analytics',
          icon: ChartBarIcon,
          href: '/analytics',
          color: 'bg-purple-600 hover:bg-purple-700'
        },
        {
          name: 'Add Client',
          description: 'Add new client profile',
          icon: UserPlusIcon,
          href: '/clients/add',
          color: 'bg-green-600 hover:bg-green-700'
        }
      ];
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className={`
              block p-4 rounded-lg text-white transition-colors
              ${action.color}
            `}
          >
            <div className="flex items-center space-x-3">
              <action.icon className="h-6 w-6" />
              <div>
                <p className="font-medium">{action.name}</p>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
