import React from 'react';
import { Staff, Suggestion, SickCall, Shift } from '../../types';
import { Check, X, AlertTriangle, UserCheck, Calendar } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface SuggestionPanelProps {
  suggestions: Suggestion[];
  sickCalls: SickCall[];
  staff: Staff[];
  shifts: Shift[];
}

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ 
  suggestions, 
  sickCalls, 
  staff, 
  shifts 
}) => {
  const { acceptSuggestion, rejectSuggestion } = useAppContext();
  
  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <UserCheck className="text-blue-500" size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending Suggestions</h3>
        <p className="text-gray-500">All shift replacements have been handled.</p>
      </div>
    );
  }
  
  // Helper function to find staff name
  const getStaffName = (staffId: number): string => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? staffMember.name : 'Unknown';
  };
  
  // Helper function to find shift details
  const getShiftDetails = (shiftId: number): { day: string; date: string; time: string } | null => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return null;
    
    return {
      day: shift.day,
      date: new Date(shift.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: `${shift.startTime} - ${shift.endTime}`
    };
  };
  
  // Helper function to find sick call details
  const getSickCallReason = (sickCallId: number): string => {
    const sickCall = sickCalls.find(sc => sc.id === sickCallId);
    return sickCall ? sickCall.reason : 'No reason provided';
  };
  
  const handleAccept = async (suggestionId: number) => {
    try {
      await acceptSuggestion(suggestionId);
    } catch (error) {
      console.error('Error accepting suggestion:', error);
    }
  };
  
  const handleReject = async (suggestionId: number) => {
    try {
      await rejectSuggestion(suggestionId);
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <div className="flex items-center">
          <AlertTriangle size={20} className="text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Replacement Suggestions ({suggestions.length})
          </h3>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve staff replacement suggestions for sick calls
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {suggestions.map((suggestion) => {
          const shiftDetails = getShiftDetails(suggestion.shiftId);
          
          return (
            <div key={suggestion.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="sm:flex sm:justify-between sm:items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {shiftDetails ? `${shiftDetails.day}, ${shiftDetails.date}` : 'Unknown shift'}
                    </span>
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full">
                      {shiftDetails?.time}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Original: </span>
                      <span className="font-medium text-red-600 line-through">
                        {getStaffName(suggestion.originalStaffId)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Suggested: </span>
                      <span className="font-medium text-green-600">
                        {getStaffName(suggestion.suggestedStaffId)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Reason for replacement:</p>
                    <p className="text-sm bg-gray-50 p-2 rounded border border-gray-100">
                      {suggestion.reason}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Original sick call reason:</p>
                    <p className="text-sm bg-red-50 text-red-700 p-2 rounded border border-red-100">
                      {getSickCallReason(suggestion.sickCallId)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 sm:ml-4 flex sm:flex-col justify-end space-x-3 sm:space-x-0 sm:space-y-3">
                  <button
                    onClick={() => handleAccept(suggestion.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    <Check size={16} className="mr-1" />
                    Accept
                  </button>
                  
                  <button
                    onClick={() => handleReject(suggestion.id)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <X size={16} className="mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestionPanel;