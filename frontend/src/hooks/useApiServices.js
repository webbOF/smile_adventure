/**
 * Custom Hooks for API Services
 * React hooks for easier integration with API services
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userService, reportService } from '../services';
import { useAuthStore } from './useAuthStore';

// ================================
// USER SERVICE HOOKS
// ================================

/**
 * Hook for managing children data
 * @returns {Object} Children data and operations
 */
export const useChildren = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    data: children = [],
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['children', user?.id],
    () => userService.getChildren(),
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const createChildMutation = useMutation(
    (childData) => userService.createChild(childData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['children']);
      },
    }
  );

  const updateChildMutation = useMutation(
    ({ childId, ...data }) => userService.updateChild(childId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['children']);
      },
    }
  );

  const deleteChildMutation = useMutation(
    (childId) => userService.deleteChild(childId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['children']);
      },
    }
  );

  return {
    children,
    isLoading,
    error,
    refetch,
    createChild: createChildMutation.mutateAsync,
    updateChild: updateChildMutation.mutateAsync,
    deleteChild: deleteChildMutation.mutateAsync,
    isCreating: createChildMutation.isLoading,
    isUpdating: updateChildMutation.isLoading,
    isDeleting: deleteChildMutation.isLoading,
  };
};

/**
 * Hook for managing specific child data
 * @param {number} childId - Child ID
 * @returns {Object} Child data and operations
 */
export const useChild = (childId) => {
  const queryClient = useQueryClient();

  const {
    data: child,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['child', childId],
    () => userService.getChild(childId),
    {
      enabled: !!childId,
      staleTime: 5 * 60 * 1000,
    }
  );

  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery(
    ['child-stats', childId],
    () => userService.getChildStats(childId),
    {
      enabled: !!childId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const updateChildMutation = useMutation(
    (data) => userService.updateChild(childId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['child', childId]);
        queryClient.invalidateQueries(['children']);
      },
    }
  );

  return {
    child,
    stats,
    isLoading,
    statsLoading,
    error,
    refetch,
    updateChild: updateChildMutation.mutateAsync,
    isUpdating: updateChildMutation.isLoading,
  };
};

/**
 * Hook for user profile management
 * @returns {Object} Profile data and operations
 */
export const useUserProfile = () => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['user-profile', user?.id],
    () => userService.getProfile(),
    {
      enabled: !!user,
      initialData: user,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const updateProfileMutation = useMutation(
    (profileData) => userService.updateProfile(profileData),
    {
      onSuccess: (updatedProfile) => {
        queryClient.setQueryData(['user-profile', user?.id], updatedProfile);
        updateUser(updatedProfile);
      },
    }
  );

  const uploadAvatarMutation = useMutation(
    (avatarFile) => userService.uploadAvatar(avatarFile),
    {
      onSuccess: (result) => {
        const updatedProfile = { ...profile, avatar: result.avatar_url };
        queryClient.setQueryData(['user-profile', user?.id], updatedProfile);
        updateUser(updatedProfile);
      },
    }
  );

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUpdating: updateProfileMutation.isLoading,
    isUploading: uploadAvatarMutation.isLoading,
  };
};

// ================================
// REPORT SERVICE HOOKS
// ================================

/**
 * Hook for managing game sessions
 * @param {Object} [filters] - Query filters
 * @returns {Object} Game sessions data and operations
 */
export const useGameSessions = (filters = {}) => {
  const queryClient = useQueryClient();

  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['game-sessions', filters],
    () => reportService.getGameSessions(filters),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const createSessionMutation = useMutation(
    (sessionData) => reportService.createGameSession(sessionData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['game-sessions']);
      },
    }
  );

  const updateSessionMutation = useMutation(
    ({ sessionId, ...data }) => reportService.updateGameSession(sessionId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['game-sessions']);
      },
    }
  );

  const completeSessionMutation = useMutation(
    ({ sessionId, ...data }) => reportService.completeGameSession(sessionId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['game-sessions']);
      },
    }
  );

  return {
    sessions,
    isLoading,
    error,
    refetch,
    createSession: createSessionMutation.mutateAsync,
    updateSession: updateSessionMutation.mutateAsync,
    completeSession: completeSessionMutation.mutateAsync,
    isCreating: createSessionMutation.isLoading,
    isUpdating: updateSessionMutation.isLoading,
    isCompleting: completeSessionMutation.isLoading,
  };
};

/**
 * Hook for child-specific game sessions
 * @param {number} childId - Child ID
 * @param {Object} [filters] - Additional filters
 * @returns {Object} Child's game sessions data
 */
export const useChildGameSessions = (childId, filters = {}) => {
  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['child-game-sessions', childId, filters],
    () => reportService.getChildGameSessions(childId, filters),
    {
      enabled: !!childId,
      staleTime: 2 * 60 * 1000,
    }
  );

  return {
    sessions,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for managing activities
 * @param {Object} [filters] - Query filters
 * @returns {Object} Activities data and operations
 */
export const useActivities = (filters = {}) => {
  const queryClient = useQueryClient();

  const {
    data: activities = [],
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['activities', filters],
    () => reportService.getActivities(filters),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const createActivityMutation = useMutation(
    (activityData) => reportService.createActivity(activityData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['activities']);
      },
    }
  );

  const updateActivityMutation = useMutation(
    ({ activityId, ...data }) => reportService.updateActivity(activityId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['activities']);
      },
    }
  );

  const completeActivityMutation = useMutation(
    ({ activityId, ...data }) => reportService.completeActivity(activityId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['activities']);
      },
    }
  );

  return {
    activities,
    isLoading,
    error,
    refetch,
    createActivity: createActivityMutation.mutateAsync,
    updateActivity: updateActivityMutation.mutateAsync,
    completeActivity: completeActivityMutation.mutateAsync,
    isCreating: createActivityMutation.isLoading,
    isUpdating: updateActivityMutation.isLoading,
    isCompleting: completeActivityMutation.isLoading,
  };
};

/**
 * Hook for child-specific activities
 * @param {number} childId - Child ID
 * @param {Object} [filters] - Additional filters
 * @returns {Object} Child's activities data
 */
export const useChildActivities = (childId, filters = {}) => {
  const {
    data: activities = [],
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['child-activities', childId, filters],
    () => reportService.getChildActivities(childId, filters),
    {
      enabled: !!childId,
      staleTime: 5 * 60 * 1000,
    }
  );

  return {
    activities,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for child progress reports
 * @param {number} childId - Child ID
 * @param {Object} [options] - Report options
 * @returns {Object} Progress report data
 */
export const useChildProgressReport = (childId, options = {}) => {
  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['child-progress-report', childId, options],
    () => reportService.getChildProgressReport(childId, options),
    {
      enabled: !!childId,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  return {
    report,
    isLoading,
    error,
    refetch,
  };
};

// ================================
// UTILITY HOOKS
// ================================

/**
 * Hook for debounced API calls
 * @param {Function} callback - Callback function
 * @param {number} delay - Debounce delay in ms
 * @returns {Function} Debounced callback
 */
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Hook for loading states management
 * @returns {Object} Loading state utilities
 */
export const useLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = useCallback((key) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates,
  };
};

/**
 * Hook for error handling
 * @returns {Object} Error handling utilities
 */
export const useErrorHandler = () => {
  const [errors, setErrors] = useState({});

  const setError = useCallback((key, error) => {
    setErrors(prev => ({
      ...prev,
      [key]: error,
    }));
  }, []);

  const clearError = useCallback((key) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasError = useCallback((key) => {
    return !!errors[key];
  }, [errors]);

  const getError = useCallback((key) => {
    return errors[key];
  }, [errors]);

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    hasError,
    getError,
  };
};

/**
 * Hook for pagination
 * @param {number} [initialPage=1] - Initial page
 * @param {number} [initialLimit=10] - Initial items per page
 * @returns {Object} Pagination utilities
 */
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const goToPage = useCallback((newPage) => {
    setPage(Math.max(1, newPage));
  }, []);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
    resetPagination,
  };
};
