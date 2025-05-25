import React from 'react';
import { Shift, SickCall, Suggestion } from '../../types';
import { Calendar, Clock, UserX, Users } from 'lucide-react';

interface DashboardSummaryProps {
  shifts: Shift[];
  sickCalls: SickCall[];
  suggestions: Suggestion[];
  staffCount: number;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ 
  shifts, 
  sickCalls,

  suggestions,
  staffCount 
}) => {
  // Count this week's shifts
  const currentWeekShifts = shifts.length;
  
  // Count pending sick calls
  const pendingSickCalls = sickCalls.filter(call => call.status === 'Pending').length;
  
  // Group shifts by day for quick stats
  const shiftsByDay = shifts.reduce((acc, shift) => {
    acc[shift.day] = (acc[shift.day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Find the busiest day
  let busiestDay = '';
  let maxShifts = 0;
  
  Object.entries(shiftsByDay).forEach(([day, count]) => {
    if (count > maxShifts) {
      busiestDay = day;
      maxShifts = count;
    }
  });
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="bg-white rounded-lg shadow-md p-5 border-t-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Staff</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{staffCount}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <Users size={24} className="text-blue-500" />
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Available for scheduling
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-5 border-t-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Weekly Shifts</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{currentWeekShifts}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-full">
            <Clock size={24} className="text-purple-500" />
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          {busiestDay && (
            <span>Busiest day: <span className="font-medium">{busiestDay}</span></span>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-5 border-t-4 border-amber-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Sick Calls</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{pendingSickCalls}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-full">
            <UserX size={24} className="text-amber-500" />
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          {pendingSickCalls > 0 ? 
            'Require immediate attention' :
            'All sick calls handled'
          }
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-5 border-t-4 border-teal-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Suggestions</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{suggestions.length}</p>
          </div>
          <div className="p-3 bg-teal-50 rounded-full">
            <Calendar size={24} className="text-teal-500" />
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          {suggestions.length > 0 ? 
            'Staff replacement suggestions' :
            'No pending replacement suggestions'
          }
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;