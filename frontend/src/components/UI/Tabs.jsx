/**
 * Tabs components
 * A reusable tabs system for organizing content
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

// Context for tabs state
const TabsContext = createContext();

const Tabs = ({ defaultValue, value, onValueChange, children, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value);

  const handleTabChange = (newValue) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setActiveTab(newValue);
    }
  };

  const contextValue = useMemo(() => ({
    activeTab: value || activeTab,
    onTabChange: handleTabChange
  }), [value, activeTab, onValueChange]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = '' }) => {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, className = '' }) => {
  const { activeTab, onTabChange } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => onTabChange(value)}
      className={`
        px-4 py-2 font-medium text-sm transition-colors
        ${isActive 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className = '' }) => {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) {
    return null;
  }

  return (
    <div className={`pt-4 ${className}`}>
      {children}
    </div>
  );
};

// PropTypes
Tabs.propTypes = {
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onValueChange: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

TabsList.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

TabsTrigger.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

TabsContent.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
