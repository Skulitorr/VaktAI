import React from 'react';
import Layout from '../components/layout/Layout';
import SickCallForm from '../components/ui/SickCallForm';
import { useAppContext } from '../context/AppContext';
import { AlertTriangle } from 'lucide-react';

const CallIn: React.FC = () => {
  const { staff, loading, error } = useAppContext();
  
  if (loading) {
    return (
      <Layout title="Sick Call">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Sick Call">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout
      title="Submit a Sick Call"
      subtitle="Use this form to notify management that you cannot make your scheduled shift"
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Please submit sick calls as early as possible to allow time for finding replacements.
              </p>
            </div>
          </div>
        </div>
        
        <SickCallForm staff={staff} />
      </div>
    </Layout>
  );
};

export default CallIn;