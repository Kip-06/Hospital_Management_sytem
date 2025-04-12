// src/pages/doctor/AppointmentsForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  FileText,
  Video,
  CheckCircle
} from 'lucide-react';
import { patientsApi } from '../../../store/api/patientsApi';
import { format} from 'date-fns';

// Interface for the API request
interface CreateAppointmentRequest {
  patientId: number;
  doctorId: number;
  departmentId: number;
  dateTime: string;
  type: 'regular' | 'follow-up' | 'consultation' | 'emergency' | 'virtual-regular' | 'virtual-follow-up' | 'virtual-consultation' | 'virtual-emergency';
  notes?: string;
  symptoms?: string;
  status: string;
}

// Local interface for UI representation
interface AppointmentUI {
  id: number;
  patientName: string;
  patientId: number;
  avatar: string;
  bgColor: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  notes?: string;
  isVirtual: boolean;
  isNewPatient: boolean;
  doctorId: number;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  bgColor?: string;
}

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentBooked: (appointment: any) => void;
  appointmentApi: any;
  doctorId: number;
  editAppointment?: AppointmentUI | null;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  isOpen, 
  onClose, 
  onAppointmentBooked,
  appointmentApi,
  doctorId,
  editAppointment 
}) => {
  // Form states
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [durationType, setDurationType] = useState<string>('30min');
  const [appointmentType, setAppointmentType] = useState<string>('regular');
  const [notes, setNotes] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [isVirtual, setIsVirtual] = useState<boolean>(false);
  const [showPatientList, setShowPatientList] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [defaultDepartment, setDefaultDepartment] = useState<number | null>(null);
  const urlParams = new URLSearchParams(window.location.search);


 
  // RTK Query hooks
  const [createAppointment, { isLoading: isCreating }] = appointmentApi.useCreateAppointmentMutation();
  const [updateAppointment, { isLoading: isUpdating }] = appointmentApi.useUpdateAppointmentMutation();
  
  const { 
    data: patientsData, 
    isLoading: isLoadingPatients 
  } = patientsApi.useGetPatientsQuery({
    search: patientSearch,
    limit: 10
  });

  const { 
    data: departmentId,
    isLoading: isLoadingDepartment,
    isError: isDepartmentError,
    error: departmentError
  } = appointmentApi.useGetDefaultDepartmentForDoctorQuery(doctorId, { skip: !doctorId });
  
  const DEV_MODE = true;
const fallbackDepartmentId = 3; // Use a department ID that exists in your database

useEffect(() => {
  if (departmentId) {
    setDefaultDepartment(departmentId);
  } else if (DEV_MODE && !isLoadingDepartment && isDepartmentError) {
    console.log("Using fallback department ID for development:", fallbackDepartmentId);
    setDefaultDepartment(fallbackDepartmentId);
  }
}, [departmentId, isLoadingDepartment, isDepartmentError]);

  // Convert time format to minutes for calculation
  const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (start: string, duration: string): string => {
    if (!start) return '';
    
    const [hours, minutes] = start.split(':').map(Number);
    let durationMinutes = 0;
    
    switch (duration) {
      case '15min': durationMinutes = 15; break;
      case '30min': durationMinutes = 30; break;
      case '45min': durationMinutes = 45; break;
      case '1hour': durationMinutes = 60; break;
      default: durationMinutes = 30;
    }
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    const endDate = new Date(date.getTime() + durationMinutes * 60000);
    const endHours = endDate.getHours();
    const endMinutes = endDate.getMinutes();
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // Set form for editing if editAppointment is provided
  useEffect(() => {
    if (editAppointment) {
      // Find the patient from our API (ideally)
      // For now, we'll just set a minimal patient object
      setSelectedPatient({
        id: editAppointment.patientId,
        firstName: editAppointment.patientName.split(' ')[0] || '',
        lastName: editAppointment.patientName.split(' ')[1] || '',
      });
      
      setDate(editAppointment.date);
      setStartTime(editAppointment.startTime);
      setEndTime(editAppointment.endTime);
      setAppointmentType(editAppointment.type.toLowerCase());
      setNotes(editAppointment.notes || '');
      setIsVirtual(editAppointment.isVirtual);
      
      // Calculate duration
      const startMinutes = timeToMinutes(editAppointment.startTime);
      const endMinutes = timeToMinutes(editAppointment.endTime);
      const diff = endMinutes - startMinutes;
      
      if (diff === 15) setDurationType('15min');
      else if (diff === 30) setDurationType('30min');
      else if (diff === 45) setDurationType('45min');
      else if (diff === 60) setDurationType('1hour');
      else setDurationType('custom');
    } else {
      // Reset form fields when not editing
      resetForm();
    }
  }, [editAppointment]);

  // Update end time when start time or duration changes
  useEffect(() => {
    if (startTime && durationType !== 'custom') {
      setEndTime(calculateEndTime(startTime, durationType));
    }
  }, [startTime, durationType]);

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearch('');
    setShowPatientList(false);
    
    // Clear patient-related errors
    const updatedErrors = {...formErrors};
    delete updatedErrors.patient;
    setFormErrors(updatedErrors);
  };

  // On your appointments form page
// At the top of your component, add a new useEffect for URL parameters
useEffect(() => {
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const patientId = params.get('patientId');
  const patientName = params.get('patientName');
  
  // If parameters exist, use them to set the selected patient
  if (patientId && patientName) {
    const [firstName, ...lastNameParts] = patientName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    // Create a patient object matching your component's expectations
    const patient: Patient = {
      id: parseInt(patientId),
      firstName: firstName,
      lastName: lastName,
      avatar: `${firstName[0]}${lastName[0]}`,
      bgColor: 'bg-blue-100' // You could make this deterministic based on ID if desired
    };
    
    // Set as selected patient
    setSelectedPatient(patient);
  }
}, []);

  // Create a formatted patient list from API data
  const getFormattedPatients = (): Patient[] => {
    if (!patientsData?.data) {
      console.warn('No patient data available, API might have failed');
      return [];
    }
    
    return patientsData.data.map(patient => {
      // Generate initials
      const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
      
      // Generate a consistent background color
      const bgColors = ['bg-blue-100', 'bg-purple-100', 'bg-amber-100', 'bg-green-100', 'bg-emerald-100', 'bg-sky-100'];
      const bgColor = bgColors[patient.id % bgColors.length];
      
      return {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        avatar: initials,
        bgColor: bgColor
      };
    });
  };

  // Create the appointment DateTime string for API
  const createDateTimeString = (): string => {
    if (!date || !startTime) return '';
    
    const [hours, minutes] = startTime.split(':');
    // Format: 2023-06-15T14:30:00
    return `${date}T${hours}:${minutes}:00`;
  };

  // Reset form fields
  const resetForm = () => {
    setSelectedPatient(null);
    setPatientSearch('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setStartTime('');
    setEndTime('');
    setDurationType('30min');
    setAppointmentType('regular');
    setNotes('');
    setSymptoms('');
    setIsVirtual(false);
    setFormErrors({});
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Generate time slots for dropdown selection
  const generateTimeOptions = (): JSX.Element[] => {
    const options: JSX.Element[] = [];
    
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const timeString = `${formattedHour}:${formattedMinute}`;
        
        options.push(
          <option key={timeString} value={timeString}>
            {hour > 12 ? `${hour - 12}:${formattedMinute} PM` : `${hour}:${formattedMinute} AM`}
          </option>
        );
      }
    }
    
    return options;
  };

  // Handle form submission
  // Modified handleSubmit function to work with the correct doctor-department mapping

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate form
  const errors: {[key: string]: string} = {};
  
  if (!selectedPatient) {
    errors.patient = 'Please select a patient';
  }
  
  if (!date) {
    errors.date = 'Please select a date';
  }
  
  if (!startTime) {
    errors.startTime = 'Please select a start time';
  }
  
  if (!endTime) {
    errors.endTime = 'Please select an end time';
  } else if (startTime && endTime && timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    errors.endTime = 'End time must be after start time';
  }
  
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }
  
  try {
    const dateTime = createDateTimeString();
    console.log('Formatted dateTime:', dateTime);
    
    // For virtual appointments, modify the type
    const finalType = isVirtual ? `virtual-${appointmentType}` : appointmentType;
    
    if (!defaultDepartment) {

      const devFallbackDepartment = 3; // Temporarily use department 3 for testing
    console.warn(`⚠️ DEVELOPMENT MODE: Using fallback department ${devFallbackDepartment} for doctor ${doctorId}`);

      console.error(`Cannot create appointment: No department found for doctor ${doctorId}`);
      setFormErrors({
        submit: `Cannot create appointment: Doctor must be assigned to a department. Please contact an administrator.`
      });
      return;
    }
  
    
    // Create the appointment request object
    const appointmentRequest = {
      patientId: Number(selectedPatient!.id),
      doctorId: doctorId,
      departmentId: defaultDepartment!,
      dateTime: new Date(dateTime).toISOString(),
      status: 'scheduled',
      type: finalType,
      notes: notes || '',
      symptoms: symptoms || '',
      diagnosis: null
    };

    console.log('Submitting appointment request:', appointmentRequest);
    
    if (editAppointment) {
      // Update existing appointment
      console.log('Updating appointment ID:', editAppointment.id);
      const result = await updateAppointment({
        id: editAppointment.id,
        appointment: appointmentRequest
      }).unwrap();
      console.log('Update result:', result);
    } else {
      // Create new appointment
      console.log('Creating new appointment');
      const result = await createAppointment(appointmentRequest).unwrap();
      console.log('Create result:', result);
    }
    
    // Notify parent and close
    onAppointmentBooked(appointmentRequest);
    resetForm();
  } catch (err: any) {
    console.error('Error submitting appointment:', err);
    
    // Enhanced error handling
    if (err.data && err.data.error) {
      console.error('API error message:', err.data.error);
      
      // Show specific error message to user
      setFormErrors({
        submit: `Failed to save appointment: ${err.data.error}`
      });
    } else if (err.message) {
      console.error('Error message:', err.message);
      setFormErrors({
        submit: `Error: ${err.message}`
      });
    } else {
      // Show generic error message
      setFormErrors({
        submit: 'Failed to save appointment. Please try again.'
      });
    }
  }
};

  // Get patients for the dropdown
  const filteredPatients = getFormattedPatients();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
            </h2>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={handleClose}
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Patient Selection */}
              <div className="relative">
                <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient <span className="text-red-500">*</span>
                </label>
                {selectedPatient ? (
                  <div className="flex items-center justify-between p-2 border border-gray-300 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${selectedPatient.bgColor || 'bg-blue-100'} flex items-center justify-center mr-3`}>
                        <span className="font-medium text-xs">{selectedPatient.avatar || `${selectedPatient.firstName[0]}${selectedPatient.lastName[0]}`}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{`${selectedPatient.firstName} ${selectedPatient.lastName}`}</div>
                        <div className="text-xs text-gray-500">ID: {selectedPatient.id}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setSelectedPatient(null)}
                      disabled={isCreating || isUpdating}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        id="patient"
                        value={patientSearch}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          setShowPatientList(true);
                        }}
                        onFocus={() => setShowPatientList(true)}
                        className={`w-full p-2 border rounded-lg ${formErrors.patient ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Search patient by name or ID"
                        disabled={isCreating || isUpdating}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Users size={18} className="text-gray-400" />
                      </div>
                    </div>
                    {formErrors.patient && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.patient}</p>
                    )}
                    {showPatientList && patientSearch.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                        {isLoadingPatients ? (
                          <div className="p-3 text-sm text-gray-500">Loading patients...</div>
                        ) : filteredPatients.length > 0 ? (
                          filteredPatients.map(patient => (
                            <div
                              key={patient.id}
                              className="p-2 hover:bg-gray-50 cursor-pointer flex items-center"
                              onClick={() => handlePatientSelect(patient)}
                            >
                              <div className={`w-8 h-8 rounded-full ${patient.bgColor} flex items-center justify-center mr-3`}>
                                <span className="font-medium text-xs">{patient.avatar}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{`${patient.firstName} ${patient.lastName}`}</div>
                                <div className="text-xs text-gray-500">ID: {patient.id}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-sm text-gray-500">No patients found</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Date and Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        const updatedErrors = {...formErrors};
                        delete updatedErrors.date;
                        setFormErrors(updatedErrors);
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full p-2 border rounded-lg ${formErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isCreating || isUpdating}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <CalendarIcon size={18} className="text-gray-400" />
                    </div>
                  </div>
                  {formErrors.date && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
                  )}
                </div>
                
                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <select
                    id="duration"
                    value={durationType}
                    onChange={(e) => setDurationType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    disabled={isCreating || isUpdating}
                  >
                    <option value="15min">15 minutes</option>
                    <option value="30min">30 minutes</option>
                    <option value="45min">45 minutes</option>
                    <option value="1hour">1 hour</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                {/* Start Time */}
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="startTime"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        const updatedErrors = {...formErrors};
                        delete updatedErrors.startTime;
                        setFormErrors(updatedErrors);
                      }}
                      className={`w-full p-2 border rounded-lg ${formErrors.startTime ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isCreating || isUpdating}
                    >
                      <option value="">Select time</option>
                      {generateTimeOptions()}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Clock size={18} className="text-gray-400" />
                    </div>
                  </div>
                  {formErrors.startTime && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>
                  )}
                </div>
                
                {/* End Time */}
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="endTime"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        const updatedErrors = {...formErrors};
                        delete updatedErrors.endTime;
                        setFormErrors(updatedErrors);
                      }}
                      disabled={(durationType !== 'custom' && Boolean(startTime)) || isCreating || isUpdating}
                      className={`w-full p-2 border rounded-lg ${formErrors.endTime ? 'border-red-500' : 'border-gray-300'} ${durationType !== 'custom' && startTime ? 'bg-gray-100' : ''}`}
                    >
                      <option value="">Select time</option>
                      {generateTimeOptions()}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Clock size={18} className="text-gray-400" />
                    </div>
                  </div>
                  {formErrors.endTime && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.endTime}</p>
                  )}
                </div>
              </div>
              
              {/* Appointment Type */}
              <div>
                <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Type
                </label>
                <select
                  id="appointmentType"
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  disabled={isCreating || isUpdating}
                >
                  <option value="regular">Regular Check-up</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="consultation">Consultation</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              
              {/* Appointment Options */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="virtualAppointment"
                    checked={isVirtual}
                    onChange={(e) => setIsVirtual(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isCreating || isUpdating}
                  />
                  <label htmlFor="virtualAppointment" className="ml-2 text-sm text-gray-700 flex items-center">
                    <Video size={16} className="mr-1 text-blue-600" />
                    Virtual Appointment
                  </label>
                </div>
              </div>
              
              {/* Symptoms */}
              <div>
                <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms
                </label>
                <div className="relative">
                  <textarea
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Describe patient symptoms..."
                    disabled={isCreating || isUpdating}
                  ></textarea>
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <div className="relative">
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Add any additional notes here..."
                    disabled={isCreating || isUpdating}
                  ></textarea>
                  <div className="absolute top-2 right-2">
                    <FileText size={18} className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              {/* Error message */}
              {formErrors.submit && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg">
                  {formErrors.submit}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500"
                  onClick={handleClose}
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={isCreating || isUpdating}
                >
                  <CheckCircle size={18} className="mr-2" />
                  {isCreating || isUpdating ? 'Saving...' : editAppointment ? 'Update Appointment' : 'Schedule Appointment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
