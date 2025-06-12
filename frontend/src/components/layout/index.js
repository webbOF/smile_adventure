/**
 * Layout Components Index
 * Centralized exports for all layout components
 */

// Layout Components
export { default as DashboardLayout } from './DashboardLayout';
export { default as Sidebar } from './Sidebar';

// Re-export commonly used combinations
export const LayoutComponents = {
  DashboardLayout,
  Sidebar
};

export default LayoutComponents;
