import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  CreditCard, 
  Receipt, 
  DollarSign, 
  Download, 
  BadgePercent, 
  Building, 
  FileText, 
  Building2 
} from 'lucide-react';

// Sample data - using this instead of API call
const sampleBillingData = {
  currentBalance: 375.50,
  pendingBills: [
    { 
      id: "INV-001", 
      date: "2023-10-15", 
      description: "General Consultation", 
      amount: 150.00, 
      dueDate: "2023-11-15", 
      status: "pending"
    },
    { 
      id: "INV-002", 
      date: "2023-10-20", 
      description: "Blood Test", 
      amount: 225.50, 
      dueDate: "2023-11-20", 
      status: "pending"
    }
  ],
  paymentHistory: [
    { 
      id: "PMT-001", 
      date: "2023-09-05", 
      description: "X-Ray Examination", 
      amount: 320.00, 
      method: "Credit Card"
    },
    { 
      id: "PMT-002", 
      date: "2023-08-12", 
      description: "Annual Check-up", 
      amount: 200.00, 
      method: "Bank Transfer"
    }
  ],
  insuranceInfo: {
    provider: "HealthShield Insurance",
    policyNumber: "HS-12345678",
    coverageType: "Family",
    coveragePercentage: 80,
    deductible: 500.00,
    deductibleMet: 350.00
  }
};

const BillingPage: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user) || {};
  const patientId = user.id;

  const [billingData, setBillingData] = useState<any>(sampleBillingData); // Use sample data
  const [openPaymentDialog, setOpenPaymentDialog] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('creditCard');

  // Simulate payment processing (since we're not using the API)
  const handlePayNow = (bill: any) => {
    setSelectedBill(bill);
    setOpenPaymentDialog(true);
  };

  const handlePaymentSubmit = () => {
    if (!selectedBill || !patientId) return;
    try {
      // Simulate successful payment
      const updatedBillingData = { ...billingData };
      const billIndex = updatedBillingData.pendingBills.findIndex((bill: any) => bill.id === selectedBill.id);

      if (billIndex !== -1) {
        const paidBill = updatedBillingData.pendingBills.splice(billIndex, 1)[0];
        updatedBillingData.currentBalance -= paidBill.amount;

        // Add to payment history
        updatedBillingData.paymentHistory.unshift({
          id: `PMT-${Math.floor(Math.random() * 1000)}`,
          date: new Date().toISOString().split('T')[0],
          description: paidBill.description,
          amount: paidBill.amount,
          method: paymentMethod === 'creditCard' ? 'Credit Card' : 'Bank Transfer'
        });

        setBillingData(updatedBillingData);
      }

      setOpenPaymentDialog(false);
      alert('Payment processed successfully!');
    } catch (err) {
      console.error('Payment processing failed:', err);
      alert('Failed to process payment. Please try again.');
    }
  };

  const handleDownloadReceipt = (paymentId: string) => {
    console.log('Download receipt for payment:', paymentId);
    // Placeholder for receipt download
  };

  if (!patientId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Warning:</strong> Please log in to view your billing information.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Billing & Payments</h1>

      {/* Billing Summary */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <DollarSign className="text-blue-600 h-10 w-10 mr-4" />
            <div>
              <h2 className="text-lg font-medium text-gray-700">Current Balance</h2>
              <p className={`text-3xl font-bold ${billingData.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${billingData.currentBalance.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Receipt className="text-blue-600 h-10 w-10 mr-4" />
            <div>
              <h2 className="text-lg font-medium text-gray-700">Pending Bills</h2>
              <p className="text-3xl font-bold">
                {billingData.pendingBills.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <h2 className="text-2xl font-bold mt-10 mb-4">Insurance Information</h2>
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Provider</p>
            <div className="flex items-center">
              <Building2 className="h-4 w-4 text-gray-500 mr-1" />
              <p className="text-gray-900">{billingData.insuranceInfo.provider}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Policy Number</p>
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-gray-500 mr-1" />
              <p className="text-gray-900">{billingData.insuranceInfo.policyNumber}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Coverage</p>
            <div className="flex items-center">
              <BadgePercent className="h-4 w-4 text-gray-500 mr-1" />
              <p className="text-gray-900">
                {billingData.insuranceInfo.coverageType} ({billingData.insuranceInfo.coveragePercentage}%)
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Deductible</p>
            <p className="text-gray-900 mb-1">
              ${billingData.insuranceInfo.deductibleMet.toFixed(2)} / ${billingData.insuranceInfo.deductible.toFixed(2)}
            </p>
            <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-blue-600 rounded-full"
                style={{ width: `${(billingData.insuranceInfo.deductibleMet / billingData.insuranceInfo.deductible) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Bills */}
      <h2 className="text-2xl font-bold mt-10 mb-4">Pending Bills</h2>
      {billingData.pendingBills.length > 0 ? (
        <div className="bg-white rounded-lg shadow mb-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billingData.pendingBills.map((bill: any) => (
                <tr key={bill.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bill.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bill.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bill.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bill.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    ${bill.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${bill.status === 'pending' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                      {bill.status === 'pending' ? 'Pending' : 'Overdue'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button 
                      onClick={() => handlePayNow(bill)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Pay Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="flex justify-center items-center p-6">
            <p className="text-gray-500">
              You have no pending bills. All payments are up to date.
            </p>
          </div>
        </div>
      )}

      {/* Payment History */}
      <h2 className="text-2xl font-bold mt-10 mb-4">Payment History</h2>
      <div className="bg-white rounded-lg shadow mb-8 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receipt
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {billingData.paymentHistory.map((payment: any) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(payment.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  ${payment.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                  <button 
                    onClick={() => handleDownloadReceipt(payment.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Method Dialog */}
      {openPaymentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Make Payment</h3>
              <p className="text-sm text-gray-500 mb-6">
                Please select your payment method to pay invoice {selectedBill?.id} for ${selectedBill?.amount.toFixed(2)}.
              </p>
              
              <div className="mb-4">
                <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="creditCard">Credit Card</option>
                  <option value="bankTransfer">Bank Transfer</option>
                </select>
              </div>
              
              {paymentMethod === 'creditCard' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiry-date"
                        placeholder="MM/YY"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        placeholder="123"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="cardholder-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardholder-name"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </>
              )}
              
              {paymentMethod === 'bankTransfer' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      id="account-number"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="routing-number" className="block text-sm font-medium text-gray-700 mb-2">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      id="routing-number"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="account-holder" className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      id="account-holder"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-gray-50 px-4 py-3 flex justify-end rounded-b-lg">
              <button
                type="button"
                onClick={() => setOpenPaymentDialog(false)}
                className="mr-2 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePaymentSubmit}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;