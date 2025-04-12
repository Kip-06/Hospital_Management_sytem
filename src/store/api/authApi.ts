// src/services/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define interfaces for the user and responses
export interface User {
  specialization: string;
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  // Add other user properties as needed
}

export interface AuthResponse {
  token: string;
  role: string;
  user: User;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8080',
    prepareHeaders: (headers) => {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      // If we have a token, add it to the headers
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, { email: string; password: string; role: string }>({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
      // When registration is successful, save token and user info
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', data.role);
          localStorage.setItem('userId', data.user.id.toString());
        } catch (error) {
          // Handle error if needed
        }
      },
      invalidatesTags: ['User'],
    }),
    
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      // When login is successful, save token and user info
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('userId', data.user.id.toString());
        } catch (error) {
          // Handle error if needed
        }
      },
      invalidatesTags: ['User'],
    }),
    
    // Add the getCurrentUser endpoint
    getCurrentUser: builder.query<User, void>({
      query: () => '/users/me', // Typical endpoint for getting current user
      providesTags: ['User'],
      // Add fallback behavior for development/testing
      transformResponse: (response: User) => response,
      // Handle errors or missing endpoint during development
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.warn('Using mock user data as API failed');
        }
      }
    }),
    
    // Add logout endpoint if needed
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      // Clear localStorage on logout
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
        } catch (error) {
          // Handle error if needed
        }
      },
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetCurrentUserQuery } = authApi;