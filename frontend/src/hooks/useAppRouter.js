import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from './useAuthStore';
import { useCallback, useMemo } from 'react';

/**
 * Advanced routing hook for Smile Adventure
 * Provides enhanced navigation utilities with role-based routing
 */
export const useAppRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();

  /**
   * Navigate to appropriate dashboard based on user role
   */
  const goToDashboard = useCallback(() => {
    if (!isAuthenticated || !user?.role) {
      navigate('/login');
      return;
    }

    switch (user.role) {
      case 'parent':
        navigate('/parent');
        break;
      case 'professional':
        navigate('/professional');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  }, [navigate, isAuthenticated, user]);

  /**
   * Navigate with authentication check
   */
  const navigateWithAuth = useCallback((path, options = {}) => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: path },
        ...options 
      });
      return;
    }
    navigate(path, options);
  }, [navigate, isAuthenticated]);

  /**
   * Get role-based routes for current user
   */
  const getUserRoutes = useMemo(() => {
    if (!user?.role) return [];

    const routeMap = {
      parent: [
        { path: '/parent', label: 'Dashboard', icon: 'home' },
        { path: '/parent/profile', label: 'Profilo', icon: 'user' },
        { path: '/parent/settings', label: 'Impostazioni', icon: 'settings' },
      ],
      professional: [
        { path: '/professional', label: 'Dashboard', icon: 'home' },
        { path: '/professional/patients', label: 'Pazienti', icon: 'users' },
        { path: '/professional/reports', label: 'Report', icon: 'chart' },
        { path: '/professional/profile', label: 'Profilo', icon: 'user' },
      ],
      admin: [
        { path: '/admin', label: 'Dashboard', icon: 'home' },
        { path: '/admin/users', label: 'Gestione Utenti', icon: 'users' },
        { path: '/admin/system', label: 'Sistema', icon: 'settings' },
      ],
    };

    return routeMap[user.role] || [];
  }, [user?.role]);

  /**
   * Check if current route matches given path
   */
  const isCurrentRoute = useCallback((path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }, [location.pathname]);

  /**
   * Get breadcrumb for current route
   */
  const getBreadcrumb = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumb = [];

    // Add home
    breadcrumb.push({ label: 'Home', path: '/' });

    // Build breadcrumb based on segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      let label = segment;
      
      // Custom labels for known routes
      const labelMap = {
        parent: 'Genitore',
        professional: 'Professionista',
        admin: 'Amministratore',
        child: `Bambino ${params.childId || ''}`,
        game: 'Gioco',
        profile: 'Profilo',
        settings: 'Impostazioni',
        patients: 'Pazienti',
        reports: 'Report',
        users: 'Utenti',
        system: 'Sistema',
      };

      label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumb.push({
        label,
        path: currentPath,
        isLast: index === pathSegments.length - 1
      });
    });

    return breadcrumb;
  }, [location.pathname, params]);

  /**
   * Navigate back with fallback
   */
  const goBack = useCallback((fallbackPath = '/') => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  }, [navigate]);

  /**
   * Logout and redirect
   */
  const logoutAndRedirect = useCallback((redirectPath = '/') => {
    // This would be called from the auth store
    navigate(redirectPath);
  }, [navigate]);

  /**
   * Check if user can access route
   */
  const canAccessRoute = useCallback((routePath, requiredRoles = []) => {
    if (!isAuthenticated) return false;
    if (requiredRoles.length === 0) return true;
    return user?.role && requiredRoles.includes(user.role);
  }, [isAuthenticated, user?.role]);

  return {
    // Navigation methods
    navigate,
    goToDashboard,
    navigateWithAuth,
    goBack,
    logoutAndRedirect,
    
    // Route information
    location,
    params,
    isCurrentRoute,
    getBreadcrumb,
    getUserRoutes,
    canAccessRoute,
    
    // User context
    user,
    isAuthenticated,
  };
};

/**
 * Hook for managing route transitions and loading states
 */
export const useRouteTransition = () => {
  const location = useLocation();
  
  // You can add route transition logic here
  // For example, page analytics, loading states, etc.
  
  return {
    currentPath: location.pathname,
    previousPath: location.state?.from,
    isTransitioning: false, // This could be managed with additional state
  };
};

export default useAppRouter;
