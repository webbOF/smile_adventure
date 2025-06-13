/**
 * 👤 Profile Page Component
 * User profile management
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUser } from '../../context/UserContext.jsx';

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile } = useUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1">{user?.first_name} {user?.last_name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 capitalize">{user?.role}</p>
          </div>
        </div>
        
        <button className="mt-6 btn btn-primary">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
