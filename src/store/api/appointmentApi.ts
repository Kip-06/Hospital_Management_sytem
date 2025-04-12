// src/services/appointmentApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define types based on your backend models
export interface Appointment {
    id: number;
    patientId: number;
    doctorId: number;
    departmentId?: number;
    dateTime: string;
    status: string;
    type: string;
    notes?: string;
    symptoms?: string;
  }

export interface Doctor {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  phone?: string;
  email?: string;
  availability: any;
}

interface CreateAppointmentRequest {
  patientId: number;
  doctorId: number;
  departmentId: number; // Add this field
  dateTime: string;
  type: string;
  notes: string;
  symptoms: string;
  status: string;
}

export const appointmentApi = createApi({
  reducerPath: 'appointmentApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8080',
    prepareHeaders: (headers) => {
      // Get token from your auth state
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Appointment', 'DoctorAppointments', 'PatientAppointments'],
  endpoints: (builder) => ({
    // Get all appointments with pagination
    getAllAppointments: builder.query<{ data: Appointment[], pagination: any }, { page?: number, limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `/appointments?page=${page}&limit=${limit}`,
      providesTags: ['Appointment'],
    }),
    
    
    // Get appointment by ID
    getAppointmentById: builder.query<Appointment, number>({
      query: (id) => `/appointments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Appointment', id }],
    }),
    
    // Create new appointment
    createAppointment: builder.mutation<Appointment, CreateAppointmentRequest>({
      query: (appointment) => ({
        url: '/appointments',
        method: 'POST',
        body: appointment,
      }),
      invalidatesTags: ['Appointment', 'PatientAppointments', 'DoctorAppointments'],
    }),
    
    // Update appointment
    updateAppointment: builder.mutation<Appointment, { id: number, appointment: Partial<CreateAppointmentRequest> }>({
      query: ({ id, appointment }) => ({
        url: `/appointments/${id}`,
        method: 'PUT',
        body: appointment,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Appointment', id },
        'PatientAppointments',
        'DoctorAppointments'
      ],
    }),
    
    // Delete appointment
    deleteAppointment: builder.mutation<void, number>({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment', 'PatientAppointments', 'DoctorAppointments'],
    }),
    
    // Get appointments by patient
    getAppointmentsByPatient: builder.query<
      { data: Appointment[], pagination: any }, 
      { patientId: number, page?: number, limit?: number, status?: string }
    >({
      query: ({ patientId, page = 1, limit = 10, status }) => {
        let url = `/patients/${patientId}/appointments?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return url;
      },
      providesTags: (_result, _error, arg) => [
        { type: 'PatientAppointments', id: arg.patientId },
      ],
    }),
    
    // Get appointments by doctor
    getAppointmentsByDoctor: builder.query<
      { data: Appointment[], pagination: any }, 
      { doctorId: number, page?: number, limit?: number, status?: string }
    >({
      query: ({ doctorId, page = 1, limit = 10, status }) => {
        let url = `/doctors/${doctorId}/appointments?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return url;
      },
      providesTags: (_result, _error, arg) => [
        { type: 'DoctorAppointments', id: arg.doctorId },
      ],
    }),

    // Get available doctors
    getAvailableDoctors: builder.query<Doctor[], { specialization?: string }>({
      query: ({ specialization }) => 
        specialization 
          ? `/doctors/search?specialization=${specialization}`
          : `/doctors`,
    }),

    // In appointmentApi.ts
  getDefaultDepartmentForDoctor: builder.query<number, number>({
  query: (doctorId) => `/doctors/${doctorId}/department`,
  transformResponse: (response: { success: boolean; departmentId: number }) => {
    if (!response.success) {
      throw new Error('Could not retrieve department');
    }
    return response.departmentId;
  },
  }),
  }),
});