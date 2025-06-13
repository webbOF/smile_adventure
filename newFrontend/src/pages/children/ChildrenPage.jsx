/**
 * 👶 Children Page Component
 * Manage child profiles and progress
 */

import React from 'react';
import { useUser } from '../../context/UserContext.jsx';

const ChildrenPage = () => {
  const { children, loading } = useUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Children</h1>
        <button className="btn btn-primary">
          Add Child
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Your Children</h2>
        
        {loading ? (
          <p>Loading children...</p>
        ) : children?.length > 0 ? (
          <div className="grid gap-4">
            {children.map((child) => (
              <div key={child.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{child.first_name} {child.last_name}</h3>
                <p className="text-sm text-gray-600">Age: {calculateAge(child.date_of_birth)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No children added yet. Click "Add Child" to get started.</p>
        )}
      </div>
    </div>
  );
};

const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export default ChildrenPage;
