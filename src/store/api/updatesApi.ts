// src/store/api/updatesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types for the updates API
export interface Update {
    id: number;
    patientId: number | null;
    patientName: string | null;
    doctorId: number | null;
    doctorName: string | null;
    departmentId: number | null;
    departmentName: string | null;
    updateText: string;
    createdAt: string;
    type: string;
    action: string;
    avatarText?: string;
}

export interface UpdatesFilters {
  search?: string;
  departmentId?: number;
  timeFrame?: '24h' | 'week' | 'month' | 'all';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  };
}

// Create the API
export const updatesApi = createApi({
  reducerPath: 'updatesApi',
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
  tagTypes: ['Updates'],
  endpoints: (builder) => ({
    // Get updates with filters and pagination
    getUpdates: builder.query<PaginatedResponse<Update>, UpdatesFilters>({
      query: (filters) => ({
        url: '/updates',
        params: filters,
      }),
      transformResponse: (response: any) => {
        // Transform backend response to match frontend expectations
        const transformedData = response.data.map((update: any) => ({
          id: update.id,
          patientId: update.patientId,
          patientName: update.patientName,
          doctorId: update.doctorId,
          doctorName: update.doctorName,
          departmentId: update.departmentId,
          departmentName: update.departmentName,
          updateText: update.updateText,
          createdAt: update.createdAt,
          type: update.type,
          action: update.action,
          avatarText: update.patientName 
            ? update.patientName.split(' ')
                .map((name: string) => name[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : 'UN',
        }));

        return {
          data: transformedData,
          pagination: response.pagination
        };
      },
      providesTags: ['Updates'],
    }),
    
    // Get a single update by ID
    getUpdateById: builder.query<Update, number>({
      query: (id) => `/updates/${id}`,
      transformResponse: (response: any) => {
        // Transform the single update response
        return {
          ...response,
          avatarText: response.patientName 
            ? response.patientName.split(' ')
                .map((name: string) => name[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : 'UN',
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'Updates', id }],
    }),
    
    // Get all departments for filtering
    getDepartments: builder.query<{ id: number; name: string }[], void>({
      query: () => '/updates/departments', // Match your updated route path
      transformResponse: (response: any) => {
        if (!Array.isArray(response)) {
          console.error('Expected departments response to be an array but got:', response);
          return [];
        }
        return response;
      },
    }),
  }),
});