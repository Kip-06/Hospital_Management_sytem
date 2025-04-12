import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface SystemSettings {
  id: number;
  // Account settings
  adminName: string;
  adminEmail: string;
  
  // Notification settings
  emailNotifications: boolean;
  appNotifications: boolean;
  
  // Security settings
  twoFactorAuth: boolean;
  autoLogoutTime: number; // in minutes
  
  // System settings
  maintenanceMode: boolean;
  darkMode: boolean;
  databaseBackupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  
  // Localization settings
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12hour' | '24hour';
  
  // Metadata
  updatedAt: string;
  updatedBy: number;
}

export interface UpdateSystemSettingsRequest {
  // Account settings
  adminName?: string;
  adminEmail?: string;
  
  // Notification settings
  emailNotifications?: boolean;
  appNotifications?: boolean;
  
  // Security settings
  twoFactorAuth?: boolean;
  autoLogoutTime?: number;
  
  // System settings
  maintenanceMode?: boolean;
  darkMode?: boolean;
  databaseBackupFrequency?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  
  // Localization settings
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12hour' | '24hour';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/settings',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Settings'],
  endpoints: (builder) => ({
    // Get system settings
    getSystemSettings: builder.query<SystemSettings, void>({
      query: () => '/',
      providesTags: ['Settings'],
    }),
    
    // Update system settings
    updateSystemSettings: builder.mutation<SystemSettings, UpdateSystemSettingsRequest>({
      query: (settings) => ({
        url: '/',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Change password
    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: '/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),
    
    // Update profile image
    updateProfileImage: builder.mutation<{ success: boolean; imageUrl: string }, FormData>({
      query: (formData) => ({
        url: '/profile-image',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Toggle maintenance mode
    toggleMaintenanceMode: builder.mutation<{ success: boolean; maintenanceMode: boolean }, boolean>({
      query: (enabled) => ({
        url: '/maintenance-mode',
        method: 'POST',
        body: { enabled },
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Get system activity logs
    getSystemLogs: builder.query<{ logs: string[]; total: number }, { level?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/logs',
        params,
      }),
    }),
    
    // Trigger database backup
    triggerDatabaseBackup: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/backup',
        method: 'POST',
      }),
    }),
  }),
});
