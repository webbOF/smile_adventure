import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

/**
 * Advanced Data Table Component
 * Provides sorting, filtering, pagination, and row actions
 */
const DataTable = ({
  data = [],
  columns = [],
  searchable = true,
  sortable = true,
  filterable = false,
  pagination = true,
  rowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  selectable = false,
  actions = [],
  loading = false,
  emptyMessage = 'Nessun dato disponibile',
  className = '',
  onRowClick,
  onSelectionChange,
  searchPlaceholder = 'Cerca...',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(rowsPerPage);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm && searchable) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(row => 
        columns.some(column => {
          const value = getNestedValue(row, column.accessor);
          return String(value || '').toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => {
          const cellValue = getNestedValue(row, key);
          if (typeof value === 'string') {
            return String(cellValue || '').toLowerCase().includes(value.toLowerCase());
          }
          return cellValue === value;
        });
      }
    });

    // Apply sorting
    if (sortConfig.key && sortable) {
      filtered.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, filters, columns, searchable, sortable]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  // Helper function to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Sorting handler
  const handleSort = useCallback((columnKey) => {
    if (!sortable) return;
    
    setSortConfig(prevSort => {
      if (prevSort.key === columnKey) {
        if (prevSort.direction === 'asc') {
          return { key: columnKey, direction: 'desc' };
        } else if (prevSort.direction === 'desc') {
          return { key: null, direction: null };
        }
      }
      return { key: columnKey, direction: 'asc' };
    });
  }, [sortable]);

  // Row selection handlers
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  }, [paginatedData]);

  const handleSelectRow = useCallback((index, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
    
    if (onSelectionChange) {
      const selectedData = Array.from(newSelected).map(idx => paginatedData[idx]);
      onSelectionChange(selectedData);
    }
  }, [selectedRows, paginatedData, onSelectionChange]);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Render cell content
  const renderCell = (row, column, rowIndex) => {
    const value = getNestedValue(row, column.accessor);
    
    if (column.render) {
      return column.render(value, row, rowIndex);
    }
    
    if (column.type === 'boolean') {
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Sì' : 'No'}
        </span>
      );
    }
    
    if (column.type === 'date') {
      return value ? new Date(value).toLocaleDateString('it-IT') : '-';
    }
    
    if (column.type === 'currency') {
      return value ? `€${Number(value).toFixed(2)}` : '-';
    }
    
    return value || '-';
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Table Controls */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
          {/* Search */}
          {searchable && (
            <div className="relative w-full sm:w-auto">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
              />
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            {filterable && (
              <button className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Filtri
              </button>
            )}
            <button className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Esporta
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            {/* Table Header */}
            <thead className="bg-gray-50">
              <tr>
                {/* Selection checkbox */}
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </th>
                )}
                
                {/* Column headers */}
                {columns.map((column) => (
                  <th
                    key={column.accessor}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      sortable && column.sortable !== false ? 'cursor-pointer hover:text-gray-700' : ''
                    }`}
                    onClick={() => sortable && column.sortable !== false && handleSort(column.accessor)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {sortable && column.sortable !== false && (
                        <div className="flex flex-col">
                          <ChevronUpIcon className={`h-3 w-3 ${
                            sortConfig.key === column.accessor && sortConfig.direction === 'asc'
                              ? 'text-primary-600'
                              : 'text-gray-400'
                          }`} />
                          <ChevronDownIcon className={`h-3 w-3 -mt-1 ${
                            sortConfig.key === column.accessor && sortConfig.direction === 'desc'
                              ? 'text-primary-600'
                              : 'text-gray-400'
                          }`} />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                
                {/* Actions column */}
                {actions.length > 0 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''} ${
                      selectedRows.has(rowIndex) ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => onRowClick && onRowClick(row, rowIndex)}
                  >
                    {/* Selection checkbox */}
                    {selectable && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(rowIndex)}
                          onChange={(e) => handleSelectRow(rowIndex, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    
                    {/* Data cells */}
                    {columns.map((column) => (
                      <td
                        key={column.accessor}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {renderCell(row, column, rowIndex)}
                      </td>
                    ))}
                    
                    {/* Actions */}
                    {actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          {actions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row, rowIndex);
                              }}
                              className={`p-1 rounded hover:bg-gray-100 ${action.className || ''}`}
                              title={action.label}
                            >
                              {action.icon}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && processedData.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
          {/* Rows per page */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Righe per pagina:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {rowsPerPageOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Pagination info and controls */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, processedData.length)} di {processedData.length}
            </span>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Precedente
              </button>
              
              {/* Page numbers */}
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-2 py-1 text-sm border rounded ${
                      pageNum === currentPage
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Successivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Common row actions for data tables
 */
export const tableActions = {
  view: (onClick) => ({
    label: 'Visualizza',
    icon: <EyeIcon className="h-4 w-4" />,
    onClick,
    className: 'text-blue-600 hover:text-blue-800'
  }),
  edit: (onClick) => ({
    label: 'Modifica',
    icon: <PencilIcon className="h-4 w-4" />,
    onClick,
    className: 'text-green-600 hover:text-green-800'
  }),
  delete: (onClick) => ({
    label: 'Elimina',
    icon: <TrashIcon className="h-4 w-4" />,
    onClick,
    className: 'text-red-600 hover:text-red-800'
  })
};

// PropTypes
DataTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.arrayOf(PropTypes.shape({
    accessor: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    sortable: PropTypes.bool,
    type: PropTypes.oneOf(['string', 'boolean', 'date', 'currency']),
    render: PropTypes.func
  })),
  searchable: PropTypes.bool,
  sortable: PropTypes.bool,
  filterable: PropTypes.bool,
  pagination: PropTypes.bool,
  rowsPerPage: PropTypes.number,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  selectable: PropTypes.bool,
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string
  })),
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  onRowClick: PropTypes.func,
  onSelectionChange: PropTypes.func,
  searchPlaceholder: PropTypes.string
};

export default DataTable;
