// src/pages/doctor/PatientsPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Plus, 
  FileText, 
  Calendar, 
  MessageSquare,
  Trash2,
  X,
  Edit
} from 'lucide-react';
import { patientsApi } from '../../../store/api/patientsApi';
import { Patient, PatientFormData } from '../../../store/api/patientsApi';

type FilterType = 'all' | 'active' | 'inactive';

const PatientsPage: React.FC = () => {
const [searchTerm, setSearchTerm] = useState<string>('');
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(''); // Debounced term for API
const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const [activeFilter, setActiveFilter] = useState<FilterType>('all');
const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
const [currentPage, setCurrentPage] = useState<number>(1);
const [limit] = useState<number>(10);
const [isEditMode, setIsEditMode] = useState<boolean>(false);
const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
const [isMedicalRecordsModalOpen, setIsMedicalRecordsModalOpen] = useState(false);

  // Patient form data now matches the API interface
  const [patientFormData, setPatientFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    age: 0,
    gender: 'Male',
    email: '',
    phone: '',
    status: 'Active',
    medicalHistory: ''
  });
  
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({});
  
  // Convert activeFilter to API status parameter
  const statusFilter = activeFilter === 'all' ? undefined : activeFilter === 'active' ? 'Active' : 'Inactive';
  
  console.log('Sending API request with params:', {
    page: currentPage,
    limit,
    search: searchTerm,
    status: statusFilter,
    sortBy: 'lastName',
    sortOrder: 'asc'
  });

  // Use RTK Query hooks to fetch patients and perform CRUD operations
  const { 
    data: patientsData, 
    isLoading, 
    isFetching,
    error,
    refetch
  } = patientsApi.useGetPatientsQuery({
    page: currentPage,
    limit,
    search: debouncedSearchTerm,
    status: statusFilter,
    sortBy: 'lastName',
    sortOrder: 'asc'
  },
  {
    refetchOnMountOrArgChange: true,
  });
  
  useEffect(() => {
    console.log('Filtered patients data:', patientsData);
  }, [patientsData]);


  console.log(patientsData);
  
  // Use RTK Query mutation hooks
  const [createPatient, { isLoading: isCreating }] = patientsApi.useCreatePatientMutation();
  const [updatePatient, { isLoading: isUpdating }] = patientsApi.useUpdatePatientMutation();
  const [deletePatient, { isLoading: isDeleting }] = patientsApi.useDeletePatientMutation();

  // Add this after the patientsApi.useGetPatientsQuery call
const filteredPatientsData = React.useMemo(() => {
  if (!patientsData) return null;
  
  // If not filtering by status (or all patients), return original data
  if (!statusFilter) return patientsData;
  
  // Otherwise, apply the status filter client-side
  return {
    ...patientsData,
    data: patientsData.data.filter(patient => patient.status === statusFilter)
  };
}, [patientsData, statusFilter]);

// Then use filteredPatientsData instead of patientsData in your JSX
  
  const handleFilterChange = (filter: FilterType): void => {
    console.log('Changing filter to:', filter);
    setActiveFilter(filter);

    console.log('New status filter will be:', 
      filter === 'all' ? undefined : 
      filter === 'active' ? 'Active' : 'Inactive');
    
    setCurrentPage(1); // Reset to first page when filter changes
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);
    setCurrentPage(1); // Reset to first page when search changes
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      console.log('Searching for:', searchValue);
      setDebouncedSearchTerm(searchValue); // Only update this after debounce
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms delay
    
    
  };

  const openModal = (patient?: Patient): void => {
    if (patient) {
      // Edit mode - populate form with patient data
      setPatientFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        age: patient.age,
        gender: patient.gender,
        email: patient.email,
        phone: patient.phone,
        status: patient.status,
        medicalHistory: patient.medicalHistory || '',
        address: patient.address
      });
      setIsEditMode(true);
    } else {
      // Add mode - reset form
      setPatientFormData({
        firstName: '',
        lastName: '',
        age: 0,
        gender: 'Male',
        email: '',
        phone: '',
        status: 'Active',
        medicalHistory: ''
      });
      setIsEditMode(false);
    }
    setIsModalOpen(true);
    setFormErrors({});
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setIsEditMode(false);
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    setPatientFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value
    }));
    
    // Clear error for this field when it's being edited
    if (formErrors[name as keyof PatientFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PatientFormData, string>> = {};
    let isValid = true;

    if (!patientFormData.firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    }

    if (!patientFormData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!patientFormData.age || patientFormData.age <= 0) {
      errors.age = 'Age must be a positive number';
      isValid = false;
    }

    if (!patientFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    }

    if (!patientFormData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(patientFormData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!patientFormData.medicalHistory?.trim()) {
      errors.medicalHistory = 'Medical history is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Log what we're submitting for debugging
      console.log('Submitting form data:', patientFormData);
      
      if (isEditMode && selectedPatient) {
        // Update existing patient
        await updatePatient({ 
          id: selectedPatient.id, 
          patientData: patientFormData 
        }).unwrap();
      } else {
        // Create new patient
        await createPatient(patientFormData).unwrap();
      }
      
      closeModal();
      refetch(); // Refresh the patient list
    } catch (error) {
      console.error('Failed to save patient:', error);
      
      // More detailed error logging
      if (error && typeof error === 'object' && 'data' in error) {
        console.error('Server response:', error.data);
      }
      
      // You could add user-facing error messaging here
      // setFormError('There was a problem saving the patient. Please try again.');
    }
  };

  const handleDeletePatient = async (id: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await deletePatient(id).unwrap();
        alert('Patient deleted successfully');
        refetch(); // Refresh the patient list
      } catch (err: any) {
        console.error('Failed to delete patient:', err);
        alert(`Failed to delete patient: ${err.data?.error || 'Unknown error'}`);
      }
    }
  };

  // Function to generate patient initials
  const getInitials = (patient: Patient): string => {
    return `${patient.firstName[0]}${patient.lastName[0]}`;
  };

  // Function to generate a background color based on patient id
  const getBgColor = (id: number): string => {
    const colors = ['bg-blue-100', 'bg-purple-100', 'bg-amber-100', 'bg-green-100', 'bg-emerald-100'];
    return colors[id % colors.length];
  };

  // Handle pagination change
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  // Selected patient for editing
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
        <button 
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
          onClick={() => openModal()}
          disabled={isCreating || isUpdating || isDeleting}
        >
          <Plus size={18} className="mr-2" />
          Add New Patient
        </button>
      </div>
      
      {/* Search and filter section */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative inline-block">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
                <Filter size={18} className="mr-2 text-gray-500" />
                <span>Filter</span>
                <ChevronDown size={18} className="ml-2 text-gray-500" />
              </button>
              {/* Filter dropdown would go here */}
            </div>
            
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button 
                className={`px-4 py-2 text-sm ${activeFilter === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button 
                className={`px-4 py-2 text-sm ${activeFilter === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => handleFilterChange('active')}
              >
                Active
              </button>
              <button 
                className={`px-4 py-2 text-sm ${activeFilter === 'inactive' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => handleFilterChange('inactive')}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">Loading patients...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-red-500">Error loading patients. Please try again.</p>
        </div>
      )}
      
      <div className="mb-2 text-sm text-gray-500">
  Found {patientsData?.data?.length || 0} patients
  {statusFilter ? ` with status "${statusFilter}"` : ''}
</div>
      {/* Patients list */}
      {!isLoading && !error && patientsData && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age/Gender
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medical History
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patientsData.data.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full ${getBgColor(patient.id)} flex items-center justify-center mr-3`}>
                          <span className="font-medium text-sm">{getInitials(patient)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{`${patient.firstName} ${patient.lastName}`}</div>
                          <div className="text-xs text-gray-500">Patient #{patient.id.toString().padStart(4, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.phone}</div>
                      <div className="text-xs text-gray-500">{patient.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.age} years</div>
                      <div className="text-xs text-gray-500">{patient.gender}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.lastVisit || 'Not available'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.medicalHistory || 'Not available'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                      <button 
                        className="p-1 text-blue-600 hover:text-blue-900" 
                        title="View Medical Records"
                        onClick={() => {
                        setSelectedPatient(patient);
                        setIsMedicalRecordsModalOpen(true);
                      }}
                      >
                        <FileText size={18} />
                      </button>
                      <button 
                        className="p-1 text-green-600 hover:text-green-900" 
                        title="Schedule Appointment"
                        onClick={() => {
                        setSelectedPatient(patient);
                        setIsAppointmentModalOpen(true);
                        }}
                      >
                          <Calendar size={18} />
                      </button>

                      <button 
                          className="p-1 text-purple-600 hover:text-purple-900" 
                          title="Send Message"
                          onClick={() => {
                          setSelectedPatient(patient);
                          setIsMessageModalOpen(true);
                        }}
                      >
                        <MessageSquare size={18} />
                      </button>
                        <button
                          className="p-1 text-yellow-600 hover:text-yellow-900"
                          title="Edit Patient"
                          onClick={() => {
                            setSelectedPatient(patient);
                            openModal(patient);
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-1 text-red-600 hover:text-red-900"
                          title="Delete Patient"
                          onClick={() => handleDeletePatient(patient.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {patientsData.pagination && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((patientsData.pagination.currentPage - 1) * limit) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(patientsData.pagination.currentPage * limit, patientsData.pagination.total)}</span> of{' '}
                    <span className="font-medium">{patientsData.pagination.total}</span> results
                  </ p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        patientsData.pagination.currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => handlePageChange(patientsData.pagination.currentPage - 1)}
                      disabled={patientsData.pagination.currentPage === 1 || isFetching}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
                    </button>
                    
                    {/* Generate page numbers */}
                    {Array.from({ length: patientsData.pagination.lastPage }, (_, i) => i + 1)
                      .filter(page => 
                        // Show first page, last page, current page, and pages around current
                        page === 1 || 
                        page === patientsData.pagination.lastPage || 
                        (page >= patientsData.pagination.currentPage - 1 && 
                         page <= patientsData.pagination.currentPage + 1)
                      )
                      .map((page, i, arr) => {
                        // Add ellipsis
                        const showEllipsisBefore = i > 0 && arr[i-1] !== page - 1;
                        const showEllipsisAfter = i < arr.length - 1 && arr[i+1] !== page + 1;
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsisBefore && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                            
                            <button
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === patientsData.pagination.currentPage 
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                              onClick={() => handlePageChange(page)}
                              disabled={isFetching}
                            >
                              {page}
                            </button>
                            
                            {showEllipsisAfter && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    
                    <button
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        patientsData.pagination.currentPage === patientsData.pagination.lastPage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => handlePageChange(patientsData.pagination.currentPage + 1)}
                      disabled={patientsData.pagination.currentPage === patientsData.pagination.lastPage || isFetching}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronDown className="h-5 w-5 -rotate-90" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Patient' : 'Add New Patient'}
                </h2>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={closeModal}
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={patientFormData.firstName}
                      onChange={handleFormChange}
                      className={`w-full p-2 border rounded-lg ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter first name"
                    />
                    {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                  </div>
                  
                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={patientFormData.lastName}
                      onChange={handleFormChange}
                      className={`w-full p-2 border rounded-lg ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter last name"
                    />
                    {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
                  </div>
                  
                  {/* Age */}
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={patientFormData.age || ''}
                      onChange={handleFormChange}
                      className={`w-full p-2 border rounded-lg ${formErrors.age ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter age"
                      min="0"
                    />
                    {formErrors.age && <p className="text-red-500 text-xs mt-1">{formErrors.age}</p>}
                  </div>
                  
                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={patientFormData.gender}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={patientFormData.phone}
                      onChange={handleFormChange}
                      className={`w-full p-2 border rounded-lg ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="(555) 123-4567"
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={patientFormData.email}
                      onChange={handleFormChange}
                      className={`w-full p-2 border rounded-lg ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="patient@example.com"
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                  
                  {/* Address */}
                  <div className="col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={patientFormData.address || ''}
                      onChange={handleFormChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Enter address"
                    />
                  </div>
                  
                  {/* Medical History */}
                  <div className="col-span-2">
                    <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
                      Medical History <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="medicalHistory"
                      name="medicalHistory"
                      value={patientFormData.medicalHistory || ''}
                      onChange={handleFormChange}
                      className={`w-full p-2 border rounded-lg ${formErrors.medicalHistory ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter medical history"
                      rows={3}
                    />
                    {formErrors.medicalHistory && <p className="text-red-500 text-xs mt-1">{formErrors.medicalHistory}</p>}
                  </div>
                  
                  {/* Status */}
                  <div className="col-span-2">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="Active"
                          checked={patientFormData.status === 'Active'}
                          onChange={handleFormChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="Inactive"
                          checked={patientFormData.status === 'Inactive'}
                          onChange={handleFormChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    onClick={closeModal}
                    disabled={isCreating || isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isCreating || isUpdating}
                  >
                    {isEditMode 
                      ? (isUpdating ? 'Saving...' : 'Save Changes') 
                      : (isCreating ? 'Adding...' : 'Add Patient')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Medical Records Modal */}
{isMedicalRecordsModalOpen && selectedPatient && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Medical Records: {selectedPatient.firstName} {selectedPatient.lastName}
          </h2>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setIsMedicalRecordsModalOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Display medical records content here */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800">Medical History</h3>
            <p className="mt-2 text-gray-700">{selectedPatient.medicalHistory || 'No medical history available'}</p>
          </div>
          
          {/* You can fetch and display more detailed records here */}
          <p className="text-gray-500">Detailed records would be displayed here.</p>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={() => setIsMedicalRecordsModalOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Appointment Modal */}
{isAppointmentModalOpen && selectedPatient && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Schedule Appointment for {selectedPatient.firstName} {selectedPatient.lastName}
          </h2>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setIsAppointmentModalOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Simple appointment form */}
        <form onSubmit={(e) => {
          e.preventDefault();
          alert(`Appointment would be scheduled for ${selectedPatient.firstName} ${selectedPatient.lastName}`);
          setIsAppointmentModalOpen(false);
        }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="appointmentDate"
                className="w-full p-2 border border-gray-300 rounded-lg"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div>
              <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="appointmentTime"
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            
            <div>
              <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="appointmentType"
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                required
              >
                <option value="regular">Regular Checkup</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="appointmentNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="appointmentNotes"
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Any additional information..."
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setIsAppointmentModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

{/* Message Modal */}
{isMessageModalOpen && selectedPatient && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Send Message to {selectedPatient.firstName} {selectedPatient.lastName}
          </h2>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setIsMessageModalOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          alert(`Message would be sent to ${selectedPatient.firstName} ${selectedPatient.lastName}`);
          setIsMessageModalOpen(false);
        }}>
          <div>
            <label htmlFor="messageSubject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="messageSubject"
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Enter subject"
              required
            />
          </div>
          
          <div className="mt-4">
            <label htmlFor="messageContent" className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="messageContent"
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows={5}
              placeholder="Type your message here..."
              required
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setIsMessageModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

      {/* Confirmation Dialog (could be implemented) */}
      {/* 
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this patient? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  );
};

export default PatientsPage;