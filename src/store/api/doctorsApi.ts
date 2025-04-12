import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define types that match your database schema
export interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorModel {
  imageUrl: string;
  rating: number;
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  phone: string | null;
  email: string | null;
  availability: string[] | null;
  department?: string;
  qualification?: string;
  experience?: number;
  status?: 'active' | 'inactive' | 'on-leave';
}

// Combined doctor with user (from joined query)
export interface DoctorWithUser {
  doctor: DoctorModel;
  user: User;
}

// Frontend-friendly doctor object
export interface Doctor {
  id: string;
  userId: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department?: string;
  qualification?: string;
  experience?: number;
  status?: 'active' | 'inactive' | 'on-leave';
  appointments?: number;
  rating?: number;
  availability: string[] | null;
  imageUrl?: string;
  joinDate?: string;
}

// API response structure for paginated results
export interface DoctorsResponse {
  data: DoctorWithUser[];
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// CreateDoctorRequest matches your backend expectations
export interface CreateDoctorRequest {
  userId: number;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  phone?: string;
  email?: string;
  availability?: string[];
  department?: string;
  qualification?: string;
  experience?: number;
  status?: 'active' | 'inactive' | 'on-leave';
}

export const doctorApi = createApi({
  reducerPath: 'doctorApi',
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
  tagTypes: ['Doctor', 'DoctorList'],
  endpoints: (builder) => ({
    // Get all doctors with optional pagination and filtering
    getAllDoctors: builder.query<DoctorsResponse, { department?: string, status?: string, page?: number, limit?: number }>({
      query: ({ department, status, page = 1, limit = 10 }) => {
        let url = '/doctors';
        const params = new URLSearchParams();
        if (department) params.append('department', department);
        if (status) params.append('status', status);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
      },
      providesTags: ['DoctorList'],
    }),
    
    // Get doctor by ID
    getDoctor: builder.query<DoctorWithUser, number>({
      query: (id) => `/doctors/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Doctor', id }],
    }),
    
    // Search doctors
    searchDoctors: builder.query<DoctorsResponse, { q?: string, specialization?: string, page?: number, limit?: number }>({
      query: ({ q, specialization, page = 1, limit = 10 }) => {
        let url = '/doctors/search';
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (specialization) params.append('specialization', specialization);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        const queryString = params.toString();
        return `${url}?${queryString}`;
      },
      providesTags: ['DoctorList'],
    }),
    
    // Get doctors by specialization
    getDoctorsBySpecialization: builder.query<DoctorWithUser[], string>({
      query: (specialization) => `/doctors/specialization/${specialization}`,
      providesTags: ['DoctorList'],
    }),
    
    // Create new doctor
    createDoctor: builder.mutation<{ message: string, doctor: DoctorModel }, CreateDoctorRequest>({
      query: (doctor) => ({
        url: '/doctors',
        method: 'POST',
        body: doctor,
      }),
      invalidatesTags: ['DoctorList'],
    }),
    
    // Update doctor
    updateDoctor: builder.mutation<{ message: string, doctor: DoctorModel }, { id: number, doctor: Partial<CreateDoctorRequest> }>({
      query: ({ id, doctor }) => ({
        url: `/doctors/${id}`,
        method: 'PUT',
        body: doctor,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Doctor', id },
        'DoctorList'
      ],
    }),
    
    // Delete doctor
    deleteDoctor: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/doctors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DoctorList'],
    }),
  }),
});
