/**
 * 🎮 Recent Sessions Component
 * Display recent game sessions
 */

import React from 'react';
import { ClockIcon, TrophyIcon } from '@heroicons/react/24/outline';

const RecentSessions = ({ sessions }) => {
  // Mock sessions data if not provided
  const recentSessions = sessions || [
    {
      id: 1,
      childName: 'Emma',
      gameType: 'Sensory Integration',
      score: 85,
      duration: '12 min',
      completedAt: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      childName: 'Liam',
      gameType: 'Motor Skills',
      score: 92,
      duration: '8 min',
      completedAt: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      childName: 'Sophie',
      gameType: 'Cognitive Training',
      score: 78,
      duration: '15 min',
      completedAt: '1 day ago',
      status: 'completed'
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {recentSessions.map((session) => (
          <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">
                  {session.childName.charAt(0)}
                </span>
              </div>
              
              <div>
                <p className="font-medium text-gray-900">{session.childName}</p>
                <p className="text-sm text-gray-600">{session.gameType}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(session.score)}`}>
                  <TrophyIcon className="h-3 w-3 mr-1" />
                  {session.score}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {session.duration}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">{session.completedAt}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recentSessions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No recent sessions</p>
          <button className="mt-2 text-primary-600 hover:text-primary-700 font-medium">
            Start your first session
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentSessions;
