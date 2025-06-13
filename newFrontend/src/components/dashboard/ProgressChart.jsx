/**
 * 📈 Progress Chart Component
 * Visual progress tracking chart
 */

import React from 'react';

const ProgressChart = ({ data }) => {
  // Mock progress data
  const progressData = data || {
    weeklyProgress: [65, 72, 78, 85, 89, 92, 95],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
            <span className="text-sm text-gray-600">This Week</span>
          </div>
        </div>
      </div>
      
      {/* Simple bar chart representation */}
      <div className="space-y-3">
        {progressData.labels.map((label, index) => {
          const value = progressData.weeklyProgress[index];
          return (
            <div key={label} className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600 w-8">{label}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${value}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-10">{value}%</span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Average Progress</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(progressData.weeklyProgress.reduce((a, b) => a + b, 0) / progressData.weeklyProgress.length)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Improvement</p>
            <p className="text-lg font-semibold text-green-600">+12%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
