// src/pages/admin/DoctorsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  X,
  Check,
  Stethoscope,
  UserPlus,
  Clock,
  Star,
  Award,
  Phone,
  Mail,
  Eye
} from 'lucide-react';
import { doctorApi } from '../../../store/api/doctorsApi';

// Define doctor types and interfaces
interface CreateDoctorRequest {
  userId: number;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  phone: string;
  email: string;
  availability: string[];
  department: string;
  qualification: string;
  experience: number;
  status: 'active' | 'inactive' | 'on-leave';
}

interface FormError {
  name?: string;
  email?: string;
  [key: string]: string | undefined;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  qualification: string;
  experience: number;
  status: 'active' | 'inactive' | 'on-leave';
  appointments?: number;
  rating?: number;
  availability?: string[];
  imageUrl?: string;
  joinDate: string;
}

interface Department {
  id: string;
  name: string;
}

const DoctorsPage: React.FC = () => {
  // Sample departments
  const departments: Department[] = [
    { id: '1', name: 'Cardiology' },
    { id: '2', name: 'Neurology' },
    { id: '3', name: 'Orthopedics' },
    { id: '4', name: 'Pediatrics' },
    { id: '5', name: 'Dermatology' },
    { id: '6', name: 'Ophthalmology' },
    { id: '7', name: 'Gynecology' },
    { id: '8', name: 'Oncology' },
    { id: '9', name: 'ENT' },
    { id: '10', name: 'Psychiatry' },
  ];

  // State for doctors
  const [doctors, setDoctors] = useState<Doctor[]>([]);
const { 
  data: fetchedDoctors, 
  isLoading: isFetchingDoctors, 
  error: fetchError,
  refetch: refetchDoctors
} = doctorApi.useGetAllDoctorsQuery({ 
  page: 1, 
  limit: 100 
});

// Add this useEffect to process the API response
useEffect(() => {
  if (fetchedDoctors && fetchedDoctors.data) {
    // Transform the backend data to match your Doctor interface
    const transformedDoctors = fetchedDoctors.data.map(item => {
      const doctor = item.doctor;
      const user = item.user;
      
      return {
        id: doctor.id.toString(),
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        email: doctor.email || user.email,
        phone: doctor.phone || '',
        specialization: doctor.specialization,
        department: doctor.department || '',
        qualification: doctor.qualification || '',
        experience: doctor.experience || 0,
        status: doctor.status || 'active',
        appointments: 0,
        rating: 0,
        availability: doctor.availability || [],
        joinDate: user.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
      } as Doctor;
    });
    
    setDoctors(transformedDoctors);
  }
}, [fetchedDoctors]);

  const [createDoctor] = doctorApi.useCreateDoctorMutation();
const [updateDoctor] = doctorApi.useUpdateDoctorMutation();
const [deleteDoctor] = doctorApi.useDeleteDoctorMutation();
  

  // State for search, filtering, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'on-leave' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(5);

  // State for the modal
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);

  // New doctor form state
  const [newDoctor, setNewDoctor] = useState<Omit<Doctor, 'id'>>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    department: '',
    qualification: '',
    experience: 0,
    status: 'active',
    appointments: 0,
    rating: 0,
    availability: [],
    joinDate: new Date().toISOString().split('T')[0]
  });

  // Filter doctors based on search term, department, and status
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || doctor.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || doctor.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Get current doctors for pagination
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Status badge color map
  const statusBadgeColors: Record<'active' | 'inactive' | 'on-leave', { bg: string; text: string }> = {
    'active': { bg: 'bg-green-100', text: 'text-green-800' },
    'inactive': { bg: 'bg-gray-100', text: 'text-gray-800' },
    'on-leave': { bg: 'bg-amber-100', text: 'text-amber-800' }
  };

  const validateForm = (doctor: Doctor): FormError => {
    const errors: FormError = {};
    
    if (!doctor.name || doctor.name.length < 5) {
      errors.name = 'Full name is required (min 5 characters)';
    }
    
    if (!doctor.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctor.email)) {
      errors.email = 'Valid email is required';
    }
    
    // Add more validation as needed
    
    return errors;
  };

  const [formErrors, setFormErrors] = useState<FormError>({});
// Add loading state
const [isCreating, setIsCreating] = useState(false);

const handleAddDoctor = async () => {
  // Validate form first
  const errors = validateForm(newDoctor as Doctor);
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  setIsCreating(true);
  
  try {
    // Split name into first and last name
    const nameParts = newDoctor.name.split(' ');
    const firstName = nameParts[0] || 'Doctor';
    const lastName = nameParts.slice(1).join(' ') || 'Unknown';

    // Create request object with the exact fields expected by your API
    const doctorRequest: CreateDoctorRequest = {
      userId: 1, // Make sure this is a valid user ID in your database
      firstName: firstName,
      lastName: lastName,
      specialization: newDoctor.specialization || 'General',
      licenseNumber: "LIC-" + Math.floor(Math.random() * 10000),
      phone: newDoctor.phone || '',  // Make sure empty values are handled
      email: newDoctor.email || '',
      availability: newDoctor.availability || [],
      department: newDoctor.department || '',
      qualification: newDoctor.qualification || '',
      experience: newDoctor.experience || 0,
      status: newDoctor.status || 'active'
    };

    // Log the exact request being sent for debugging
    console.log('Sending doctor creation request:', doctorRequest);
      
    const response = await createDoctor(doctorRequest).unwrap();
    console.log('Create doctor response:', response);
    
    // Add the new doctor to local state
    // Refresh the data from the API
refetchDoctors();
    
    // Reset form and states
    setNewDoctor({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      department: '',
      qualification: '',
      experience: 0,
      status: 'active',
      appointments: 0,
      rating: 0,
      availability: [],
      joinDate: new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
    setIsAddDoctorModalOpen(false);
    setIsCreating(false);
  } catch (error: any) {
    setIsCreating(false);
    console.error('Failed to create doctor:', error);
    
    // Detailed error logging
    if (error.status) console.error('Error status:', error.status);
    if (error.data) console.error('Error response data:', error.data);
    
    // You could set a specific error message based on the response
    if (error.status === 400) {
      // Set validation errors if the backend returns them
      if (error.data && error.data.details) {
        // Map backend errors to form errors
        setFormErrors(error.data.details);
      }
    }
  }
};

  // Handle editing a doctor
  const [isUpdating, setIsUpdating] = useState(false);
  if (editingDoctor) {
    console.log("Doctor ID before update:", editingDoctor.id, "Type:", typeof editingDoctor.id);
  }
  const handleEditDoctor = async () => {
    if (!editingDoctor) return;
    const errors = validateForm(editingDoctor);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Split name into first and last name
      const nameParts = editingDoctor.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'Unknown';

      console.log('Updating doctor with ID:', editingDoctor.id);
      
      // Create request object that matches API expectations
      const updateRequest = {
        id: parseInt(editingDoctor.id),
        doctor: {
          firstName: firstName,
          lastName: lastName,
          specialization: editingDoctor.specialization || 'General',
          // Include licenseNumber which might be required
          licenseNumber: "LIC-" + Math.floor(Math.random() * 10000),
          phone: editingDoctor.phone || '',
          email: editingDoctor.email || '',
          department: editingDoctor.department || '',
          qualification: editingDoctor.qualification || '',
          experience: editingDoctor.experience || 0,
          status: editingDoctor.status || 'active',
          availability: editingDoctor.availability || []
        }
      };
      
      console.log('Update request:', updateRequest);

      const response = await updateDoctor(updateRequest).unwrap();
    console.log('Update response:', response);
      
      // Update local state
      refetchDoctors();

      setEditingDoctor(null);
    setFormErrors({});
    setIsUpdating(false);
    
    // Show success message
    alert('Doctor updated successfully');
    } catch (error: any) {
      setIsUpdating(false);
      console.error('Failed to update doctor:', error);

      if (error.status) console.error('Error status:', error.status);
    if (error.data) console.error('Error data:', error.data);
    
    // Show error message
    alert(`Failed to update doctor: ${error.data?.message || 'Unknown error'}`);
    }
  };

  // Handle deleting a doctor
  const handleDeleteDoctor = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        // Log ID before attempting delete to see what's being passed
        console.log('Attempting to delete doctor with ID:', id, 'Type:', typeof id);
        
        // Try to perform the delete
        const response = await deleteDoctor(parseInt(id)).unwrap();
        console.log('Delete response:', response);
        
        // Update local state
        // Refresh the data from the API
        refetchDoctors();
      } catch (error: any) {
        console.error('Failed to delete doctor:', error);
        // Log detailed error information
        if (error.status) console.error('Error status:', error.status);
        if (error.data) console.error('Error data:', error.data);
      }
    }
  };

  // View doctor details
  const handleViewDoctor = (doctor: Doctor) => {
    setViewingDoctor(doctor);
    setIsViewModalOpen(true);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  // Handle availability days
  const handleAvailabilityChange = (day: string) => {
    if (editingDoctor) {
      const availability = editingDoctor.availability || [];
      if (availability.includes(day)) {
        setEditingDoctor({
          ...editingDoctor,
          availability: availability.filter(d => d !== day)
        });
      } else {
        setEditingDoctor({
          ...editingDoctor,
          availability: [...availability, day]
        });
      }
    } else if (isAddDoctorModalOpen) {
      const availability = newDoctor.availability || [];
      if (availability.includes(day)) {
        setNewDoctor({
          ...newDoctor,
          availability: availability.filter(d => d !== day)
        });
      } else {
        setNewDoctor({
          ...newDoctor,
          availability: [...availability, day]
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Stethoscope className="mr-2" size={24} />
            Doctors Management
          </h2>
          <button
            onClick={() => setIsAddDoctorModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
          >
            <UserPlus size={18} className="mr-2" />
            Add New Doctor
          </button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="relative md:w-64">
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex flex-wrap items-center space-x-2 space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <Filter size={18} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-500 mr-2">Department:</span>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'active' | 'inactive' | 'on-leave' | 'all')}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
            
            {(searchTerm || selectedDepartment !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={resetFilters}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <X size={16} className="mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Doctors Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
  {isFetchingDoctors ? (
    <tr>
      <td colSpan={8} className="px-6 py-10 text-center">
        <div className="flex flex-col items-center justify-center">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500">Loading doctors...</p>
        </div>
      </td>
    </tr>
  ) : fetchError ? (
    <tr>
      <td colSpan={8} className="px-6 py-4 text-center text-red-500">
        Error loading doctors. Please try again.
      </td>
    </tr>
  ) : currentDoctors.length > 0 ? (
    currentDoctors.map((doctor) => (
      <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {doctor.imageUrl ? 
                            <img src={doctor.imageUrl} alt={doctor.name} className="h-10 w-10 rounded-full" /> :
                            <span className="text-blue-600 font-semibold">{doctor.name.split(' ').map(n => n[0]).join('')}</span>
                          }
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                          <div className="text-xs text-gray-500">
                            {doctor.qualification}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex flex-col">
                        <span className="flex items-center">
                          <Mail size={12} className="mr-1" /> {doctor.email}
                        </span>
                        <span className="flex items-center mt-1">
                          <Phone size={12} className="mr-1" /> {doctor.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.specialization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{doctor.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{doctor.experience} years</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusBadgeColors[doctor.status].bg} ${statusBadgeColors[doctor.status].text}`}>
                        {doctor.status === 'on-leave' ? 'On Leave' : doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-700">{doctor.rating || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDoctor(doctor)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setEditingDoctor(doctor)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
        No doctors found
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredDoctors.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstDoctor + 1} to {Math.min(indexOfLastDoctor, filteredDoctors.length)} of {filteredDoctors.length} doctors
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => paginate(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === number
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Department Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Doctors</p>
              <p className="text-2xl font-semibold mt-1">{doctors.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Stethoscope size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Doctors</p>
              <p className="text-2xl font-semibold mt-1">
                {doctors.filter(doctor => doctor.status === 'active').length}
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
              <p className="text-sm font-medium text-gray-500">On Leave</p>
              <p className="text-2xl font-semibold mt-1">
                {doctors.filter(doctor => doctor.status === 'on-leave').length}
              </p>
            </div>
            <div className="bg-amber-100 rounded-full p-3">
              <Clock size={24} className="text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Top Specialists</p>
              <p className="text-2xl font-semibold mt-1">
                {doctors.filter(doctor => (doctor.rating || 0) >= 4.5).length}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Award size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Doctors by Department</h3>
          <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Department Distribution Chart</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {departments.slice(0, 6).map(dept => {
              const count = doctors.filter(d => d.department === dept.name).length;
              return count > 0 ? (
                <div key={dept.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{dept.name}</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{count}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Appointment Statistics</h3>
          <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Appointment Statistics Chart</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-semibold text-blue-600">
                {doctors.reduce((sum, doctor) => sum + (doctor.appointments || 0), 0)}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-xl font-semibold text-green-600">87</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">Avg Per Doctor</p>
              <p className="text-xl font-semibold text-purple-600">
                {doctors.length > 0 ? Math.round(doctors.reduce((sum, doctor) => sum + (doctor.appointments || 0), 0) / doctors.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {isAddDoctorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Doctor</h3>
              <button
                onClick={() => setIsAddDoctorModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dr. Full Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newDoctor.phone}
                  onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={newDoctor.department}
                  onChange={(e) => setNewDoctor({ ...newDoctor, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Pediatric Cardiology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  value={newDoctor.qualification}
                  onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. MD, PhD, FACC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (years)
                </label>
                <input
                  type="number"
                  value={newDoctor.experience}
                  onChange={(e) => setNewDoctor({ ...newDoctor, experience: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      checked={newDoctor.status === 'active'}
                      onChange={() => setNewDoctor({ ...newDoctor, status: 'active' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      checked={newDoctor.status === 'inactive'}
                      onChange={() => setNewDoctor({ ...newDoctor, status: 'inactive' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Inactive</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      checked={newDoctor.status === 'on-leave'}
                      onChange={() => setNewDoctor({ ...newDoctor, status: 'on-leave' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">On Leave</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleAvailabilityChange(day)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        newDoctor.availability?.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddDoctorModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
  onClick={handleAddDoctor}
  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
  disabled={isCreating || !newDoctor.name || !newDoctor.email || !newDoctor.department}
>
  {isCreating ? (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Adding...
    </>
  ) : (
    <>
      <Check size={16} className="mr-2" />
      Add Doctor
    </>
  )}
</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Doctor</h3>
              <button
                onClick={() => setEditingDoctor(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingDoctor.name}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editingDoctor.email}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editingDoctor.phone}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={editingDoctor.department}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={editingDoctor.specialization}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  value={editingDoctor.qualification}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, qualification: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience (years)
                </label>
                <input
                  type="number"
                  value={editingDoctor.experience}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, experience: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="edit-status"
                      checked={editingDoctor.status === 'active'}
                      onChange={() => setEditingDoctor({ ...editingDoctor, status: 'active' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="edit-status"
                      checked={editingDoctor.status === 'inactive'}
                      onChange={() => setEditingDoctor({ ...editingDoctor, status: 'inactive' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Inactive</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="edit-status"
                      checked={editingDoctor.status === 'on-leave'}
                      onChange={() => setEditingDoctor({ ...editingDoctor, status: 'on-leave' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">On Leave</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleAvailabilityChange(day)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        editingDoctor.availability?.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
              <button
    onClick={() => setEditingDoctor(null)}
    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
  >
    Cancel
  </button>
  <button
    onClick={handleEditDoctor}
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
    disabled={isUpdating || !editingDoctor.name || !editingDoctor.email || !editingDoctor.department}
  >
    {isUpdating ? (
      <>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Updating...
      </>
    ) : (
      <>
        <Check size={16} className="mr-2" />
        Save Changes
      </>
    )}
  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Doctor Modal */}
      {isViewModalOpen && viewingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Doctor Details</h3>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingDoctor(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center">
                  {viewingDoctor.imageUrl ? 
                    <img src={viewingDoctor.imageUrl} alt={viewingDoctor.name} className="h-32 w-32 rounded-full" /> :
                    <span className="text-blue-600 font-semibold text-4xl">
                      {viewingDoctor.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  }
                </div>
                <div className="mt-4 text-center">
                  <h4 className="text-xl font-semibold">{viewingDoctor.name}</h4>
                  <p className="text-gray-500">{viewingDoctor.specialization}</p>
                  <div className="flex items-center justify-center mt-2">
                    <Star size={18} className="text-yellow-400" />
                    <span className="ml-1 font-medium">{viewingDoctor.rating || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Department</h5>
                      <p className="mt-1">{viewingDoctor.department}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Experience</h5>
                      <p className="mt-1">{viewingDoctor.experience} years</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Qualification</h5>
                      <p className="mt-1">{viewingDoctor.qualification}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Status</h5>
                      <p className="mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusBadgeColors[viewingDoctor.status].bg} ${statusBadgeColors[viewingDoctor.status].text}`}>
                          {viewingDoctor.status === 'on-leave' ? 'On Leave' : viewingDoctor.status.charAt(0).toUpperCase() + viewingDoctor.status.slice(1)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Email</h5>
                      <p className="mt-1">{viewingDoctor.email}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Phone</h5>
                      <p className="mt-1">{viewingDoctor.phone}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Joined</h5>
                      <p className="mt-1">{new Date(viewingDoctor.joinDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Total Appointments</h5>
                      <p className="mt-1">{viewingDoctor.appointments || 0}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Availability</h5>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <span
                          key={day}
                          className={`px-3 py-1 text-xs rounded-md ${
                            viewingDoctor.availability?.includes(day)
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setEditingDoctor(viewingDoctor);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit Doctor
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingDoctor(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;