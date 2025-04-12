// src/pages/Dashboard/admin/FullCalendar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Calendar as CalendarIcon,
  List,
  Grid,
  X
} from 'lucide-react';
import { calendarApi, Appointment, Doctor, Department, AppointmentFormData } from '../../../store/api/calendarApi';

// Appointment Form Component
interface AppointmentFormProps {
  selectedDate?: Date;
  onClose: () => void;
  onSave: (appointmentData: AppointmentFormData) => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  selectedDate, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: '',
    doctorId: 0,
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    time: '',
    type: 'Check-up',
    notes: '',
    status: 'Pending'
  });

  // Fetch doctors for dropdown
  const { data: doctors = [] } = calendarApi.useGetDoctorsQuery();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'doctorId' ? parseInt(value) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">New Appointment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Name
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialty})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Check-up">Check-up</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Consultation">Consultation</option>
                <option value="Procedure">Procedure</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Day Appointments Modal Component
interface DayAppointmentsModalProps {
  selectedDay: Date | null;
  appointments: Appointment[];
  onClose: () => void;
  onAddAppointment: (date: Date) => void;
}

const DayAppointmentsModal: React.FC<DayAppointmentsModalProps> = ({ 
  selectedDay, 
  appointments, 
  onClose,
  onAddAppointment
}) => {
  if (!selectedDay) return null;
  
  // Format the date for display
  const formattedDate = selectedDay.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get appointments for the selected day
  const dateString = selectedDay.toISOString().split('T')[0];
  const dayAppointments = appointments.filter(appointment => {
    const appointmentDate = appointment.date.split('T')[0];
    return appointmentDate === dateString;
  });
  
  // Sort appointments by time
  const sortedAppointments = [...dayAppointments].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Appointments for {formattedDate}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {sortedAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No appointments scheduled for this day.</p>
          ) : (
            <div className="space-y-3">
              {sortedAppointments.map(appointment => (
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
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                      Edit
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <button 
            onClick={() => {
              onAddAppointment(selectedDay);
              onClose();
            }} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Calendar Component
const FullCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('all');
  
  // Add state for day appointments modal
  const [showDayAppointmentsModal, setShowDayAppointmentsModal] = useState(false);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Date | null>(null);
  
  // For month view, calculate the year and month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // API expects 1-12 for month
  
  // Fetch data from API
  const { data: monthAppointments = [], isLoading: appointmentsLoading } = 
    calendarApi.useGetMonthAppointmentsQuery({ year, month });
  
  const { data: doctors = [], isLoading: doctorsLoading } = calendarApi.useGetDoctorsQuery();
  const { data: departments = [], isLoading: departmentsLoading } = calendarApi.useGetDepartmentsQuery();
  
  // Mutations for CRUD operations
  const [createAppointment, { isLoading: isCreating }] = calendarApi.useCreateAppointmentMutation();
  
  // Filter appointments based on selected filters
  const filteredAppointments = monthAppointments.filter(appointment => {
    const doctorMatch = selectedDoctorFilter === 'all' || 
      appointment.doctorId.toString() === selectedDoctorFilter;
    
    const departmentMatch = selectedDepartmentFilter === 'all' || 
      (appointment.departmentId && appointment.departmentId.toString() === selectedDepartmentFilter);
    
    return doctorMatch && departmentMatch;
  });
  
  // Check for selected date from navigation
  useEffect(() => {
    if (location.state?.selectedDate) {
      setSelectedDate(new Date(location.state.selectedDate));
      setShowForm(true);
    }
  }, [location.state]);
  
  // Generate month days
  const getDaysInMonth = (year: number, month: number): Date[] => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    
    // Get start of the grid (might include days from previous month)
    const firstDay = new Date(date);
    const dayOfWeek = firstDay.getDay();
    const startPadding = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
    
    firstDay.setDate(firstDay.getDate() - startPadding);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(firstDay));
      firstDay.setDate(firstDay.getDate() + 1);
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  // Helper to check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Helper to check if date is in current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };
  
  // Helper to get appointments for a specific date
  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateString = date.toISOString().split('T')[0];
    return filteredAppointments.filter(appointment => {
      const appointmentDate = appointment.date.split('T')[0];
      return appointmentDate === dateString;
    });
  };
  
  // Month navigation
  const previousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  // Format month and year
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Handle opening the appointment form
  const handleNewAppointment = () => {
    setSelectedDate(undefined);
    setShowForm(true);
  };

  // Handle adding appointment on a specific day
  const handleAddAppointmentOnDate = (day: Date) => {
    setSelectedDate(day);
    setShowForm(true);
  };

  // Handle viewing day appointments
  const handleViewDayAppointments = (day: Date) => {
    setSelectedDayAppointments(day);
    setShowDayAppointmentsModal(true);
  };

  // Handle saving a new appointment
  const handleSaveAppointment = async (appointmentData: AppointmentFormData) => {
    try {
      await createAppointment(appointmentData).unwrap();
      setShowForm(false);
      
      // Show feedback
      alert('Appointment saved successfully!');
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('Failed to save appointment. Please try again.');
    }
  };

  // Navigate to appointment details
  const handleViewAppointment = (appointmentId: number) => {
    navigate(`/admin/appointments/${appointmentId}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/admin" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Full Calendar</h1>
        </div>
        <Link to="/" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Back to Homepage
        </Link>
      </div>

      {/* Calendar controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <button
              onClick={previousMonth}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold mx-4">{formatMonthYear(currentDate)}</h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="ml-4 px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Today
            </button>
          </div>
          
          <div className="flex items-center">
            <div className="bg-gray-100 rounded-md p-1 flex items-center">
              <button
                className={`px-3 py-1 rounded-md text-sm ${currentView === 'month' ? 'bg-white shadow' : ''}`}
                onClick={() => setCurrentView('month')}
              >
                Month
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${currentView === 'week' ? 'bg-white shadow' : ''}`}
                onClick={() => setCurrentView('week')}
              >
                Week
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm ${currentView === 'day' ? 'bg-white shadow' : ''}`}
                onClick={() => setCurrentView('day')}
              >
                Day
              </button>
            </div>
            
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
            
            <div className="ml-3">
              <button 
                onClick={handleNewAppointment}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} className="mr-2" />
                New Appointment
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
            value={selectedDepartmentFilter}
            onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(department => (
              <option key={department.id} value={department.id.toString()}>{department.name}</option>
            ))}
          </select>
          <select
            className="block pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            value={selectedDoctorFilter}
            onChange={(e) => setSelectedDoctorFilter(e.target.value)}
          >
            <option value="all">All Doctors</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id.toString()}>{doctor.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {(appointmentsLoading || doctorsLoading || departmentsLoading) && (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <p className="text-gray-500">Loading calendar data...</p>
        </div>
      )}

      {/* Calendar */}
      {!appointmentsLoading && !doctorsLoading && !departmentsLoading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={index} className="py-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 grid-rows-6 h-[700px]">
            {days.map((day, index) => {
              const dayAppointments = getAppointmentsForDate(day);
              return (
                <div 
                  key={index} 
                  className={`border-r border-b p-1 ${
                    isToday(day) ? 'bg-blue-50' : 
                    !isCurrentMonth(day) ? 'bg-gray-50 text-gray-400' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center ${
                      isToday(day) ? 'bg-blue-600 text-white' : ''
                    }`}>
                      {day.getDate()}
                    </span>
                    {isCurrentMonth(day) && (
                      <button 
                        className="text-gray-400 hover:text-gray-600 p-1" 
                        title="Add appointment"
                        onClick={() => handleAddAppointmentOnDate(day)}
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                  
                  {/* Appointments for this day */}
                  <div className="mt-1 space-y-1 max-h-[100px] overflow-y-auto">
                    {dayAppointments.map(appointment => (
                      <div 
                        key={appointment.id}
                        className="p-1 text-xs bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200"
                        title={`${appointment.time} - ${appointment.patientName} (${appointment.type}) with ${appointment.doctorName}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDayAppointments(day);
                        }}
                      >
                        <div className="font-medium">{appointment.time}</div>
                        <div className="truncate">{appointment.patientName}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* If there are appointments, add a "View All" link */}
                  {dayAppointments.length > 0 && (
                    <div className="mt-1 text-xs text-center">
                      <button 
                        className="text-blue-600 hover:underline"
                        onClick={() => handleViewDayAppointments(day)}
                      >
                        View all ({dayAppointments.length})
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Appointment Form Modal */}
      {showForm && (
        <AppointmentForm
          selectedDate={selectedDate}
          onClose={() => setShowForm(false)}
          onSave={handleSaveAppointment}
        />
      )}
      
      {/* Day Appointments Modal */}
      {showDayAppointmentsModal && selectedDayAppointments && (
        <DayAppointmentsModal
          selectedDay={selectedDayAppointments}
          appointments={filteredAppointments}
          onClose={() => setShowDayAppointmentsModal(false)}
          onAddAppointment={handleAddAppointmentOnDate}
        />
      )}
    </div>
  );
};

export default FullCalendarPage;