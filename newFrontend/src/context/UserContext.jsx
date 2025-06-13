/**
 * 👤 User Context Provider
 * Manages user profile data and children information
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/index.js';
import { useAuth } from './AuthContext.jsx';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userChildren, setUserChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState(null);

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      clearUserData();
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load profile data
      const profileResponse = await userService.getProfile();
      if (profileResponse?.success) {
        setProfile(profileResponse.data);
      }

      // Load children data for parents
      if (user?.role === 'parent') {
        const childrenResponse = await userService.getChildren();
        if (childrenResponse?.success) {
          setUserChildren(childrenResponse.data || []);
        }
      }

      // Load preferences
      const prefsResponse = await userService.getPreferences();
      if (prefsResponse?.success) {
        setPreferences(prefsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearUserData = () => {
    setProfile(null);
    setUserChildren([]);
    setPreferences(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await userService.updateProfile(profileData);
      if (response?.success) {
        setProfile(response.data);
        return { success: true };
      }
      throw new Error(response?.message || 'Failed to update profile');
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const addChild = async (childData) => {
    try {
      const response = await userService.addChild(childData);
      if (response?.success) {
        setUserChildren(prev => [...prev, response.data]);
        return { success: true, data: response.data };
      }
      throw new Error(response?.message || 'Failed to add child');
    } catch (error) {
      console.error('Add child error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateChild = async (childId, childData) => {
    try {
      const response = await userService.updateChild(childId, childData);
      if (response?.success) {
        setUserChildren(prev => 
          prev.map(child => 
            child.id === childId ? response.data : child
          )
        );
        return { success: true, data: response.data };
      }
      throw new Error(response?.message || 'Failed to update child');
    } catch (error) {
      console.error('Update child error:', error);
      return { success: false, error: error.message };
    }
  };

  const removeChild = async (childId) => {
    try {
      const response = await userService.removeChild(childId);
      if (response?.success) {
        setUserChildren(prev => prev.filter(child => child.id !== childId));
        return { success: true };
      }
      throw new Error(response?.message || 'Failed to remove child');
    } catch (error) {
      console.error('Remove child error:', error);
      return { success: false, error: error.message };
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const response = await userService.updatePreferences(newPreferences);
      if (response?.success) {
        setPreferences(response.data);
        return { success: true };
      }
      throw new Error(response?.message || 'Failed to update preferences');
    } catch (error) {
      console.error('Update preferences error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshData = () => {
    if (isAuthenticated) {
      loadUserData();
    }
  };

  const value = {
    profile,
    children: userChildren,
    preferences,
    loading,
    updateProfile,
    addChild,
    updateChild,
    removeChild,
    updatePreferences,
    refreshData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
