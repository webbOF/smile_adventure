/**
 * Bulk Selection Context
 * Context provider per la gestione della selezione multipla di bambini
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const BulkSelectionContext = createContext();

export const useBulkSelection = () => {
  const context = useContext(BulkSelectionContext);
  if (!context) {
    throw new Error('useBulkSelection must be used within a BulkSelectionProvider');
  }
  return context;
};

export const BulkSelectionProvider = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const toggleSelection = useCallback((itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((itemIds) => {
    setSelectedItems(new Set(itemIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => {
      const newMode = !prev;
      if (!newMode) {
        clearSelection();
      }
      return newMode;
    });
  }, [clearSelection]);

  const isSelected = useCallback((itemId) => {
    return selectedItems.has(itemId);
  }, [selectedItems]);
  const getSelectedArray = useCallback(() => {
    return Array.from(selectedItems);
  }, [selectedItems]);

  const value = useMemo(() => ({
    selectedItems: getSelectedArray(),
    selectedCount: selectedItems.size,
    selectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectionMode,
    isSelected,
    hasSelection: selectedItems.size > 0
  }), [
    getSelectedArray,
    selectedItems.size,
    selectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectionMode,
    isSelected
  ]);

  return (
    <BulkSelectionContext.Provider value={value}>
      {children}
    </BulkSelectionContext.Provider>
  );
};

BulkSelectionProvider.propTypes = {
  children: PropTypes.node.isRequired
};
