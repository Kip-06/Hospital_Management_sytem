// src/pages/admin/AppointmentsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Clock, 
  User, 
  Stethoscope,
  PlusCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { appointmentApi } from '../../../store/api/appointmentApi';
import { doctorApi } from '../../../store/api/doctorsApi';

// Define appointment interface based on your API
interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'regular' | 'follow-up' | 'emergency';
  notes?: string;
}

interface FormError {
  patientName?: string;
  patientId?: string;
  doctorName?: string;
  department?: string;
  date?: string;
  time?: string;
  [key: string]: string | undefined;
}

const AdminAppointmentsPage: React.FC = () => {
  // API hooks
  const { 
    data: fetchedAppointments, 
    isLoading: isFetchingAppointments, 
    isError: isAppointmentsError,
    refetch: refetchAppointments 
  } = appointmentApi.useGetAllAppointmentsQuery({ page: 1, limit: 100 });
  
  const [createAppointment, { isLoading: isCreating }] = appointmentApi.useCreateAppointmentMutation();
  const [updateAppointment, { isLoading: isUpdating }] = appointmentApi.useUpdateAppointmentMutation();
  const [deleteAppointment, { isLoading: isDeleting }] = appointmentApi.useDeleteAppointmentMutation();
  
  const { data: availableDoctors } = doctorApi.useGetAllDoctorsQuery({ page: 1, limit: 100 });

  // State for appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Transform API data to local format
  useEffect(() => {
    if (fetchedAppointments && fetchedAppointments.data) {
      const transformedAppointments = fetchedAppointments.data.map(appointment => {
        // Find the doctor name from available doctors
        const doctor = availableDoctors?.data?.find(d => d.doctor.id === appointment.doctorId);
        const doctorName = doctor ? `Dr. ${doctor.doctor.firstName} ${doctor.doctor.lastName}` : 'Unknown Doctor';
        
        // Format date and time
        const dateObj = new Date(appointment.dateTime);
        const formattedDate = dateObj.toISOString().split('T')[0];
        const formattedTime = dateObj.toLocaleTimeString([], { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        
        return {
          id: appointment.id.toString(),
          patientId: appointment.patientId.toString(),
          patientName: `Patient #${appointment.patientId}`, // You'd normally get this from a patient API
          doctorName,
          department: doctor?.doctor.department || 'Unknown',
          date: formattedDate,
          time: formattedTime,
          status: appointment.status,
          type: appointment.type,
          notes: appointment.notes || ''
        } as Appointment;
      });
      
      setAppointments(transformedAppointments);
    }
  }, [fetchedAppointments, availableDoctors]);

  // State for search, filtering, and modals
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formErrors, setFormErrors] = useState<FormError>({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);
  
  // Empty appointment template
  const emptyAppointment: Appointment = {
    id: '',
    patientName: '',
    patientId: '',
    doctorName: '',
    department: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    status: 'scheduled',
    type: 'regular',
    notes: ''
  };

  // Filter appointments based on search term and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;
    const matchesDate = !selectedDate || appointment.date === selectedDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Form validation
  const validateForm = (appointment: Appointment): FormError => {
    const errors: FormError = {};
    
    if (!appointment.patientName.trim()) {
      errors.patientName = 'Patient name is required';
    }
    
    if (!appointment.patientId.trim()) {
      errors.patientId = 'Patient ID is required';
    }
    
    if (!appointment.doctorName.trim()) {
      errors.doctorName = 'Doctor name is required';
    }
    
    if (!appointment.date) {
      errors.date = 'Date is required';
    }
    
    if (!appointment.time) {
      errors.time = 'Time is required';
    }
    
    return errors;
  };

  // Handle add/edit appointment
  const handleAddOrUpdateAppointment = async () => {
    if (!editingAppointment) return;
    
    // Validate form
    const errors = validateForm(editingAppointment);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Extract doctor ID from doctorName
      const doctor = availableDoctors?.data?.find(d => 
        `Dr. ${d.doctor.firstName} ${d.doctor.lastName}` === editingAppointment.doctorName
      );
      const doctorId = doctor?.doctor.id;
      
      if (!doctorId) {
        setFormErrors({
          doctorName: 'Please select a valid doctor'
        });
        return;
      }
      
      // Combine date and time
      const dateTime = new Date(`${editingAppointment.date}T${convertTo24Hour(editingAppointment.time)}`);
      
      if (editingAppointment.id) {
        // Update existing appointment
          await updateAppointment({
            id: parseInt(editingAppointment.id),
            appointment: {
              patientId: parseInt(editingAppointment.patientId),
              doctorId,
              dateTime: dateTime.toISOString(),
              status: editingAppointment.status === 'no-show' ? 'cancelled' : editingAppointment.status,
              type: editingAppointment.type,
              notes: editingAppointment.notes
            }
        }).unwrap();
      } else {
        // Add new appointment
        await createAppointment({
          patientId: parseInt(editingAppointment.patientId),
          doctorId,
          dateTime: dateTime.toISOString(),
          status: editingAppointment.status === 'no-show' ? 'cancelled' : editingAppointment.status,
          type: editingAppointment.type,
          notes: editingAppointment.notes
        }).unwrap();
      }
      
      // Refresh appointments data
      refetchAppointments();
      
      // Reset states
      setIsModalOpen(false);
      setEditingAppointment(null);
      setFormErrors({});
      
    } catch (error) {
      console.error('Failed to save appointment:', error);
      
      // Set general error
      setFormErrors({
        ...formErrors,
        general: 'Failed to save appointment. Please try again.'
      });
    }
  };

  // Helper to convert time from 12-hour to 24-hour format
  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    
    return `${hours.padStart(2, '0')}:${minutes}:00`;
  };

  // Handle deleting an appointment
  const handleDeleteAppointment = (id: string) => {
    setIsConfirmingDelete(id);
  };
  
  // Confirm delete appointment
  const confirmDeleteAppointment = async () => {
    if (!isConfirmingDelete) return;
    
    try {
      await deleteAppointment(parseInt(isConfirmingDelete)).unwrap();
      // Refresh data
      refetchAppointments();
      setIsConfirmingDelete(null);
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      alert('Failed to delete appointment. Please try again.');
    }
  };

  // Status badges color mapping
  const statusColors: Record<string, { bg: string; text: string }> = {
    'scheduled': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'completed': { bg: 'bg-green-100', text: 'text-green-800' },
    'cancelled': { bg: 'bg-red-100', text: 'text-red-800' },
    'no-show': { bg: 'bg-gray-100', text: 'text-gray-800' }
  };

  // Type badges color mapping
  const typeColors: Record<string, { bg: string; text: string }> = {
    'regular': { bg: 'bg-gray-100', text: 'text-gray-800' },
    'follow-up': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'emergency': { bg: 'bg-red-100', text: 'text-red-800' }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Calendar className="mr-2" size={24} />
            Appointments Management
          </h2>
          <div className="flex items-center space-x-3">
            {isFetchingAppointments && (
              <div className="flex items-center text-blue-600">
                <Loader size={18} className="animate-spin mr-2" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
            <button
              onClick={() => refetchAppointments()}
              className="bg-gray-100 text-gray-600 p-2 rounded-md hover:bg-gray-200"
              title="Refresh appointments"
            >
              <Clock size={18} />
            </button>
            <button
              onClick={() => {
                setEditingAppointment(emptyAppointment);
                setFormErrors({});
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
              disabled={isFetchingAppointments}
            >
              <PlusCircle size={18} className="mr-2" />
              New Appointment
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="relative md:w-64">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex flex-wrap items-center space-x-2 space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <Filter size={18} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-500 mr-2">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {(searchTerm || selectedStatus !== 'all' || selectedDate) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedDate('');
                }}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <X size={16} className="mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* API error state */}
        {isAppointmentsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading appointments</p>
              <p className="text-sm">There was a problem fetching appointments. Please try refreshing the page.</p>
            </div>
          </div>
        )}

        {/* Appointments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isFetchingAppointments ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center">
                      <Loader size={30} className="text-blue-500 animate-spin mb-3" />
                      <p className="text-gray-500">Loading appointments...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <User size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                          <div className="text-xs text-gray-500">{appointment.patientId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Stethoscope size={16} className="text-blue-500 mr-2" />
                        <span className="text-sm text-gray-900">{appointment.doctorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{appointment.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-indigo-500 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock size={12} className="mr-1" /> {appointment.time}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[appointment.status].bg} ${statusColors[appointment.status].text}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${typeColors[appointment.type].bg} ${typeColors[appointment.type].text}`}>
                        {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1).replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingAppointment(appointment);
                          setFormErrors({});
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        disabled={isUpdating}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isDeleting}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Appointments</p>
              <p className="text-2xl font-semibold mt-1">{appointments.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Scheduled</p>
              <p className="text-2xl font-semibold mt-1">
                {appointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Clock size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold mt-1">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Check size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Cancelled/No-show</p>
              <p className="text-2xl font-semibold mt-1">
                {appointments.filter(a => a.status === 'cancelled' || a.status === 'no-show').length}
              </p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <X size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Appointment Modal */}
      {isModalOpen && editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAppointment.id ? 'Edit Appointment' : 'New Appointment'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingAppointment(null);
                  setFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* General form error */}
            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{formErrors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={editingAppointment.patientName}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, patientName: e.target.value })}
                  className={`w-full px-3 py-2 border ${formErrors.patientName ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {formErrors.patientName && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.patientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={editingAppointment.patientId}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, patientId: e.target.value })}
                  className={`w-full px-3 py-2 border ${formErrors.patientId ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {formErrors.patientId && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.patientId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <select
                  value={editingAppointment.doctorName}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, doctorName: e.target.value })}
                  className={`w-full px-3 py-2 border ${formErrors.doctorName ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select doctor</option>
                  {availableDoctors?.data?.map((doctorData) => {
                    const doctor = doctorData.doctor;
                    const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
                    return (
                      <option key={doctor.id} value={doctorName}>
                        {doctorName} ({doctor.specialization})
                      </option>
                    );
                  })}
                </select>
                {formErrors.doctorName && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.doctorName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editingAppointment.department}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, department: e.target.value })}
                  className={`w-full px-3 py-2 border ${formErrors.department ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {formErrors.department && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.department}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingAppointment.date}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, date: e.target.value })}
                    className={`w-full px-3 py-2 border ${formErrors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.date && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={editingAppointment.time.includes(':') ? editingAppointment.time.split(' ')[0] : '09:00'}
                    onChange={(e) => {
                      const timeValue = e.target.value;
                      const hours = parseInt(timeValue.split(':')[0]);
                      const minutes = timeValue.split(':')[1];
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      const hours12 = hours % 12 || 12;
                      const formattedTime = `${hours12}:${minutes} ${ampm}`;
                      setEditingAppointment({ ...editingAppointment, time: formattedTime });
                    }}
                    className={`w-full px-3 py-2 border ${formErrors.time ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.time && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.time}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingAppointment.status}
                  onChange={(e) => setEditingAppointment({ 
                    ...editingAppointment, 
                    status: e.target.value as 'scheduled' | 'completed' | 'cancelled' | 'no-show'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={editingAppointment.type}
                  onChange={(e) => setEditingAppointment({ 
                    ...editingAppointment, 
                    type: e.target.value as 'regular' | 'follow-up' | 'emergency'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="regular">Regular</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={editingAppointment.notes || ''}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAppointment(null);
                    setFormErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrUpdateAppointment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      {editingAppointment.id ? 'Updating...' : 'Scheduling...'}
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      {editingAppointment.id ? 'Update Appointment' : 'Schedule Appointment'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-gray-600">
                Are you sure you want to delete this appointment? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsConfirmingDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAppointment}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentsPage;