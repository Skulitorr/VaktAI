import React from 'react';
import { Staff } from '../../types';
import { UserCircle } from 'lucide-react';

interface StaffCardProps {
  staff: Staff;
  compact?: boolean;
}

const StaffCard: React.FC<StaffCardProps> = ({ staff, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center space-x-2 bg-white rounded-md p-2 shadow-sm">
        <div className="bg-blue-100 text-blue-700 p-1.5 rounded-full">
          <UserCircle size={18} />
        </div>
        <div>
          <h4 className="font-medium text-sm">{staff.name}</h4>
          <p className="text-xs text-gray-500">{staff.role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center mb-3">
        <div className="bg-blue-100 text-blue-700 p-2.5 rounded-full mr-3">
          <UserCircle size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{staff.name}</h3>
          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            {staff.role}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <span className="w-20 font-medium">Email:</span>
          <span>{staff.email}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <span className="w-20 font-medium">Phone:</span>
          <span>{staff.phone}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <span className="w-20 font-medium">Level:</span>
          <span className={`${
            staff.skillLevel === 'Senior' ? 'text-blue-600' :
            staff.skillLevel === 'Mid' ? 'text-green-600' : 'text-orange-600'
          }`}>
            {staff.skillLevel}
          </span>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Availability</p>
        <div className="flex flex-wrap gap-1">
          {staff.availability.map((day) => (
            <span 
              key={day} 
              className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
            >
              {day.substring(0, 3)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffCard;