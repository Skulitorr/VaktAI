import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import ScheduleTable from '../components/ui/ScheduleTable';
import { useAppContext } from '../context/AppContext';
import { AlertTriangle, RefreshCw, Calendar } from 'lucide-react';

const Schedule: React.FC = () => {
  const { staff, shifts, loading, error, refreshData } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleRefresh = () => {
    refreshData();
  };
  
  const generateNewSchedule = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      console.log('Generating new schedule...');
      console.log('In a real app, this would call an API endpoint');
      setIsGenerating(false);
    }, 2000);
  };
  
  if (loading) {
    return (
      <Layout title="Weekly Schedule">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Weekly Schedule">
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
      title="Weekly Schedule"
      subtitle="View and manage the complete staff schedule"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm mb-3 sm:mb-0">
          <Calendar size={16} className="mr-1.5" />
          <span>Showing schedule for week of Jan 6 - Jan 12, 2025</span>
        </div>
        
        <button
          onClick={generateNewSchedule}
          disabled={isGenerating}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            isGenerating 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>Generate New Schedule</>
          )}
        </button>
      </div>
      
      {shifts.length > 0 ? (
        <ScheduleTable shifts={shifts} staff={staff} />
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No shifts have been scheduled yet.</p>
          <button
            onClick={generateNewSchedule}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Generate Schedule
          </button>
        </div>
      )}
    </Layout>
  );
};

export default Schedule;