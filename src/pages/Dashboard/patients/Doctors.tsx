import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Calendar, Phone, Mail, Heart, MapPin, Clock, AlertCircle } from 'lucide-react';
import AppointmentForm from './appointmentsForm';
import { doctorApi } from '../../../store/api/doctorsApi';

// Types for doctor data (already defined in the component)
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  experience: number;
  education: string[];
  languages: string[];
  availability: {
    days: string[];
    hours: string;
  };
  bio: string;
  address: string;
  contact: {
    email: string;
    phone: string;
  };
  isAcceptingNewPatients: boolean;
  isFavorite: boolean;
  department: string;
}

// Types for filter options
interface FilterOptions {
  specialty: string;
  department: string;
  availability: string;
  acceptingNewPatients: boolean;
}

const PatientDoctorsPage: React.FC = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    specialty: '',
    department: '',
    availability: '',
    acceptingNewPatients: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDoctorForAppointment, setSelectedDoctorForAppointment] = useState<Doctor | null>(null);

  // Determine whether to use getAllDoctors or searchDoctors based on searchTerm and filters.specialty
  const shouldSearch = searchTerm !== '' || filters.specialty !== '';

  // Fetch all doctors when no search term or specialty filter is applied
  const { data: allDoctorsResponse, isLoading: isLoadingAll, error: errorAll } = doctorApi.useGetAllDoctorsQuery(
    { page: 1, limit: 20 },
    { skip: shouldSearch }
  );

  // Fetch doctors using the searchDoctors endpoint when a search term or specialty filter is applied
  const { data: searchDoctorsResponse, isLoading: isLoadingSearch, error: errorSearch } = doctorApi.useSearchDoctorsQuery(
    {
      q: searchTerm || undefined,
      specialization: filters.specialty || undefined,
      page: 1,
      limit: 20,
    },
    { skip: !shouldSearch }
  );

  // Combine the responses
  const doctorsResponse = shouldSearch ? searchDoctorsResponse : allDoctorsResponse;
  const isLoading = shouldSearch ? isLoadingSearch : isLoadingAll;
  const error = shouldSearch ? errorSearch : errorAll;

  // Map API response to the frontend Doctor type and manage isFavorite locally
  useEffect(() => {
    if (doctorsResponse?.data) {
      const mappedDoctors: Doctor[] = doctorsResponse.data.map((doctorWithUser) => {
        const { doctor, user } = doctorWithUser;

        // Normalize availability.days to always be an array
        let availabilityDays: string[] = ['Monday', 'Wednesday', 'Friday']; // Default value
        if (doctor.availability) {
          if (Array.isArray(doctor.availability)) {
            availabilityDays = doctor.availability;
          } else if (typeof doctor.availability === 'string') {
            // If availability is a string (e.g., "Monday,Wednesday"), split it into an array
            const availabilityStr: string = doctor.availability;
            availabilityDays = availabilityStr.split(',').map((day) => day.trim());
          }
        }

        return {
          id: doctor.id.toString(),
          name: `${doctor.firstName} ${doctor.lastName}`,
          specialty: doctor.specialization,
          image: doctor.imageUrl || 'https://via.placeholder.com/150',
          rating: doctor.rating || 4.5,
          experience: doctor.experience || 0,
          education: doctor.qualification ? [doctor.qualification] : ['Not specified'],
          languages: ['English'],
          availability: {
            days: availabilityDays,
            hours: '9:00 AM - 5:00 PM',
          },
          bio: 'Specialist in their field, dedicated to providing excellent patient care.',
          address: '123 Medical Center Blvd',
          contact: {
            email: doctor.email || user.email || 'not-provided@hospital.com',
            phone: doctor.phone || 'Not provided',
          },
          isAcceptingNewPatients: doctor.status === 'active',
          isFavorite: false,
          department: doctor.department || 'Not specified',
        };
      });
      setDoctors(mappedDoctors);
    }
  }, [doctorsResponse]);

  // Filtered doctors based on search and filters (additional client-side filtering)
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesAvailability =
      filters.availability === '' ||
      (Array.isArray(doctor.availability.days) && doctor.availability.days.includes(filters.availability));
    const matchesAcceptingPatients = !filters.acceptingNewPatients || doctor.isAcceptingNewPatients;
    return matchesAvailability && matchesAcceptingPatients;
  });

  // Get unique specialties and departments for filter options
  const specialties = Array.from(new Set(doctors.map((doctor) => doctor.specialty)));
  const departments = Array.from(new Set(doctors.map((doctor) => doctor.department)));

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.id === id ? { ...doctor, isFavorite: !doctor.isFavorite } : doctor
      )
    );
  };

  // Handle appointment booking
  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctorForAppointment(doctor);
    setShowAppointmentModal(true);
  };

  // Handle view profile
  const handleViewProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorModal(true);
  };

  // Handle appointment booked
  const handleAppointmentBooked = (appointmentDetails: any) => {
    console.log('Appointment booked:', appointmentDetails);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name or specialty..."
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
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <select
                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.specialty}
                onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              >
                <option value="">All Departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available On</label>
              <select
                className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              >
                <option value="">Any Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={filters.acceptingNewPatients}
                  onChange={(e) => setFilters({ ...filters, acceptingNewPatients: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Accepting new patients</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Doctor list */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Loading doctors...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-500 flex items-center justify-center">
            <AlertCircle size={20} className="mr-2" />
            Error loading doctors: {(error as any)?.data?.message || JSON.stringify(error) || 'An error occurred'}
          </p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-2">No doctors match your search criteria</p>
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => {
              setSearchTerm('');
              setFilters({
                specialty: '',
                department: '',
                availability: '',
                acceptingNewPatients: false,
              });
            }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{doctor.name}</h3>
                      <button
                        onClick={() => toggleFavorite(doctor.id)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={doctor.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart
                          size={20}
                          fill={doctor.isFavorite ? '#EF4444' : 'none'}
                          className={doctor.isFavorite ? 'text-red-500' : ''}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-blue-600">{doctor.specialty}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">{doctor.rating}</span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{doctor.experience} years exp.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500 line-clamp-2">{doctor.bio}</div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {doctor.languages.map((language, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                      {language}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Clock size={16} className="mr-1" />
                  <span>
                    Available:{' '}
                    {Array.isArray(doctor.availability.days)
                      ? doctor.availability.days.join(', ')
                      : 'Not specified'}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleViewProfile(doctor)}
                    className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleBookAppointment(doctor)}
                    className={`py-2 px-4 rounded-md text-sm font-medium ${
                      doctor.isAcceptingNewPatients
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!doctor.isAcceptingNewPatients}
                  >
                    {doctor.isAcceptingNewPatients ? 'Book Appointment' : 'Not Accepting Patients'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor profile modal */}
      {showDoctorModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">{selectedDoctor.name}</h2>
              <button
                onClick={() => setShowDoctorModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-6">
                <img
                  src={selectedDoctor.image}
                  alt={selectedDoctor.name}
                  className="w-20 h-20 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedDoctor.name}</h3>
                  <p className="text-md text-blue-600">{selectedDoctor.specialty}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-400" />
                      <span className="ml-1 text-sm text-gray-600">{selectedDoctor.rating}</span>
                    </div>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-600">{selectedDoctor.experience} years experience</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
                  <p className="text-gray-600">{selectedDoctor.bio}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Education & Training</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {selectedDoctor.education.map((edu, index) => (
                      <li key={index}>{edu}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Phone size={16} className="mr-2" />
                        <span>{selectedDoctor.contact.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail size={16} className="mr-2" />
                        <span>{selectedDoctor.contact.email}</span>
                      </div>
                      <div className="flex items-start text-gray-600">
                        <MapPin size={16} className="mr-2 mt-1 flex-shrink-0" />
                        <span>{selectedDoctor.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Availability</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        <span>
                          {Array.isArray(selectedDoctor.availability.days)
                            ? selectedDoctor.availability.days.join(', ')
                            : 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={16} className="mr-2" />
                        <span>{selectedDoctor.availability.hours}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        {selectedDoctor.isAcceptingNewPatients
                          ? 'Currently accepting new patients'
                          : 'Not accepting new patients at this time'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button
                    onClick={() => setShowDoctorModal(false)}
                    className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedDoctor.isAcceptingNewPatients && (
                    <button
                      onClick={() => {
                        setShowDoctorModal(false);
                        handleBookAppointment(selectedDoctor);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Book Appointment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Form Modal */}
      <AppointmentForm
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onAppointmentBooked={handleAppointmentBooked} patientId={0}      />
    </div>
  );
};

export default PatientDoctorsPage;