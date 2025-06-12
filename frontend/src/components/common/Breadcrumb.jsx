import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useAppRouter } from '../../hooks/useAppRouter';

/**
 * Breadcrumb Navigation Component
 * Shows the current page hierarchy and allows navigation to parent pages
 */
const Breadcrumb = ({ className = '', showHome = true }) => {
  const { getBreadcrumb } = useAppRouter();

  // Filter out home if not wanted
  const breadcrumbItems = showHome ? getBreadcrumb : getBreadcrumb.slice(1);

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb for home page only
  }

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
            )}
            
            {item.isLast ? (
              <span className="text-gray-600 font-medium">
                {index === 0 && showHome ? (
                  <HomeIcon className="h-4 w-4" />
                ) : (
                  item.label
                )}
              </span>
            ) : (
              <Link
                to={item.path}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {index === 0 && showHome ? (
                  <HomeIcon className="h-4 w-4" />
                ) : (
                  item.label
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
