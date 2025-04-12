// src/services/patientsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Patient {
  name: string;
  bgColor: string;
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  address?: string;
  medicalHistory?: string;
  status: 'Active' | 'Inactive';
  dateOfBirth?: string;
  lastVisit?: string;
  primaryDoctor?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  department?: {
    id: number;
    name: string;
  };
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  address?: string;
  medicalHistory?: string;
  status?: 'Active' | 'Inactive';
  dateOfBirth?: string;
  primaryDoctorId?: number;
  departmentId?: number;
}

export interface PaginatedPatients {
  data: Patient[];
  pagination: {
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  };
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Helper to convert gender format (API uses lowercase, frontend uses capitalized)
function formatGender(gender: string): 'Male' | 'Female' | 'Other' {
  if (gender && typeof gender === 'string') {
    const lowercaseGender = gender.toLowerCase();
    if (lowercaseGender === 'male') return 'Male';
    if (lowercaseGender === 'female') return 'Female';
  }
  return 'Other';
}

export const patientsApi = createApi({
  reducerPath: 'patientsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Patients'],
  endpoints: (builder) => ({
// Get paginated list of patients
getPatients: builder.query<PaginatedPatients, {
      page?: number;
      limit?: number;
      search?: string;
      status?: 'Active' | 'Inactive';
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }>({
      query: (params) => {
        const { search, ...otherParams } = params;

         // If search is provided, use the search endpoint
    if (search && search.trim() !== '') {
      return {
        url: '/patients/search', // Use the search endpoint
        params: {
          ...otherParams,
          name: search // Use 'name' parameter instead of 'search'
        }
      };
    }

       return{
        url: '/patients',
        params,
      };
    },
      transformResponse: (response: any, _meta, arg) => {
        // Transform the nested structure to match frontend expectations
        return {
          data: response.data.map((item: any) => ({
            id: item.patients.id,
            firstName: item.patients.firstName,
            lastName: item.patients.lastName,
            email: item.users.email,
            phone: item.patients.phone,
            gender: formatGender(item.patients.gender),
            age: calculateAge(item.patients.dateOfBirth),
            medicalHistory: item.patients.medicalHistory,
            status: item.patients.status || (arg.status || 'Active'),// Default since not in API response
            address: item.patients.address,
            dateOfBirth: item.patients.dateOfBirth,
            // Add other fields from API as needed
            allergies: item.patients.allergies,
            bloodType: item.patients.bloodType
          })),
          pagination: response.pagination
        };
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.data.map(({ id }) => ({ type: 'Patients' as const, id })),
              { type: 'Patients', id: 'LIST' }
            ]
          : [{ type: 'Patients', id: 'LIST' }],
    }),

    // Get patient by ID
    getPatientById: builder.query<Patient, number>({
      query: (id) => `/patients/${id}`,
      transformResponse: (response: any) => {
        const item = response.data;
        return {
          id: item.patients.id,
          name: `${item.patients.firstName} ${item.patients.lastName}`,
          firstName: item.patients.firstName,
          lastName: item.patients.lastName,
          email: item.users.email,
          phone: item.patients.phone,
          gender: formatGender(item.patients.gender),
          age: calculateAge(item.patients.dateOfBirth),
          medicalHistory: item.patients.medicalHistory,
          status: 'Active',
          address: item.patients.address,
          dateOfBirth: item.patients.dateOfBirth,
          allergies: item.patients.allergies,
          bloodType: item.patients.bloodType,
          bgColor: '#ffffff' // Adding default white background color
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'Patients', id }],
    }),

    // Create new patient
    createPatient: builder.mutation<Patient, PatientFormData>({
      query: (newPatient) => {
        console.log('API request payload:', JSON.stringify(newPatient, null, 2));
        // Format the data to match what the server expects
        const apiFormat = {
          userId: 1,  // This is crucial - your backend needs this
          firstName: newPatient.firstName,
          lastName: newPatient.lastName,
          dateOfBirth: newPatient.dateOfBirth || new Date(new Date().getFullYear() - newPatient.age, 0, 1).toISOString().split('T')[0],
          gender: newPatient.gender.toLowerCase(),
          phone: newPatient.phone,
          address: newPatient.address || '',
          medicalHistory: newPatient.medicalHistory || '',
          emergencyContact: "",
  emergencyPhone: "+1234567890",
  bloodType: "O+",
  allergies: "None"
        };
        
        console.log('Formatted for API:', apiFormat);
        
        return {
          url: '/patients',
          method: 'POST',
          body: apiFormat,
        };
      },
      transformResponse: (response: any) => {
        // Transform the response to match your frontend Patient interface
        if (response && response.patient) {
          return {
            id: response.patient.id,
            firstName: response.patient.firstName,
            lastName: response.patient.lastName,
            age: calculateAge(response.patient.dateOfBirth),
            gender: formatGender(response.patient.gender),
            email: '', // This is missing in the response
            phone: response.patient.phone,
            address: response.patient.address,
            medicalHistory: response.patient.medicalHistory,
            status: 'Active', // Default since not in response
            dateOfBirth: response.patient.dateOfBirth
          };
        }
        return response;
      },
      invalidatesTags: [{ type: 'Patients', id: 'LIST' }],
    }),

    // Update existing patient
    updatePatient: builder.mutation<Patient, { id: number, patientData: PatientFormData }>({
      query: ({ id, patientData }) => ({
        url: `/patients/${id}`,
        method: 'Put',
        body: patientData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Patients', id },
        { type: 'Patients', id: 'LIST' }
      ],
    }),

    // Delete patient
    deletePatient: builder.mutation<void, number>({
      query: (id) => ({
        url: `/patients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Patients', id },
        { type: 'Patients', id: 'LIST' }
      ],
    }),
  }),
});