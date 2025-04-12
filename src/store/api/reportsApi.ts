// src/store/api/reportsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define report data types
export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface PatientStatistics {
  period: string;
  newPatients: number;
  returningPatients: number;
  totalVisits: number;
  admissions: number;
  discharges: number;
}

export interface DepartmentPerformance {
  departmentName: string;
  appointmentsCount: number;
  patientsSeen: number;
  utilization: number; // percentage
  averageWaitTime: number; // minutes
}

export interface DoctorPerformance {
  doctorId: number;
  doctorName: string;
  department: string;
  patientsServed: number;
  appointmentsCompleted: number;
  averageRating: number;
}

export interface AppointmentStatistics {
  period: string;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  completionRate: number; // percentage
}

// Main reports interface
export interface Reports {
  revenue?: RevenueData[];
  patientStats?: PatientStatistics[];
  departmentPerformance?: DepartmentPerformance[];
  doctorPerformance?: DoctorPerformance[];
  appointmentStats?: AppointmentStatistics[];
}

// Parameters for filtering reports
export interface ReportParams {
  startDate?: string;
  endDate?: string;
  departmentId?: number;
  doctorId?: number;
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
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
  tagTypes: ['Reports'],
  endpoints: (builder) => ({
    // Export report
exportReport: builder.query<Blob, ReportParams & { format: 'pdf' | 'csv' | 'excel' }>({
    query: (params) => ({
      url: '/reports/export',
      params,
      responseHandler: (response) => response.blob(),
    }),
  }),
    // Financial reports
    getRevenueReport: builder.query<RevenueData[], ReportParams>({
      query: (params) => ({
        url: '/reports/revenue',
        params
      }),
      providesTags: ['Reports'],
    }),
    
    // Patient statistics
    getPatientStatistics: builder.query<PatientStatistics[], ReportParams>({
      query: (params) => ({
        url: '/reports/patients',
        params
      }),
      providesTags: ['Reports'],
    }),
    
    // Department performance
    getDepartmentPerformance: builder.query<DepartmentPerformance[], ReportParams>({
      query: (params) => ({
        url: '/reports/departments',
        params
      }),
      providesTags: ['Reports'],
    }),
    
    // Doctor performance
    getDoctorPerformance: builder.query<DoctorPerformance[], ReportParams>({
      query: (params) => ({
        url: '/reports/doctors',
        params
      }),
      providesTags: ['Reports'],
    }),
    
    // Appointment statistics
    getAppointmentStatistics: builder.query<AppointmentStatistics[], ReportParams>({
      query: (params) => ({
        url: '/reports/appointments',
        params
      }),
      providesTags: ['Reports'],
    }),
    
    // Dashboard summary report (combines key metrics from various reports)
    getDashboardSummary: builder.query<Reports, ReportParams>({
      query: (params) => ({
        url: '/reports/dashboard',
        params
      }),
      providesTags: ['Reports'],
    }),
  }),
});
