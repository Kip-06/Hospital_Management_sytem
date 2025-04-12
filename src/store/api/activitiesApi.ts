import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Activity {
    id: number;
    type: string;
    action: string;
    title: string;
    description: string;
    importance: 'low' | 'normal' | 'high' | 'urgent';
    createdAt: string;
    userName: string;
    user?: {
      id: number;
      email: string;
      role: string;
    };
    patient?: {
      id: number;
      firstName: string;
      lastName: string;
    };
    doctor?: {
      id: number;
      firstName: string;
      lastName: string;
    };
    department?: {
      id: number;
      name: string;
    };
  }

export interface PaginatedActivities {
  data: Activity[];
  pagination: {
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  };
}

export const activitiesApi = createApi({
  reducerPath: 'activitiesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/activities',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Activities'],
  endpoints: (builder) => ({
    getActivities: builder.query<PaginatedActivities, {
      page?: number;
      limit?: number;
      type?: string;
      userId?: number;
      importance?: 'low' | 'normal' | 'high' | 'urgent';
    }>({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: ['Activities'],
    }),
    getActivityById: builder.query<Activity, number>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Activities', id }],
    }),
  }),
});