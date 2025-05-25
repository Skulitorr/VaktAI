import { Staff, Shift, SickCall, Suggestion } from '../types';

interface StaffResponse {
  staff: Staff[];
}

interface ShiftsResponse {
  shifts: Shift[];
}

interface SickCallsResponse {
  sickcalls: SickCall[];
}

interface SuggestionsResponse {
  suggestions: Suggestion[];
}

export const fetchStaff = async (): Promise<Staff[]> => {
  try {
    const response = await fetch('/api/staff.json');
    if (!response.ok) {
      throw new Error('Failed to fetch staff data');
    }
    const data: StaffResponse = await response.json();
    return data.staff;
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
};

export const fetchShifts = async (): Promise<Shift[]> => {
  try {
    const response = await fetch('/api/shifts.json');
    if (!response.ok) {
      throw new Error('Failed to fetch shifts data');
    }
    const data: ShiftsResponse = await response.json();
    return data.shifts;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return [];
  }
};

export const fetchSickCalls = async (): Promise<SickCall[]> => {
  try {
    const response = await fetch('/api/sickcalls.json');
    if (!response.ok) {
      throw new Error('Failed to fetch sick calls data');
    }
    const data: SickCallsResponse = await response.json();
    return data.sickcalls;
  } catch (error) {
    console.error('Error fetching sick calls:', error);
    return [];
  }
};

export const fetchSuggestions = async (): Promise<Suggestion[]> => {
  try {
    const response = await fetch('/api/suggestions.json');
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions data');
    }
    const data: SuggestionsResponse = await response.json();
    return data.suggestions;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

// Simulated POST endpoints
export const submitSickCall = async (sickCall: Omit<SickCall, 'id' | 'submitted' | 'status'>): Promise<SickCall> => {
  // In a real app, this would be a POST request to an API
  console.log('Submitting sick call:', sickCall);
  
  // Simulate API response
  return {
    ...sickCall,
    id: Math.floor(Math.random() * 1000) + 10, // Generate a random ID
    submitted: new Date().toISOString(),
    status: 'Pending'
  };
};

export const manageSuggestion = async (
  suggestionId: number, 
  action: 'accept' | 'reject'
): Promise<void> => {
  // In a real app, this would be a PUT or POST request to an API
  console.log(`${action === 'accept' ? 'Accepting' : 'Rejecting'} suggestion ID: ${suggestionId}`);
  
  // Simulate API call delay
  return new Promise(resolve => setTimeout(resolve, 500));
};