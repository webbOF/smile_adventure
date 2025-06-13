/**
 * 📊 Dashboard Stats Component
 * Key performance indicators and statistics
 */

import React from 'react';
import { 
  UsersIcon, 
  ChartBarIcon, 
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const DashboardStats = ({ data, userRole }) => {
  // Mock data if not provided
  const stats = data?.overview || {
    totalSessions: 24,
    totalChildren: 3,
    weeklyProgress: 85,
    achievementsUnlocked: 12
  };

  const getStatsForRole = () => {
    if (userRole === 'parent') {
      return [
        {
          name: 'Children',
          value: stats.totalChildren || 0,
          icon: UsersIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          name: 'Sessions This Week',
          value: stats.weeklySessions || 0,
          icon: ClockIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        {
          name: 'Progress',
          value: `${stats.weeklyProgress || 0}%`,
          icon: ChartBarIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        },
        {
          name: 'Achievements',
          value: stats.achievementsUnlocked || 0,
          icon: TrophyIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        }
      ];
    } else {
      return [
        {
          name: 'Active Clients',
          value: stats.activeClients || 0,
          icon: UsersIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          name: 'Sessions This Week',
          value: stats.weeklySessions || 0,
          icon: ClockIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        {
          name: 'Avg Progress',
          value: `${stats.avgProgress || 0}%`,
          icon: ChartBarIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        },
        {
          name: 'Reports Generated',
          value: stats.reportsGenerated || 0,
          icon: TrophyIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        }
      ];
    }
  };

  const statsToShow = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsToShow.map((stat) => (
        <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
