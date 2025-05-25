export interface Staff {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  availability: string[];
  skillLevel: 'Junior' | 'Mid' | 'Senior';
}

export interface Shift {
  id: number;
  staffId: number;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface SickCall {
  id: number;
  staffId: number;
  date: string;
  reason: string;
  submitted: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Suggestion {
  id: number;
  sickCallId: number;
  originalStaffId: number;
  suggestedStaffId: number;
  shiftId: number;
  date: string;
  reason: string;
}

export interface AppContextType {
  staff: Staff[];
  shifts: Shift[];
  sickCalls: SickCall[];
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addSickCall: (sickCall: Omit<SickCall, 'id' | 'submitted' | 'status'>) => Promise<void>;
  acceptSuggestion: (suggestionId: number) => Promise<void>;
  rejectSuggestion: (suggestionId: number) => Promise<void>;
}