import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  fetchStaff, 
  fetchShifts, 
  fetchSickCalls, 
  fetchSuggestions, 
  submitSickCall,
  manageSuggestion
} from '../utils/api';
import { Staff, Shift, SickCall, Suggestion, AppContextType } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sickCalls, setSickCalls] = useState<SickCall[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffData, shiftsData, sickCallsData, suggestionsData] = await Promise.all([
        fetchStaff(),
        fetchShifts(),
        fetchSickCalls(),
        fetchSuggestions()
      ]);
      
      setStaff(staffData);
      setShifts(shiftsData);
      setSickCalls(sickCallsData);
      setSuggestions(suggestionsData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addSickCall = async (sickCallData: Omit<SickCall, 'id' | 'submitted' | 'status'>) => {
    try {
      const newSickCall = await submitSickCall(sickCallData);
      setSickCalls(prevSickCalls => [...prevSickCalls, newSickCall]);
      return Promise.resolve();
    } catch (err) {
      setError('Failed to submit sick call. Please try again.');
      console.error('Error submitting sick call:', err);
      return Promise.reject(err);
    }
  };

  const acceptSuggestion = async (suggestionId: number) => {
    try {
      await manageSuggestion(suggestionId, 'accept');
      
      // Update UI immediately (optimistic update)
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      
      // In a real app, we would also update the shifts and sickCalls state
      // based on the API response
      
      return Promise.resolve();
    } catch (err) {
      setError('Failed to accept suggestion. Please try again.');
      console.error('Error accepting suggestion:', err);
      return Promise.reject(err);
    }
  };

  const rejectSuggestion = async (suggestionId: number) => {
    try {
      await manageSuggestion(suggestionId, 'reject');
      
      // Update UI immediately (optimistic update)
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      
      return Promise.resolve();
    } catch (err) {
      setError('Failed to reject suggestion. Please try again.');
      console.error('Error rejecting suggestion:', err);
      return Promise.reject(err);
    }
  };

  const value: AppContextType = {
    staff,
    shifts,
    sickCalls,
    suggestions,
    loading,
    error,
    refreshData,
    addSickCall,
    acceptSuggestion,
    rejectSuggestion
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};