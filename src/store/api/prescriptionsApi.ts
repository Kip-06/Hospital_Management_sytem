// src/services/prescriptionApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define types based on PrescriptionsPage.tsx
export interface Patient {
  id: string;
  name: string;
  avatar: string;
  bgColor: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  allergies: string[];
}

export interface Medication {
  localeCompare(name: Medication): number;
  id: string;
  name: string;
  strength: string;
  form: 'Tablet' | 'Capsule' | 'Liquid' | 'Injection' | 'Patch' | 'Inhaler' | 'Cream' | 'Drops';
  category: string;
  interactions?: string[];
  contraindications?: string[];
}

export interface Prescription {
  form: string;
  validUntil: any;
  issuedAt: any;
  prescription: Prescription;
  doctor: any;
  id: string;
  patientId: string;
  patient: Patient;
  medication: string;
  dosage: string;
  frequency: string;
  route: 'Oral' | 'Topical' | 'Intravenous' | 'Intramuscular' | 'Subcutaneous' | 'Inhalation' | 'Ophthalmic' | 'Otic';
  duration: string;
  quantity: number;
  refills: number;
  refillsUsed: number;
  instructions: string;
  dateIssued: string;
  expiryDate: string;
  status: 'Active' | 'Completed' | 'Expired' | 'Cancelled' | 'Pending';
  prescribedBy: string;
  pharmacy?: string;
  notes?: string;
  lastRefillDate?: string;
}

interface CreatePrescriptionRequest {
  patientId: string;
  medicationId: string;
  dosage: string;
  frequency: string;
  route: Prescription['route'];
  duration: string;
  quantity: number;
  refills: number;
  instructions: string;
  pharmacy?: string;
  notes?: string;
}

interface UpdatePrescriptionRequest {
  dosage?: string;
  frequency?: string;
  route?: Prescription['route'];
  duration?: string;
  quantity?: number;
  refills?: number;
  instructions?: string;
  status?: Prescription['status'];
  pharmacy?: string;
  notes?: string;
}

export const prescriptionApi = createApi({
  reducerPath: 'prescriptionApi',
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
  tagTypes: ['Prescription', 'PatientPrescriptions'],
  endpoints: (builder) => ({

    getAllPatients: builder.query<{ data: Patient[]; pagination: any }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 100 }) => `/patients?page=${page}&limit=${limit}`,
    }),
    // Get all prescriptions with pagination and filtering
    getAllPrescriptions: builder.query<
      { data: Prescription[], pagination: any },
      { page?: number; limit?: number; status?: string; search?: string }
    >({
      query: ({ page = 1, limit = 10, status, search }) => {
        let url = `/prescriptions?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return url;
      },
      providesTags: ['Prescription'],
    }),

    // Get prescription by ID
    getPrescriptionById: builder.query<Prescription, string>({
      query: (id) => `/prescriptions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Prescription', id }],
    }),

    // Create new prescription
    createPrescription: builder.mutation<Prescription, CreatePrescriptionRequest>({
      query: (prescription) => ({
        url: '/prescriptions',
        method: 'POST',
        body: prescription,
      }),
      invalidatesTags: ['Prescription', 'PatientPrescriptions'],
    }),

    // Update prescription
    updatePrescription: builder.mutation<
      Prescription,
      { id: string; prescription: Partial<UpdatePrescriptionRequest> }
    >({
      query: ({ id, prescription }) => ({
        url: `/prescriptions/${id}`,
        method: 'PUT',
        body: prescription,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Prescription', id },
        'PatientPrescriptions',
      ],
    }),

    // Delete prescription
    deletePrescription: builder.mutation<void, string>({
      query: (id) => ({
        url: `/prescriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Prescription', 'PatientPrescriptions'],
    }),

    // Get prescriptions by patient
    getPrescriptionsByPatient: builder.query({
      query: ({ patientId, page = 1, limit = 10, status }) => {
        let url = `/prescriptions?patientId=${patientId}&page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return url;
      },
      providesTags: (_result, _error, arg) => [
        { type: 'PatientPrescriptions', id: arg.patientId },
      ],
    }),

    // Renew prescription
    renewPrescription: builder.mutation<Prescription, { id: string; refills?: number }>({
      query: ({ id, refills }) => ({
        url: `/prescriptions/${id}/renew`,
        method: 'POST',
        body: refills ? { refills } : undefined,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Prescription', id },
        'PatientPrescriptions',
      ],
    }),

    // Get available medications
    getMedications: builder.query<
      Medication[],
      { search?: string; category?: string }
    >({
      query: ({ search, category }) => {
        let url = '/medications';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (params.toString()) url += `?${params.toString()}`;
        return url;
      },
    }),

    // Check medication allergies for a patient
    checkMedicationAllergies: builder.query<
      { hasAllergies: boolean; details: string[] },
      { patientId: string; medicationId: string }
    >({
      query: ({ patientId, medicationId }) =>
        `/patients/${patientId}/allergies/check?medicationId=${medicationId}`,
    }),
  }),
});
