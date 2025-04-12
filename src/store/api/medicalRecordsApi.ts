// src/services/medicalRecordsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  avatar?: string;
  bgColor?: string;
}

export interface MedicalRecord {
  id: number;
  patientId: number;
  patient?: Patient;
  recordType: 'Visit Notes' | 'Lab Results' | 'Diagnosis' | 'Treatment Plan' | 'Prescription' | 'Imaging' | 'Surgery';
  title: string;
  date: string;
  lastUpdated: string;
  tags: string[];
  status: 'Final' | 'Draft' | 'Pending Review';
  hasAttachments: boolean;
  createdBy: string;
  createdById: number;
  summary?: string;
  diagnosisCode?: string;
  diagnosis?: string;
  symptoms?: string[];
  treatment?: string;
  medications?: string[];
  followUpDate?: string;
  attachments?: {
    id: number;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
  }[];
  notes?: string;
}

export interface MedicalRecordFormData {
  patientId: number;
  recordType: string;
  title: string;
  date: string;
  tags: string[];
  status: string;
  summary?: string;
  diagnosisCode?: string;
  diagnosis?: string;
  symptoms?: string[];
  treatment?: string;
  medications?: string[];
  followUpDate?: string;
  notes?: string;
  attachments?: File[];
}

export interface PaginatedMedicalRecords {
  data: MedicalRecord[];
  pagination: {
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  };
}

export const medicalRecordsApi = createApi({
  reducerPath: 'medicalRecordsApi',
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
  tagTypes: ['MedicalRecords', 'Patients'],
  endpoints: (builder) => ({
    // Get all medical records with pagination and filtering
    getMedicalRecords: builder.query<PaginatedMedicalRecords, {
      page?: number;
      limit?: number;
      search?: string;
      recordType?: string;
      patientId?: number;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: '/medical-records',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'MedicalRecords' as const, id })),
              { type: 'MedicalRecords', id: 'LIST' },
            ]
          : [{ type: 'MedicalRecords', id: 'LIST' }],
    }),

    // Get a single medical record by ID
    getMedicalRecordById: builder.query<MedicalRecord, number>({
      query: (id) => `/medical-records/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'MedicalRecords', id }],
    }),

    // Create a new medical record
    createMedicalRecord: builder.mutation<MedicalRecord, MedicalRecordFormData>({
      query: (record) => ({
        url: '/medical-records',
        method: 'POST',
        body: record,
      }),
      invalidatesTags: [{ type: 'MedicalRecords', id: 'LIST' }],
    }),

    // Update an existing medical record
    updateMedicalRecord: builder.mutation<
      MedicalRecord,
      { id: number; record: Partial<MedicalRecordFormData> }
    >({
      query: ({ id, record }) => ({
        url: `/medical-records/${id}`,
        method: 'PUT',
        body: record,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'MedicalRecords', id },
        { type: 'MedicalRecords', id: 'LIST' },
      ],
    }),

    // Delete a medical record
    deleteMedicalRecord: builder.mutation<void, number>({
      query: (id) => ({
        url: `/medical-records/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'MedicalRecords', id },
        { type: 'MedicalRecords', id: 'LIST' },
      ],
    }),

    // Get record types (for dropdown filters)
    // In medicalRecordsApi.ts, update the getRecordTypes endpoint:
getRecordTypes: builder.query<string[], void>({
  query: () => '/medical-records/types',
  transformResponse: (response: any) => {
    // If the API fails, use these default values
    if (!response || !Array.isArray(response)) {
      console.warn('API failed for record types, using defaults');
      return ['Visit Notes', 'Lab Results', 'Diagnosis', 'Treatment Plan', 'Prescription', 'Imaging', 'Surgery'];
    }
    return response;
  },
  // Add error handling
  transformErrorResponse: (error) => {
    console.error('Failed to fetch record types:', error);
    return ['Visit Notes', 'Lab Results', 'Diagnosis', 'Treatment Plan', 'Prescription', 'Imaging', 'Surgery'];
  }
}),

    // Upload attachment for a medical record
    uploadAttachment: builder.mutation<
      { id: number; url: string },
      { recordId: number; file: File }
    >({
      query: ({ recordId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return {
          url: `/medical-records/${recordId}/attachments`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { recordId }) => [
        { type: 'MedicalRecords', id: recordId },
      ],
    }),

    // Get all patients (for dropdown selection)
    getPatients: builder.query<Patient[], { search?: string }>({
      query: (params) => ({
        url: '/patients',
        params,
      }),
      providesTags: ['Patients'],
    }),
  }),
});
