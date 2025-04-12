// src/store/api/usersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ReactNode } from 'react';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  adminUsers: number;
  roleDistribution: Record<string, number>;
}

export interface Activity {
  userName: string;
  type: any;
  createdAt: string | number | Date;
  description: ReactNode;
  user: ReactNode;
  timeAgo: ReactNode;
  id: number;
  userId: number;
  action: string;
  details: string;
  timestamp: string;
}

export interface UserFilter {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
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
  tagTypes: ['User', 'UserStats', 'UserActivity'],
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<User>, UserFilter>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: (result) => 
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    
    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_, __, id) => [{ type: 'User', id }],
    }),
    
    createUser: builder.mutation<{ message: string; user: User }, Partial<User> & { password: string }>({
      query: (user) => ({
        url: '/users',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }, { type: 'UserStats' }],
    }),
    
    updateUser: builder.mutation<{ message: string; user: User }, { id: number; user: Partial<User> }>({
      query: ({ id, user }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
        { type: 'UserStats' }
      ],
    }),
    
    deleteUser: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }, { type: 'UserStats' }],
    }),
    
    updatePassword: builder.mutation<{ message: string }, { id: number; currentPassword: string; newPassword: string }>({
      query: ({ id, ...data }) => ({
        url: `/users/${id}/password`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'User', id }],
    }),
    
    getUserStats: builder.query<UserStats, void>({
      query: () => '/users/stats',
      providesTags: [{ type: 'UserStats' }],
    }),

    getUserActivities: builder.query<Activity[], void>({
        query: () => '/users/activities',
        providesTags: [{ type: 'UserActivity' }],
      }),
  }),
});