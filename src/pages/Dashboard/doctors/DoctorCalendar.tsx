// src/pages/admin/DoctorCalendarPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  List,
  Grid,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { calendarApi, Appointment, Doctor } from '../../../store/api/calendarApi';
import { toast } from 'react-toastify'; // Assuming you use react-toastify for notifications

const DoctorCalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');

  // Calculate start and end dates for the current week
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start from Monday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Sunday
    
    return {
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0]
    };
  };

  const { startDate, endDate } = getWeekDates();
  
  // Use RTK Query hooks with error handling
  const { 
    data: appointments = [], 
    isLoading: appointmentsLoading, 
    error: appointmentsError,
    refetch: refetchAppointments
  } = calendarApi.useGetAppointmentsQuery({
    startDate,
    endDate,
    doctorId: selectedDoctor !== 'all' ? parseInt(selectedDoctor) : undefined
  });
  
  const { 
    data: doctors = [], 
    isLoading: doctorsLoading, 
    error: doctorsError,
    refetch: refetchDoctors
  } = calendarApi.useGetDoctorsQuery();
  
  // Ensure doctors is always an array to prevent mapping errors
  const doctorsList = Array.isArray(doctors) ? doctors : [];

  // Handle errors on component mount
  useEffect(() => {
    if (appointmentsError) {
      console.error('Error loading appointments:', appointmentsError);
    }
    
    if (doctorsError) {
      console.error('Error loading doctors:', doctorsError);
    }
  }, [appointmentsError, doctorsError]);
  
  // Navigate to previous week
  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  
  // Navigate to next week
  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Format week range for display
  const formatWeekRange = (): string => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start from Monday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Sunday
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };
  
  // Generate days for the week view
  const generateWeekDays = (): Date[] => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start from Monday
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };
  
  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date): Appointment[] => {
    if (!Array.isArray(appointments)) return [];
    
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(appointment => {
      // Extract just the date part from the appointment date
      const appointmentDate = appointment.date.split('T')[0];
      return appointmentDate === dateString;
    });
  };
  
  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Get appointments for the current week
  const getWeekAppointments = (): Appointment[] => {
    return Array.isArray(appointments) ? appointments : [];
  };

  // Handle status update
  const [updateAppointment, { isLoading: isUpdating }] = calendarApi.useUpdateAppointmentMutation();
  
  const handleCompleteAppointment = async (appointmentId: number) => {
    try {
      await updateAppointment({ 
        id: appointmentId, 
        appointmentData: { status: 'Completed' } 
      }).unwrap();
      
      toast.success('Appointment marked as completed');
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };
  
  // Handle retry when data loading fails
  const handleRetry = () => {
    if (appointmentsError) {
      refetchAppointments();
    }
    
    if (doctorsError) {
      refetchDoctors();
    }
  };
  
  const weekDays = generateWeekDays();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/admin" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Calendar</h1>
        </div>
        <Link to="/admin" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Calendar controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <button
              onClick={previousWeek}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Previous week"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold mx-4">{formatWeekRange()}</h2>
            <button
              onClick={nextWeek}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Next week"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={goToToday}
              className="ml-4 px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Today
            </button>
          </div>
          
          <div className="flex items-center">
            <div className="ml-3 flex items-center">
              <button
                className={`p-2 rounded-md hover:bg-gray-100 ${viewType === 'list' ? 'bg-gray-200' : ''}`}
                aria-label="List view"
                onClick={() => setViewType('list')}
              >
                <List size={18} />
              </button>
              <button
                className={`p-2 rounded-md hover:bg-gray-100 ${viewType === 'grid' ? 'bg-gray-200' : ''}`}
                aria-label="Grid view"
                onClick={() => setViewType('grid')}
              >
                <Grid size={18} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter size={14} className="mr-2" />
            Filter
          </button>
          <select
            className="block pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="all">All Doctors</option>
            {doctorsList.map((doctor: Doctor) => (
              <option key={doctor.id} value={doctor.id.toString()}>{doctor.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {(appointmentsLoading || doctorsLoading) && (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <p className="text-gray-500">Loading calendar data...</p>
        </div>
      )}

      {/* Error state */}
      {(appointmentsError || doctorsError) && (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <div className="flex flex-col items-center justify-center">
            <AlertTriangle size={40} className="text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
            <p className="text-gray-500 mb-4">
              There was a problem connecting to the server. Please try again later.
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Calendar Grid View */}
      {!appointmentsLoading && !appointmentsError && !doctorsLoading && !doctorsError && viewType === 'grid' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={index} className="py-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Week grid */}
          <div className="grid grid-cols-7 grid-rows-1 h-[500px]">
            {weekDays.map((day, index) => {
              const dayAppointments = getAppointmentsForDate(day);
              return (
                <div 
                  key={index} 
                  className={`border-r border-b p-1 ${isToday(day) ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center ${
                      isToday(day) ? 'bg-blue-600 text-white' : ''
                    }`}>
                      {day.getDate()}
                    </span>
                  </div>
                  
                  {/* Appointments for this day */}
                  <div className="mt-1 space-y-1 max-h-[430px] overflow-y-auto">
                    {dayAppointments.map(appointment => (
                      <div 
                        key={appointment.id}
                        className="p-1 text-xs bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200"
                        title={`${appointment.time} - ${appointment.patientName} (${appointment.type}) with ${appointment.doctorName}`}
                      >
                        <div className="font-medium">{appointment.time}</div>
                        <div className="truncate">{appointment.patientName}</div>
                        <div className="truncate text-gray-600">{appointment.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar List View */}
      {!appointmentsLoading && !appointmentsError && !doctorsLoading && !doctorsError && viewType === 'list' && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">Appointments for {formatWeekRange()}</h3>
          
          {getWeekAppointments().length > 0 ? (
            <div className="space-y-4">
              {getWeekAppointments().map(appointment => (
                <div 
                  key={appointment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <div className="font-medium text-lg">{appointment.patientName}</div>
                    <div className="text-blue-600 font-medium">{appointment.time}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Date:</span> {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-gray-500">Doctor:</span> {appointment.doctorName}
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span> {appointment.type}
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span> 
                      <span className={`ml-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                        appointment.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 
                        appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    {appointment.notes && (
                      <div className="col-span-2 mt-2">
                        <span className="text-gray-500">Notes:</span> {appointment.notes}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex justify-end space-x-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
                      <Clock size={14} className="mr-1" />
                      Reschedule
                    </button>
                    {appointment.status !== 'Completed' && (
                      <button 
                        onClick={() => handleCompleteAppointment(appointment.id)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                        disabled={isUpdating}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        {isUpdating ? 'Updating...' : 'Complete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No appointments found for this week.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorCalendarPage;