// src/store/api/departmentApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the shape of a department from the API
export interface Department {
    id?: number;
    name: string;
    description?: string;
    head?: string;
    staffCount: number; // Remove the optional marker (?) if your component expects it to always be a number
    appointmentsPerMonth: number; // Same here
    status?: 'active' | 'inactive';
}

  export interface DepartmentResponse {
    department?: Department;
    headDoctor?: {
      id?: number;
      user_id?: number;
      firstName?: string;
      lastName?: string;
      specialization?: string;
      license_number?: string;
      phone?: string;
      email?: string;
      availability?: string;
    };
  }

// The response shape for paginated queries
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const departmentApi = createApi({
  reducerPath: 'departmentApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8080',
    prepareHeaders: (headers) => {
      // Add auth token if available
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Department'],
  endpoints: (builder) => ({
    // Get all departments (with optional pagination)
    getDepartments: builder.query<Department[], { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 100 }) => `/departments?page=${page}&limit=${limit}`,
      providesTags: ['Department'],
      // Transform response if your API returns paginated data
      transformResponse: (response: PaginatedResponse<Department> | Department[]) => {
        // Handle both array and paginated response formats
        return Array.isArray(response) ? response : response.data;
      },
    }),
    
    // Get department by ID
    getDepartmentById: builder.query<Department, number>({
      query: (id) => `/departments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Department', id }],
    }),
    
    // Create new department
    createDepartment: builder.mutation<Department, Omit<Department, 'id'>>({
      query: (department) => ({
        url: '/departments',
        method: 'POST',
        body: department,
      }),
      invalidatesTags: ['Department'],
    }),
    
    // Update department
    updateDepartment: builder.mutation<Department, { id: number; department: Partial<Department> }>({
      query: ({ id, department }) => ({
        url: `/departments/${id}`,
        method: 'PUT',
        body: department,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Department', id }, 'Department'],
    }),
    
    // Delete department
    deleteDepartment: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Department'],
    }),
    
    // Search departments
    searchDepartments: builder.query<Department[], string>({
      query: (searchTerm) => `/departments/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Department'],
    }),
  }),
});
