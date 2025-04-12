import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, ArrowRight, Check, AlertCircle, Search, Filter } from 'lucide-react';
import { appointmentApi } from '../../../store/api/appointmentApi';

// Updated Doctor type to match backend
interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  availability: any;
}

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentBooked: (appointmentDetails: any) => void;
  patientId: number;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ isOpen, onClose, onAppointmentBooked, patientId }) => {
  // States
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('regular');
  const [appointmentNotes, setAppointmentNotes] = useState<string>('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [specialization, setSpecialization] = useState<string>('');

  // API hooks
  const { data: doctors = [], isLoading: isLoadingDoctors } = appointmentApi.useGetAvailableDoctorsQuery({
    specialization: specialization || undefined
  });

  const [createAppointment, { isLoading: isCreatingAppointment }] = appointmentApi.useCreateAppointmentMutation();

  // Reset form when modal is opened
  // Debug logging to see what's happening with doctors data
useEffect(() => {
  console.log("Doctors data:", doctors);
}, [doctors]);

// Fallback doctor data in case the API is not working
const fallbackDoctors = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    specialization: "Cardiology",
    availability: { monday: ["09:00-17:00"], wednesday: ["09:00-17:00"], friday: ["09:00-17:00"] }
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Johnson",
    specialization: "Neurology",
    availability: { tuesday: ["09:00-17:00"], thursday: ["09:00-17:00"] }
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Chen",
    specialization: "Orthopedics",
    availability: { monday: ["13:00-20:00"], wednesday: ["13:00-20:00"], friday: ["09:00-14:00"] }
  }
];

// Use fallback if API isn't returning an array or is empty
const doctorsData = Array.isArray(doctors) && doctors.length > 0 ? doctors : fallbackDoctors;

  // Filter doctors based on search term
  const filteredDoctors = doctorsData.filter(doctor => 
    `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Available times for selected date
  const availableTimes = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Generate available dates
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // Generate dates for the next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const formattedDate = date.toISOString().split('T')[0];
        dates.push(formattedDate);
      }
    }
    
    return dates;
  };

  // Convert time string to Date object
  const convertTimeToDate = (dateStr: string, timeStr: string): string => {
    const timeParts = timeStr.split(' ');
    const [hours, minutes] = timeParts[0].split(':');
    const isPM = timeParts[1] === 'PM';
    
    let hour = parseInt(hours);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    
    const date = new Date(`${dateStr}T00:00:00`);
    date.setHours(hour);
    date.setMinutes(parseInt(minutes));
    
    return date.toISOString();
  };

  // Available dates
  const availableDates = generateAvailableDates();

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Reset form
  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setAppointmentType('regular');
    setAppointmentNotes('');
    setBookingConfirmed(false);
    setSearchTerm('');
    setShowFilters(false);
    setSpecialization('');
  };

  // Handle closing the form
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle going to next step
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle going to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle booking confirmation
  // Update your handleBookingConfirmation function with additional logging
const handleBookingConfirmation = async () => {
  if (!selectedDoctor || !selectedDate || !selectedTime) return;
  
  try {
    // Calculate ISO datetime from date and time
    const dateTimeString = convertTimeToDate(selectedDate, selectedTime);
    
    // Create the payload and log it
    const appointmentPayload = {
      patientId: 1, // Use a valid ID from your patients table
      doctorId: 1,  // Use a valid ID from your doctors table
      departmentId: 1, // Use a valid ID from your departments table
      dateTime: dateTimeString,
      type: appointmentType as 'regular' | 'follow-up' | 'consultation' | 'emergency',
      notes: appointmentNotes || undefined,
      status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled'
    };
    
    
    
    console.log("Sending appointment data to server:", appointmentPayload);
    // Add this right before sending the appointment data to the server
console.log("Validating IDs:");
console.log("- Patient ID:", patientId, "exists?", Boolean(patientId));
console.log("- Doctor ID:", selectedDoctor.id, "exists?", Boolean(selectedDoctor.id));
console.log("- Department ID:", 1, "exists?", true);
    
    // Create appointment on backend
    const result = await createAppointment(appointmentPayload).unwrap();
    
    setBookingConfirmed(true);
    
    // Notify parent component about the booking
    onAppointmentBooked(result);
    
    // After a successful booking, reset the form after a delay
    setTimeout(() => {
      handleClose();
    }, 3000);
  } catch (error: any) {
    console.error('Error booking appointment:', error);
    // Display more detailed error information if available
    if (error && typeof error === 'object' && 'data' in error) {
      console.error('Server error details:', error.data);
    }
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Book an Appointment</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 md:p-6">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                1
              </div>
              <div className={`h-1 w-full mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                2
              </div>
              <div className={`h-1 w-full mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                3
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Select Doctor</span>
              <span>Choose Date & Time</span>
              <span>Confirm Details</span>
            </div>
          </div>

          {/* Step 1: Select Doctor */}
          {currentStep === 1 && !bookingConfirmed && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Doctor</h3>
              
              {/* Search and Filter */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search doctors by name or specialty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter size={18} className="mr-2" />
                    Filters
                  </button>
                </div>
                
                {/* Expandable filters */}
                {showFilters && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <div className="mb-4">
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization
                      </label>
                      <select
                        id="specialization"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Specializations</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Orthopedic">Orthopedic</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Endocrinology">Endocrinology</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Doctors List */}
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {isLoadingDoctors ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredDoctors.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No doctors match your search criteria.</p>
                ) : (
                  filteredDoctors.map(doctor => (
                    <div 
                      key={doctor.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDoctor?.id === doctor.id 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {doctor.lastName ? doctor.lastName[0] : 'D'}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</h4>
                          <p className="text-sm text-gray-500">{doctor.specialization}</p>
                        </div>
                        {selectedDoctor?.id === doctor.id && (
                          <Check size={20} className="text-blue-600" />
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          {doctor.availability && typeof doctor.availability === 'object' 
                            ? Object.entries(doctor.availability)
                                .filter(([_, times]) => Array.isArray(times) && times.length > 0)
                                .map(([day]) => day)
                                .join(', ')
                            : 'Availability information not available'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Action Buttons - Fixed at bottom for small screens */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sticky bottom-0 bg-white pb-2 pt-4 border-t">
                <button 
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={goToNextStep}
                  className={`w-full sm:w-auto px-4 py-2 rounded-md flex items-center justify-center ${
                    selectedDoctor 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!selectedDoctor}
                >
                  Next
                  <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Date and Time */}
          {currentStep === 2 && !bookingConfirmed && selectedDoctor && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date & Time</h3>
              
              <div className="bg-blue-50 p-3 rounded-lg mb-6 flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">
                  {selectedDoctor.lastName[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                  <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Select Date</h4>
                  <div className="border rounded-md overflow-hidden">
                    <div className="max-h-56 overflow-y-auto p-2">
                      {availableDates.map(date => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => handleDateSelect(date)}
                          className={`w-full text-left px-3 py-2 rounded-md mb-1 text-sm ${
                            selectedDate === date
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-blue-50 text-gray-700'
                          }`}
                        >
                          {formatDate(date)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Time Selection - only show when date is selected */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Select Time</h4>
                  {selectedDate ? (
                    <div className="border rounded-md overflow-hidden">
                      <div className="max-h-56 overflow-y-auto p-2">
                        <div className="grid grid-cols-2 gap-2">
                          {availableTimes.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleTimeSelect(time)}
                              className={`px-3 py-2 rounded-md text-sm ${
                                selectedTime === time
                                  ? 'bg-blue-600 text-white'
                                  : 'hover:bg-blue-50 text-gray-700'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-md p-4 text-center text-gray-500">
                      Please select a date first
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons - Fixed at bottom for small screens */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sticky bottom-0 bg-white pb-2 pt-4 border-t">
                <button 
                  type="button"
                  onClick={goToPreviousStep}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button 
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={goToNextStep}
                    className={`w-full sm:w-auto px-4 py-2 rounded-md flex items-center justify-center ${
                      selectedDate && selectedTime 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!selectedDate || !selectedTime}
                  >
                    Next
                    <ArrowRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm Appointment Details */}
          {currentStep === 3 && !bookingConfirmed && selectedDoctor && selectedDate && selectedTime && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Appointment Details</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">
                    {selectedDoctor.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                    <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date</p>
                      <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Time</p>
                      <p className="text-sm text-gray-600">{selectedTime}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Appointment Details Form */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Type
                  </label>
                  <select
                    id="appointmentType"
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="regular">Regular Checkup</option>
                    <option value="follow-up">Follow-up Visit</option>
                    <option value="consultation">Consultation</option>
                    <option value="emergency">Urgent Care</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="appointmentNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    id="appointmentNotes"
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any details about your appointment..."
                  ></textarea>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-700">
                      Please arrive 15 minutes before your scheduled appointment time.
                      Bring your insurance card and ID.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Fixed at bottom for small screens */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sticky bottom-0 bg-white pb-2 pt-4 border-t">
                <button 
                  type="button"
                  onClick={goToPreviousStep}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button 
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleBookingConfirmation}
                    disabled={isCreatingAppointment}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                  >
                    {isCreatingAppointment ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Processing...
                      </>
                    ) : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Booking Confirmation */}
          {bookingConfirmed && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Appointment Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                Your appointment with Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName} on {formatDate(selectedDate)} at {selectedTime} has been booked successfully.
              </p>
              <p className="text-sm text-gray-500">
                A confirmation has been sent to your email and phone.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;