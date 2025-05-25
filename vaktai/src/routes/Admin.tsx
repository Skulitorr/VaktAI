import React from 'react';
import Layout from '../components/layout/Layout';
import SuggestionPanel from '../components/ui/SuggestionPanel';
import StaffCard from '../components/ui/StaffCard';
import { useAppContext } from '../context/AppContext';
import { AlertTriangle, RefreshCw, UserX } from 'lucide-react';

const Admin: React.FC = () => {
  const { 
    staff, 
    shifts, 
    sickCalls, 
    suggestions, 
    loading, 
    error, 
    refreshData 
  } = useAppContext();
  
  const pendingSickCalls = sickCalls.filter(call => call.status === 'Pending');
  
  const handleRefresh = () => {
    refreshData();
  };
  
  if (loading) {
    return (
      <Layout title="Admin">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Admin">
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
  
  // Get staff details for each sick call
  const getSickCallStaff = (staffId: number) => {
    return staff.find(s => s.id === staffId) || null;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  return (
    <Layout
      title="Admin Dashboard"
      subtitle="Manage sick calls and staff replacements"
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw size={16} className="mr-1.5" />
          Refresh Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Sick Calls */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-red-50 p-4 border-b border-red-100">
              <div className="flex items-center">
                <UserX size={20} className="text-red-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Pending Sick Calls ({pendingSickCalls.length})
                </h3>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Staff members who have reported they cannot work
              </p>
            </div>
            
            {pendingSickCalls.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {pendingSickCalls.map(sickCall => {
                  const staffMember = getSickCallStaff(sickCall.staffId);
                  
                  return (
                    <div key={sickCall.id} className="p-4">
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {formatDate(sickCall.date)}
                        </span>
                      </div>
                      
                      {staffMember && (
                        <StaffCard staff={staffMember} compact={true} />
                      )}
                      
                      <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm">
                        <p className="font-medium text-xs text-gray-500 mb-1">Reason:</p>
                        <p className="text-gray-700">{sickCall.reason}</p>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        Submitted: {new Date(sickCall.submitted).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No pending sick calls.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Replacement Suggestions */}
        <div className="lg:col-span-2">
          <SuggestionPanel 
            suggestions={suggestions} 
            sickCalls={sickCalls} 
            staff={staff} 
            shifts={shifts} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default Admin;