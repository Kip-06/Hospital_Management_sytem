import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types for analytics data
export interface PatientStat {
  title: string;
  value: string;
  prevValue: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

export interface AppointmentStat {
  title: string;
  value: string;
  prevValue: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

export interface ProcedureType {
  name: string;
  value: number;
  color: string;
}

export interface PatientDemographic {
  ageGroup: string;
  male: number;
  female: number;
}

export interface PatientSatisfaction {
  month: string;
  score: number;
}

export interface AppointmentData {
  day: number;
  count: number;
}

export interface KeyInsight {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface AnalyticsSummary {
  patients: {
    count: number;
    change: string;
  };
  appointments: {
    count: number;
    change: string;
  };
  operations: {
    count: number;
    change: string;
  };
}

export interface AnalyticsResponse {
  patientStats: PatientStat[];
  appointmentStats: AppointmentStat[];
  procedureTypes: ProcedureType[];
  patientDemographics: PatientDemographic[];
  patientSatisfaction: PatientSatisfaction[];
  appointmentData: AppointmentData[];
  keyInsights: KeyInsight[];
}

export interface AnalyticsFilters {
  dateRange: 'week' | 'month' | 'quarter' | 'year';
  comparison: 'previous' | 'last-year' | 'avg';
  doctorId?: number;
  departmentId?: number;
}

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
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
  endpoints: (builder) => ({
    // Get analytics data with filters
    getAnalytics: builder.query<AnalyticsResponse, AnalyticsFilters>({
      query: (filters) => ({
        url: '/analytics',
        params: {
          range: filters.dateRange, // Adjust if backend uses a different name
          compare: filters.comparison, // Adjust if backend uses a different name
          doctorId: filters.doctorId,
          departmentId: filters.departmentId,
        },
      }),
      transformErrorResponse: (error) => {
        console.error('Error fetching analytics:', error);
        return error;
      },
    }),
    
    // Export analytics report
    exportAnalyticsReport: builder.mutation<Blob, AnalyticsFilters>({
      query: (filters) => ({
        url: '/analytics/export',
        method: 'POST',
        body: filters,
        responseType: 'blob',
      }),
    }),
    
    // Get detailed patient analytics
    getPatientAnalytics: builder.query<{
      demographics: PatientDemographic[];
      growthTrend: { period: string; count: number }[];
    }, AnalyticsFilters>({
      query: (filters) => ({
        url: '/analytics/patients',
        params: filters,
      }),
    }),
    
    // Get detailed appointment analytics
    getAppointmentAnalytics: builder.query<{
      byDay: AppointmentData[];
      byType: ProcedureType[];
      completionRate: { period: string; rate: number }[];
    }, AnalyticsFilters>({
      query: (filters) => ({
        url: '/analytics/appointments',
        params: filters,
      }),
    }),
    
    // Get satisfaction analytics
    getSatisfactionAnalytics: builder.query<{
      trend: PatientSatisfaction[];
      byCategory: { category: string; score: number }[];
    }, AnalyticsFilters>({
      query: (filters) => ({
        url: '/analytics/satisfaction',
        params: filters,
      }),
    }),

    // Add this to your analyticsApi.ts endpoints
getAnalyticsSummary: builder.query<AnalyticsSummary, { period: string }>({
  query: ({ period }) => `/analytics/summary?period=${period}`,
  transformResponse: (response: any) => {
    console.log("Raw API response:", response);
    
    // Ensure we return the expected shape
    return {
      patients: {
        count: response.patients?.count || 0,
        change: response.patients?.change || "+0%"
      },
      appointments: {
        count: response.appointments?.count || 0,
        change: response.appointments?.change || "+0%"
      },
      operations: {
        count: response.operations?.count || 0,
        change: response.operations?.change || "+0%"
      }
    };
  }
}),
  }),
});
