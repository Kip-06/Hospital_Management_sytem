// src/store/api/calendarApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify'; // Assuming you use react-toastify for notifications

// Types for the calendar API
export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  departmentId?: number;
  departmentName?: string;
  date: string; // ISO format date
  time: string; // Time in HH:MM format
  endTime?: string; // Optional end time
  type: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  departmentId?: number;
  departmentName?: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface AppointmentFormData {
  patientId?: number;
  patientName: string;
  doctorId: number;
  date: string;
  time: string;
  endTime?: string;
  type: string;
  notes?: string;
  status?: string;
}

export interface CalendarFilters {
  startDate?: string;
  endDate?: string;
  doctorId?: number;
  patientId?: number;
  departmentId?: number;
  status?: string;
  type?: string;
}

export interface Activity {
  id: number;
  title: string;
  type: string;
  date: string;
  description?: string;
  status?: string;
}

export interface DoctorStats {
  appointmentsToday: number;
  appointmentsThisWeek: number;
  totalPatients: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancellationRate: number;
}

export interface AnalyticsSummary {
  totalAppointments: number;
  completedAppointments: number;
  patientSatisfactionRate: number;
  topDepartments: { name: string; count: number }[];
  appointmentsByDay: { day: string; count: number }[];
}

// Custom error handler
const handleError = (error: any, endpoint: string) => {
  console.error(`API Error in ${endpoint}:`, error);
  
  // You can use a notification library to show errors to the user
  if (error.status === 500) {
    toast.error('Backend server error. Please try again later or contact support.');
  } else if (error.status === 401 || error.status === 403) {
    toast.error('Authentication error. Please log in again.');
  } else if (error.status === 404) {
    toast.error('The requested resource was not found.');
  } else {
    toast.error(`Error: ${error.data?.message || 'Unknown error occurred'}`);
  }
  
  return {
    error: {
      status: error.status || 500,
      data: error.data || 'Server error'
    }
  };
};

// Create the API
export const calendarApi = createApi({
  reducerPath: 'calendarApi',
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
  tagTypes: ['Appointments', 'Doctors', 'Departments', 'Activities', 'Stats', 'Analytics'],
  endpoints: (builder) => ({
    // Get appointments with filters
    getAppointments: builder.query<Appointment[], CalendarFilters>({
      query: (filters) => ({
        url: '/appointments',
        params: filters,
      }),
      transformErrorResponse: (error) => handleError(error, 'getAppointments'),
      providesTags: ['Appointments'],
    }),
    
    // Get appointments for month view
    getMonthAppointments: builder.query<Appointment[], { year: number; month: number }>({
      query: ({ year, month }) => `/appointments/month/${year}/${month}`,
      transformErrorResponse: (error) => handleError(error, 'getMonthAppointments'),
      providesTags: ['Appointments'],
    }),
    
    // Get appointments for a specific day
    getDayAppointments: builder.query<Appointment[], { date: string }>({
      query: ({ date }) => `/appointments/day/${date}`,
      transformErrorResponse: (error) => handleError(error, 'getDayAppointments'),
      providesTags: ['Appointments'],
    }),
    
    // Get appointment by ID
    getAppointmentById: builder.query<Appointment, number>({
      query: (id) => `/appointments/${id}`,
      transformErrorResponse: (error) => handleError(error, 'getAppointmentById'),
      providesTags: (_result, _error, id) => [{ type: 'Appointments', id }],
    }),
    
    // Get doctors
    getDoctors: builder.query<Doctor[], void>({
      query: () => '/doctors',
      transformErrorResponse: (error) => handleError(error, 'getDoctors'),
      // If the backend fails, return an empty array to prevent UI errors
      transformResponse: (response: Doctor[]) => {
        if (!Array.isArray(response)) {
          console.error('Expected doctors response to be an array but got:', response);
          return [];
        }
        return response;
      },
      providesTags: ['Doctors'],
    }),
    
    // Get departments
    getDepartments: builder.query<Department[], void>({
      query: () => '/departments',
      transformErrorResponse: (error) => handleError(error, 'getDepartments'),
      // If the backend fails, return an empty array to prevent UI errors
      transformResponse: (response: Department[]) => {
        if (!Array.isArray(response)) {
          console.error('Expected departments response to be an array but got:', response);
          return [];
        }
        return response;
      },
      providesTags: ['Departments'],
    }),
    
    // Create appointment
    createAppointment: builder.mutation<Appointment, AppointmentFormData>({
      query: (appointmentData) => ({
        url: '/appointments',
        method: 'POST',
        body: appointmentData,
      }),
      transformErrorResponse: (error) => handleError(error, 'createAppointment'),
      invalidatesTags: ['Appointments'],
    }),
    
    // Update appointment
    updateAppointment: builder.mutation<Appointment, { id: number; appointmentData: Partial<AppointmentFormData> }>({
      query: ({ id, appointmentData }) => ({
        url: `/appointments/${id}`,
        method: 'PUT',
        body: appointmentData,
      }),
      transformErrorResponse: (error) => handleError(error, 'updateAppointment'),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Appointments', id },
        'Appointments'
      ],
    }),
    
    // Delete appointment
    deleteAppointment: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: 'DELETE',
      }),
      transformErrorResponse: (error) => handleError(error, 'deleteAppointment'),
      invalidatesTags: ['Appointments'],
    }),
    
    // Today's appointments
    getTodayAppointments: builder.query<Appointment[], { userType: string; userId: number }>({
      query: (params) => ({
        url: '/appointments/today',
        params,
      }),
      transformErrorResponse: (error) => handleError(error, 'getTodayAppointments'),
      providesTags: ['Appointments'],
    }),
    
    // Weekly appointments
    getWeeklyAppointments: builder.query<Appointment[], { userType: string; userId: number }>({
      query: (params) => ({
        url: '/appointments/weekly',
        params,
      }),
      transformErrorResponse: (error) => handleError(error, 'getWeeklyAppointments'),
      providesTags: ['Appointments'],
    }),
    
    // Activities
    getActivities: builder.query<Activity[], { limit?: number }>({
      query: (params) => ({
        url: '/activities',
        params,
      }),
      transformErrorResponse: (error) => handleError(error, 'getActivities'),
      providesTags: ['Activities'],
    }),
    
    // Doctor stats
    getDoctorStats: builder.query<DoctorStats, number>({
      query: (doctorId) => `/dashboard/doctor/${doctorId}/stats`,
      transformErrorResponse: (error) => handleError(error, 'getDoctorStats'),
      providesTags: ['Stats'],
    }),
    
    // Analytics summary
    getAnalyticsSummary: builder.query<AnalyticsSummary, { period: 'daily' | 'weekly' | 'monthly' | 'yearly' }>({
      query: (params) => ({
        url: '/analytics/summary',
        params,
      }),
      transformErrorResponse: (error) => handleError(error, 'getAnalyticsSummary'),
      providesTags: ['Analytics'],
    }),
  }),
});
