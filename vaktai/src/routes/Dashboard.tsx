import React from 'react';
import Layout from '../components/layout/Layout';
import ScheduleTable from '../components/ui/ScheduleTable';
import DashboardSummary from '../components/ui/DashboardSummary';
import { useAppContext } from '../context/AppContext';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    staff, 
    shifts, 
    sickCalls, 
    suggestions, 
    loading, 
    error,
    refreshData 
  } = useAppContext();
  
  const today = new Date().toISOString().split('T')[0];
  
  // Filter for today's shifts
  const todaysShifts = shifts.filter(shift => shift.date === today);
  
  // Check if there are pending sick calls
  const pendingSickCalls = sickCalls.filter(call => call.status === 'Pending');
  
  const handleRefresh = () => {
    refreshData();
  };
  
  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw size={16} className="mr-1.5" />
          Retry
        </button>
      </Layout>
    );
  }
  
  return (
    <Layout 
      title="Dashboard" 
      subtitle="Overview of your staff schedule and notifications"
    >
      {/* Dashboard Summary */}
      <DashboardSummary 
        shifts={shifts}
        sickCalls={sickCalls}
        suggestions={suggestions}
        staffCount={staff.length}
      />
      
      {/* Alert banners */}
      <div className="mt-6 space-y-4">
        {pendingSickCalls.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  There {pendingSickCalls.length === 1 ? 'is' : 'are'} {pendingSickCalls.length} pending sick call{pendingSickCalls.length !== 1 ? 's' : ''} requiring attention.
                </p>
                <div className="mt-2">
                  <a href="/admin" className="text-sm font-medium text-amber-700 hover:text-amber-600">
                    View in Admin →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {suggestions.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  There {suggestions.length === 1 ? 'is' : 'are'} {suggestions.length} staff replacement suggestion{suggestions.length !== 1 ? 's' : ''} pending review.
                </p>
                <div className="mt-2">
                  <a href="/admin" className="text-sm font-medium text-blue-700 hover:text-blue-600">
                    View in Admin →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Today's Schedule */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Today's Schedule</h2>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </button>
        </div>
        
        {todaysShifts.length > 0 ? (
          <ScheduleTable 
            shifts={todaysShifts} 
            staff={staff} 
            highlightDate={today} 
          />
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">No shifts scheduled for today.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;