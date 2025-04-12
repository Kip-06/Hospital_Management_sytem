import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const billingApi = createApi({
  reducerPath: 'billingApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }), // Adjust base URL to your backend
  endpoints: (builder) => ({
    // Fetch all billing data for a patient
    getBillingData: builder.query<any, string>({
      query: (patientId) => `billing/patients/${patientId}`,
    }),
    // Process a payment
    payBill: builder.mutation<any, { patientId: string; billId: string; paymentMethod: string }>({
      query: ({ patientId, billId, paymentMethod }) => ({
        url: `billing/patients/${patientId}/pay`,
        method: 'POST',
        body: { billId, paymentMethod },
      }),
      // Optimistically update the billing data after payment
      async onQueryStarted({ patientId, billId }, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedData } = await queryFulfilled;
          dispatch(
            billingApi.util.updateQueryData('getBillingData', patientId, (draft) => {
              const billIndex = draft.pendingBills.findIndex((bill: any) => bill.id === billId);
              if (billIndex !== -1) {
                const [paidBill] = draft.pendingBills.splice(billIndex, 1);
                draft.currentBalance -= paidBill.amount;
                draft.paymentHistory.unshift({
                  id: updatedData.paymentId || `PMT-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  description: paidBill.description,
                  amount: paidBill.amount,
                  method: paidBill.paymentMethod,
                });
              }
            })
          );
        } catch (error) {
          console.error('Payment failed:', error);
        }
      },
    }),
    // Download receipt (placeholder - assumes a GET endpoint returning a URL or blob)
    downloadReceipt: builder.query<string, { patientId: string; paymentId: string }>({
      query: ({ patientId, paymentId }) => `billing/patients/${patientId}/receipt/${paymentId}`,
    }),
  }),
});