// src/pages/doctor/AppointmentsPage.tsx
import React, { useState, useEffect } from 'react';
import { useGetCurrentUserQuery } from '../../../store/api/authApi';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Video,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import AppointmentForm from './AppointmentsForm';
import { appointmentApi, Appointment as ApiAppointment } from '../../../store/api/appointmentApi';
import { format, parseISO, isSameDay } from 'date-fns';

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

type ViewType = 'day' | 'week' | 'month' | 'list';
type FilterStatus = 'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

interface TimeSlot {
  time: string;
  appointments: AppointmentUI[];
  isCurrentTime?: boolean;
}



const AppointmentsPage: React.FC = () => {
  const { 
    data: currentUser,
    isLoading: isLoadingUser,
    isError: isUserError  
  } = useGetCurrentUserQuery();

    // TEMPORARY: Workaround for development while auth is fixed
// Make sure to remove this before production!
const DEV_MODE = true;
const fallbackDoctorId = 3;  // Use a doctor ID that exists in your database
const doctorId = DEV_MODE ? (currentUser as any)?.doctorId || fallbackDoctorId : (currentUser as any)?.doctorId;


  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('day');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentUI | null>(null);
  const [currentPage] = useState<number>(1);
  
  
  // Using RTK Query hooks
  const { 
    data: appointmentsData, 
    isLoading, 
    isError: isAppointmentsError,
    refetch
  } = appointmentApi.useGetAppointmentsByDoctorQuery({
    doctorId,
    page: currentPage,
    limit: 50,
    status: statusFilter === 'all' ? undefined : statusFilter
  }, {
    skip: !doctorId // Skip if doctorId is undefined
  });

  const [updateAppointment, { isLoading: isUpdating }] = appointmentApi.useUpdateAppointmentMutation();
  const [deleteAppointment, { isLoading: isDeleting }] = appointmentApi.useDeleteAppointmentMutation();
  
  // Transform API appointments to UI format
  const transformAppointmentsToUI = (apiAppointments: ApiAppointment[] | undefined): AppointmentUI[] => {
    if (!apiAppointments || !Array.isArray(apiAppointments)) {
      console.error('No appointments data or invalid format:', apiAppointments);
      return [];
    }
    
    return apiAppointments.map(apt => {
      try {
        // Safely parse the dateTime string
        let dateObj;
        try {
          dateObj = parseISO(apt.dateTime);
          // Check if date is valid
          if (isNaN(dateObj.getTime())) {
            console.warn('Invalid date for appointment:', apt);
            dateObj = new Date(); // Fallback to current date
          }
        } catch (e) {
          console.error('Error parsing date:', apt.dateTime, e);
          dateObj = new Date(); // Fallback to current date
        }
        
        // Extract date and time components
        const date = format(dateObj, 'yyyy-MM-dd');
        const startTime = format(dateObj, 'HH:mm');
        
        // Calculate end time (assuming 30 min appointments by default)
        const endDateObj = new Date(dateObj.getTime() + 30 * 60000);
        const endTime = format(endDateObj, 'HH:mm');
        
        // Generate avatar and handle missing patient ID
        const patientId = apt.patientId || 0;
        const avatar = `P${patientId.toString().substring(0, 2)}`;
        
        // Get background color
        const bgColors = ['bg-blue-100', 'bg-purple-100', 'bg-amber-100', 'bg-green-100', 'bg-emerald-100', 'bg-sky-100'];
        const bgColor = bgColors[patientId % bgColors.length];
  
        // Ensure type and status exist
        const type = apt.type ? (apt.type.charAt(0).toUpperCase() + apt.type.slice(1)) : 'Regular';
        const status = apt.status ? (apt.status.charAt(0).toUpperCase() + apt.status.slice(1)) : 'Scheduled';
  
        return {
          id: apt.id || 0,
          patientId: patientId,
          patientName: `Patient #${patientId}`,
          avatar,
          bgColor,
          date,
          startTime,
          endTime,
          type,
          status,
          notes: apt.notes || '',
          isVirtual: (apt.type || '').includes('virtual') || false,
          isNewPatient: false,
          doctorId: apt.doctorId || 1
        };
      } catch (error) {
        console.error('Error transforming appointment:', apt, error);
        // Return a default appointment object if transformation fails
        return {
          id: apt.id || 0,
          patientId: 0,
          patientName: 'Unknown Patient',
          avatar: 'P0',
          bgColor: 'bg-gray-100',
          date: format(new Date(), 'yyyy-MM-dd'),
          startTime: '00:00',
          endTime: '00:30',
          type: 'Unknown',
          status: 'Scheduled',
          notes: '',
          isVirtual: false,
          isNewPatient: false,
          doctorId: 1
        };
      }
    });
  };

  useEffect(() => {
    if (appointmentsData) {
      console.log('Appointments data received:', appointmentsData);
    }
  }, [appointmentsData]);

  // Filter appointments for the current date view
  const getCurrentDateAppointments = (): AppointmentUI[] => {
    if (!appointmentsData?.data) return [];
    
    const uiAppointments = transformAppointmentsToUI(appointmentsData.data);
    
    return uiAppointments.filter(apt => {
      // Filter by date
      const appointmentDate = new Date(apt.date);
      const isSameDate = isSameDay(appointmentDate, currentDate);
      
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientId.toString().includes(searchTerm.toLowerCase());
      
      return isSameDate && matchesSearch;
    });
  };

  const filteredAppointments = getCurrentDateAppointments();

  // Handle new appointment booking (will be updated with the form)
  const handleAppointmentBooked = async (): Promise<void> => {
    setIsFormOpen(false);
    // Refetch to get the updated list
    refetch();
  };

  // Generate time slots from 8:00 AM to 6:00 PM
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Find appointments that start at this time
        const appointmentsAtTime = filteredAppointments.filter(apt => apt.startTime === timeString);
        
        // Check if this is the current time (roughly)
        const isCurrentTime = currentHour === hour && 
                             (currentMinute >= minute && currentMinute < minute + 30);
        
        slots.push({
          time: timeString,
          appointments: appointmentsAtTime,
          isCurrentTime
        });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Navigate to previous/next day
  const navigateDay = (direction: 'prev' | 'next'): void => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: FilterStatus): void => {
    setStatusFilter(status);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  // Handle appointment status change
  const handleStatusChange = async (appointmentId: number, newStatus: string): Promise<void> => {
    try {
      await updateAppointment({
        id: appointmentId,
        appointment: {
          status: newStatus.toLowerCase() as any
        }
      }).unwrap();
      
      // Refetch to get the updated list
      refetch();
    } catch (err) {
      console.error('Failed to update appointment status:', err);
    }
  };

  // Handle appointment deletion
  const handleDeleteAppointment = async (appointmentId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment(appointmentId).unwrap();
        // Refetch to get the updated list
        refetch();
      } catch (err) {
        console.error('Failed to delete appointment:', err);
      }
    }
  };

  // Handle appointment click in day view
  const handleAppointmentClick = (appointment: AppointmentUI): void => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };

  // Get status badge style based on status
  const getStatusBadgeStyle = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Show loading state for user data */}
    {isLoadingUser && (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">Loading user data...</p>
      </div>
    )}

    {/* Show error if user data fetch failed */}
    {!isLoadingUser && isUserError && (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-red-500">Error loading user data. Please try again later.</p>
      </div>
    )}

    {/* Show message if not logged in as a doctor */}
    {!isLoadingUser && !isUserError && !doctorId && (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-yellow-600">You need to be logged in as a doctor to view appointments.</p>
      </div>
    )}

    {/* Only show the appointments UI if we have a doctorId */}
    {doctorId && (
      <>
      {/* Header section with date navigation and view options */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-500 mt-1">Manage your patient appointments</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
              onClick={() => {
                setSelectedAppointment(null);
                setIsFormOpen(true);
              }}
            >
              <Plus size={18} className="mr-2" />
              New Appointment
            </button>
          </div>
        </div>
      
      {/* Controls section: search, filter, and view toggle */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by patient name or ID..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Filter by status */}
          <div className="flex items-center">
            <div className="relative inline-block mr-2">
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button 
                  className={`px-3 py-2 ${statusFilter === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                  onClick={() => handleStatusFilterChange('all')}
                >
                  All
                </button>
                <button 
                  className={`px-3 py-2 ${statusFilter === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                  onClick={() => handleStatusFilterChange('scheduled')}
                >
                  Scheduled
                </button>
                <button 
                  className={`px-3 py-2 ${statusFilter === 'confirmed' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                  onClick={() => handleStatusFilterChange('confirmed')}
                >
                  Confirmed
                </button>
                <button 
                  className={`px-3 py-2 ${statusFilter === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                  onClick={() => handleStatusFilterChange('completed')}
                >
                  Completed
                </button>
              </div>
            </div>
            
            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button 
                className={`px-3 py-2 ${currentView === 'day' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => setCurrentView('day')}
                title="Day view"
              >
                Day
              </button>
              <button 
                className={`px-3 py-2 ${currentView === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => setCurrentView('list')}
                title="List view"
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">Loading appointments...</p>
        </div>
      )}
      {/* Show appointment error state */}
      {!isLoading && isAppointmentsError && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-red-500">Error loading appointments. Please try again.</p>
            <button 
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        )}
      
      {/* Calendar header with date navigation */}
      {!isLoading && !isAppointmentsError &&(
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <button 
              onClick={() => navigateDay('prev')}
              className="p-1 rounded-full hover:bg-gray-100"
              title="Previous day"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center">
              <CalendarIcon size={20} className="text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">{formatDate(currentDate)}</h2>
            </div>
            
            <button 
              onClick={() => navigateDay('next')}
              className="p-1 rounded-full hover:bg-gray-100"
              title="Next day"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Day view calendar */}
          {currentView === 'day' && (
            <div className="divide-y">
              {timeSlots.map((slot, index) => (
                <div key={index} className={`flex ${slot.isCurrentTime ? 'bg-blue-50' : ''}`}>
                  {/* Time column */}
                  <div className="w-20 py-3 px-4 flex items-start">
                    <span className="text-sm font-medium text-gray-500">
                      {slot.time}
                    </span>
                  </div>
                  
                  {/* Appointments column */}
                  <div className="flex-1 py-2 px-3 min-h-[60px] border-l">
                    {slot.appointments.map((appointment) => (
                      <div 
                        key={appointment.id}
                        className="mb-2 p-2 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow transition-all cursor-pointer"
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full ${appointment.bgColor} flex items-center justify-center mr-3`}>
                              <span className="font-medium text-xs">{appointment.avatar}</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{appointment.patientName}</h4>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <span>{appointment.startTime} - {appointment.endTime}</span>
                                <span className="mx-1">•</span>
                                <span>{appointment.type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {appointment.isVirtual && (
                              <span 
                                className="mr-2 p-1 rounded-full bg-blue-50 text-blue-600"
                                title="Virtual appointment"
                              >
                                <Video size={14} />
                              </span>
                            )}
                            {appointment.isNewPatient && (
                              <span 
                                className="mr-2 p-1 rounded-full bg-green-50 text-green-600"
                                title="New patient"
                              >
                                <UserPlus size={14} />
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* List view */}
          {currentView === 'list' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No appointments found for this date
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.startTime} - {appointment.endTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full ${appointment.bgColor} flex items-center justify-center mr-3`}>
                              <span className="font-medium text-xs">{appointment.avatar}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                              <div className="text-xs text-gray-500">ID: {appointment.patientId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">{appointment.type}</span>
                            {appointment.isVirtual && (
                              <span className="ml-2 p-1 rounded-full bg-blue-50 text-blue-600" title="Virtual">
                                <Video size={14} />
                              </span>
                            )}
                            {appointment.isNewPatient && (
                              <span className="ml-1 p-1 rounded-full bg-green-50 text-green-600" title="New patient">
                                <UserPlus size={14} />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {appointment.notes || 'No notes'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {(appointment.status.toLowerCase() === 'scheduled' || appointment.status.toLowerCase() === 'confirmed') && (
                              <>
                                <button 
                                  className="p-1 text-green-600 hover:text-green-900" 
                                  title="Complete"
                                  onClick={() => handleStatusChange(appointment.id, 'completed')}
                                  disabled={isUpdating}
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button 
                                  className="p-1 text-red-600 hover:text-red-900" 
                                  title="Cancel"
                                  onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                  disabled={isUpdating}
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                            <button 
                              className="p-1 text-blue-600 hover:text-blue-900" 
                              title="Edit"
                              onClick={() => handleAppointmentClick(appointment)}
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="p-1 text-red-500 hover:text-red-700" 
                              title="Delete"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Appointment Form Component */}
      <AppointmentForm 
          isOpen={isFormOpen} 
          onClose={() => {
            setIsFormOpen(false);
            setSelectedAppointment(null);
          }}
          onAppointmentBooked={handleAppointmentBooked}
          appointmentApi={appointmentApi}
          doctorId={doctorId}
          editAppointment={selectedAppointment}
        />
      </>
    )}
    </div>
  );
};

export default AppointmentsPage;