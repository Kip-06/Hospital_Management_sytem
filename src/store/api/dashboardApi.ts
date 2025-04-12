// src/store/api/dashboardApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define types for all dashboard data
export interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
}

export interface Activity {
  id: number;
  text: string;
  time: string;
  userId?: number;
  userName?: string;
  type: 'user' | 'system' | 'appointment' | 'alert';
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId?: number;
  doctorName?: string;
  time: string;
  date: string;
  type: string;
  status: 'confirmed' | 'pending' | 'canceled';
  avatarText?: string;
  bgColor?: string;
}

export interface PatientUpdate {
  id: number;
  patientId: number;
  patientName: string;
  time: string;
  update: string;
  avatarText?: string;
  bgColor?: string;
}

export interface ScheduleDay {
  day: string;
  date: string;
  appointments: {
    id: number;
    time: string;
    patientName: string;
    patientId: number;
  }[];
}

export interface PendingApproval {
  id: number;
  name: string;
  department: string;
  status: 'pending';
  role: 'doctor' | 'nurse' | 'admin';
}

export interface SystemStatus {
    name: string;       // The system component being monitored
    title?: string;     // Alternative naming if your API uses 'title' instead of 'name'
    level: number;      // Percentage value (0-100)
    status: 'Excellent' | 'Good' | 'Warning' | 'Critical';
    color: string;      // Color identifier for the UI
    type?: string;      // If your component needs a 'type' property
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

export interface DashboardData {
  stats: StatCard[];
  activities: Activity[];
  todaysAppointments: Appointment[];
  recentUpdates: PatientUpdate[];
  weeklySchedule: ScheduleDay[];
  pendingApprovals: PendingApproval[];
  systemStatus: SystemStatus[];
  analyticsSummary: AnalyticsSummary;
}

// Dashboard API
export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
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
  tagTypes: ['Dashboard', 'AdminDashboard', 'DoctorDashboard', 'PatientDashboard'],
  endpoints: (builder) => ({
    // Admin Dashboard
    getAdminDashboard: builder.query<DashboardData, void>({
      query: () => '/dashboard/admin',
      providesTags: ['AdminDashboard', 'Dashboard'],
    }),
    
    // Doctor Dashboard
    getDoctorDashboard: builder.query<DashboardData, number>({
      query: (doctorId) => `/dashboard/doctor/${doctorId}`,
      providesTags: ['DoctorDashboard', 'Dashboard'],
    }),
    
    // Patient Dashboard
    getPatientDashboard: builder.query<DashboardData, number>({
      query: (patientId) => `/dashboard/patient/${patientId}`,
      providesTags: ['PatientDashboard', 'Dashboard'],
    }),
    
    // Dashboard Stats (for all user types)
    getDashboardStats: builder.query<StatCard[], { userType: 'admin' | 'doctor' | 'patient', userId?: number }>({
      query: ({ userType, userId }) => `/dashboard/${userType}${userId ? `/${userId}` : ''}/stats`,
      providesTags: ['Dashboard'],
    }),
    
    // Recent Activities
    getRecentActivities: builder.query<Activity[], { limit?: number }>({
      query: ({ limit = 5 }) => `/activities?limit=${limit}`,
      providesTags: ['Dashboard'],
    }),
    
    // Today's Appointments
    getTodaysAppointments: builder.query<Appointment[], { userType: 'admin' | 'doctor' | 'patient', userId?: number }>({
        query: ({ userType, userId }) => 
          `/appointments/today?userType=${userType}${userId ? `&userId=${userId}` : ''}`,
        transformResponse: (response: unknown) => {
          const { data } = response as { success: boolean, data: any[] };
          return data.map(appointment => ({
            id: appointment.id,
            patientId: appointment.patientId,
            patientName: appointment.patientName || 'Unknown Patient',
            doctorId: appointment.doctorId,
            doctorName: appointment.doctorName,
            time: new Date(appointment.dateTime).toLocaleTimeString(),
            date: new Date(appointment.dateTime).toLocaleDateString(),
            type: appointment.type,
            status: appointment.status as 'confirmed' | 'pending' | 'canceled',
            avatarText: appointment.avatarText,
            bgColor: appointment.bgColor
          }));
        },
        providesTags: ['Dashboard'],
      }),
    
    // Weekly Schedule
    getWeeklySchedule: builder.query<ScheduleDay[], { userType: 'admin' | 'doctor' | 'patient', userId?: number }>({
      query: ({ userType, userId }) => 
        `/appointments/weekly?userType=${userType}${userId ? `&userId=${userId}` : ''}`,
      providesTags: ['Dashboard'],
    }),
    
    // Pending Approvals (admin only)
    getPendingApprovals: builder.query<PendingApproval[], void>({
      query: () => '/users/pending-approvals',
      providesTags: ['AdminDashboard', 'Dashboard'],
    }),
    
    // System Status (admin only)
    getSystemStatus: builder.query<SystemStatus[], void>({
      query: () => '/system/status',
      providesTags: ['AdminDashboard', 'Dashboard'],
    }),
    
    // Recent Patient Updates (for doctors and admin)
    getPatientUpdates: builder.query<PatientUpdate[], { limit?: number, doctorId?: number }>({
      query: ({ limit = 3, doctorId }) => 
        `/patients/updates?limit=${limit}${doctorId ? `&doctorId=${doctorId}` : ''}`,
      providesTags: ['Dashboard'],
    }),

    // Analytics Summary
    getAnalyticsSummary: builder.query<AnalyticsSummary, { period: 'daily' | 'weekly' | 'monthly' | 'yearly' }>({
      query: ({ period }) => `/analytics/summary?period=${period}`,
      providesTags: ['Dashboard'],
    }),

    // Approve or Reject User
    updateApprovalStatus: builder.mutation<{ success: boolean, message: string }, 
      { userId: number, status: 'approved' | 'rejected' }>({
      query: ({ userId, status }) => ({
        url: `/users/${userId}/approval`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['AdminDashboard', 'Dashboard'],
    }),
  }),
});
