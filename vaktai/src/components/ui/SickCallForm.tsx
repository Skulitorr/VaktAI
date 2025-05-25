import React, { useState } from 'react';
import { Staff } from '../../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface SickCallFormProps {
  staff: Staff[];
}

const SickCallForm: React.FC<SickCallFormProps> = ({ staff }) => {
  const { addSickCall } = useAppContext();
  
  const [formData, setFormData] = useState({
    staffId: '',
    date: '',
    reason: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.staffId) {
      newErrors.staffId = 'Please select a staff member';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }
    
    if (!formData.reason) {
      newErrors.reason = 'Please provide a reason';
    } else if (formData.reason.length < 5) {
      newErrors.reason = 'Reason must be at least 5 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear the error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Reset success message if editing after a successful submission
    if (success) {
      setSuccess(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      await addSickCall({
        staffId: parseInt(formData.staffId, 10),
        date: formData.date,
        reason: formData.reason
      });
      
      // Reset form
      setFormData({
        staffId: '',
        date: '',
        reason: ''
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000); // Hide success message after 5 seconds
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ form: 'Failed to submit sick call. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Submit a Sick Call</h2>
      
      {success && (
        <div className="mb-6 flex items-center p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          <CheckCircle2 size={20} className="mr-2 flex-shrink-0" />
          <p>Sick call submitted successfully! Management has been notified.</p>
        </div>
      )}
      
      {errors.form && (
        <div className="mb-6 flex items-center p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <p>{errors.form}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-1">
              Staff Member
            </label>
            <select
              id="staffId"
              name="staffId"
              value={formData.staffId}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.staffId ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              disabled={submitting}
            >
              <option value="">Select a staff member</option>
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
            {errors.staffId && (
              <p className="mt-1 text-sm text-red-600">{errors.staffId}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              min={today}
              value={formData.date}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.date ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              disabled={submitting}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={3}
              value={formData.reason}
              onChange={handleChange}
              placeholder="Please provide details about your absence..."
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              disabled={submitting}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              } transition-colors duration-200`}
            >
              {submitting ? 'Submitting...' : 'Submit Sick Call'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SickCallForm;