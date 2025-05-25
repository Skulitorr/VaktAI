import React, { useState } from 'react';
import { Staff, Shift } from '../../types';
import { Calendar, Clock, Search, Filter } from 'lucide-react';

interface ScheduleTableProps {
  shifts: Shift[];
  staff: Staff[];
  highlightDate?: string;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ shifts, staff, highlightDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState<string>('');
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Group shifts by day
  const shiftsByDay = days.map(day => {
    return {
      day,
      shifts: shifts.filter(shift => shift.day === day)
    };
  });
  
  // Filter shifts based on search and day filter
  const filteredShiftsByDay = shiftsByDay.map(dayGroup => {
    return {
      day: dayGroup.day,
      shifts: dayGroup.shifts.filter(shift => {
        const staffMember = staff.find(s => s.id === shift.staffId);
        const nameMatch = staffMember ? 
          staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) : 
          false;
        
        const dayMatch = filterDay ? dayGroup.day === filterDay : true;
        
        return nameMatch && dayMatch;
      })
    };
  }).filter(dayGroup => filterDay ? dayGroup.day === filterDay : true);
  
  // Find a staff member by ID
  const getStaffName = (staffId: number): string => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? staffMember.name : 'Unknown';
  };

  // Get shift date in formatted form
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Determine if a shift should be highlighted
  const isHighlighted = (date: string): boolean => {
    return date === highlightDate;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search staff..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative w-full sm:w-40">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
            >
              <option value="">All days</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                Staff
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                Shift Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredShiftsByDay.length > 0 ? (
              filteredShiftsByDay.flatMap(dayGroup => 
                dayGroup.shifts.length > 0 ? (
                  dayGroup.shifts.map(shift => (
                    <tr 
                      key={shift.id} 
                      className={`${
                        isHighlighted(shift.date) 
                          ? 'bg-blue-50 hover:bg-blue-100' 
                          : 'hover:bg-gray-50'
                      } transition-colors duration-150 ease-in-out`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {shift.day}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1 text-gray-400" />
                          {formatDate(shift.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getStaffName(shift.staffId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1 text-gray-400" />
                          {shift.startTime} - {shift.endTime}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  searchTerm || filterDay ? [] : (
                    <tr key={dayGroup.day}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dayGroup.day}
                      </td>
                      <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm italic text-gray-500">
                        No shifts scheduled
                      </td>
                    </tr>
                  )
                )
              )
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                  {searchTerm ? 
                    `No shifts found for "${searchTerm}"` : 
                    'No shifts scheduled for the selected filters'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleTable;