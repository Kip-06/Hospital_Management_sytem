// src/components/PatientAppointmentsPage.tsx
import React, { useState } from 'react';
import { Calendar, Clock, Plus, Search } from 'lucide-react';
import AppointmentForm from './appointmentsForm';
import { appointmentApi } from '../../../store/api/appointmentApi';

// Extended appointment type to include doctor information
interface ExtendedAppointment {
  id: number;
  patientId: number;
  doctorId: number;
  departmentId?: number;
  dateTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'regular' | 'follow-up' | 'consultation' | 'emergency';
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields from joins
  doctorFirstName?: string;
  doctorLastName?: string;
  doctorSpecialization?: string;
}

const PatientAppointmentsPage: React.FC = () => {
  // States
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get the current user ID (you might get this from auth context or redux store)
  const currentPatientId = 1; // Replace with actual logic to get the current user's patient ID
  
  // Fetch appointments from backend
  const { data, isLoading, refetch } = appointmentApi.useGetAppointmentsByPatientQuery({
    patientId: currentPatientId,
    limit: 50, // Adjust as needed
  });

  const [updateAppointment] = appointmentApi.useUpdateAppointmentMutation();
  
  const handleRescheduleAppointment = async (id: number, newDateTime: string) => {
    try {
      await updateAppointment({
        id,
        appointment: {
          dateTime: newDateTime
        }
      });
      refetch();
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  // Handle appointment booking
  const handleAppointmentBooked = (_appointmentDetails: any) => {
    // The form submission is now handled directly in the AppointmentForm component
    // We just need to refetch the appointments
    refetch();
  };

  // Filter appointments based on active tab and search term
  const filteredAppointments = data?.data
    ? (data.data as ExtendedAppointment[]).filter(appointment => {
        const matchesSearch = 
          searchTerm === '' || 
          `${appointment.doctorFirstName || ''} ${appointment.doctorLastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (appointment.doctorSpecialization || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const appointmentDate = new Date(appointment.dateTime);
        const currentDate = new Date();
        
        if (activeTab === 'upcoming') {
          return appointmentDate >= currentDate && appointment.status !== 'cancelled' && matchesSearch;
        } else {
          return (appointmentDate < currentDate || appointment.status === 'cancelled') && matchesSearch;
        }
      })
    : [];

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

  // Format time from ISO string
  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      case 'rescheduled':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Rescheduled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={16} className="mr-1" />
          Book New Appointment
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search appointments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming Appointments
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past Appointments
          </button>
        </nav>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        /* Appointment List */
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredAppointments.length === 0 ? (
            <div className="py-10 px-6 text-center">
              <p className="text-gray-500 mb-4">No {activeTab} appointments found.</p>
              {activeTab === 'upcoming' && (
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={16} className="mr-1" />
                  Book New Appointment
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map(appointment => (
                <li key={appointment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {appointment.doctorLastName ? appointment.doctorLastName[0] : 'D'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">
                            Dr. {appointment.doctorFirstName || ''} {appointment.doctorLastName || ''}
                          </h3>
                          <p className="text-sm text-gray-500">{appointment.doctorSpecialization || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {renderStatusBadge(appointment.status)}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          {formatDate(appointment.dateTime)}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          {formatTime(appointment.dateTime)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                          {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                        </span>
                        {appointment.status === 'scheduled' && (
                          <button 
                            className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                            onClick={() => setIsFormOpen(true)} // This would open a reschedule form
                          >
                            Reschedule
                          </button>
                        )}
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Appointment Booking Form */}
      <AppointmentForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        onAppointmentBooked={handleAppointmentBooked}
        patientId={currentPatientId}
      />
    </div>
  );
};

export default PatientAppointmentsPage;