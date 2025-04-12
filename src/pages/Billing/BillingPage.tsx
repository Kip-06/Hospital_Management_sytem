import React, { useState, useEffect } from 'react';

interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  billDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'pending' | 'overdue';
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

const BillingPage: React.FC = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  // For static data demo
  const [bills, setBills] = useState<Bill[]>([
    {
      id: 'BILL-001',
      patientId: 'P001',
      patientName: 'John Doe',
      billDate: '2025-02-15',
      dueDate: '2025-03-15',
      totalAmount: 1250.75,
      paidAmount: 0,
      status: 'pending',
      items: [
        { description: 'Consultation', quantity: 1, unitPrice: 300, total: 300 },
        { description: 'Blood Test', quantity: 2, unitPrice: 150, total: 300 },
        { description: 'X-Ray', quantity: 1, unitPrice: 500, total: 500 },
        { description: 'Medication', quantity: 3, unitPrice: 50.25, total: 150.75 }
      ]
    },
    {
      id: 'BILL-002',
      patientId: 'P002',
      patientName: 'Jane Smith',
      billDate: '2025-02-10',
      dueDate: '2025-03-10',
      totalAmount: 875.50,
      paidAmount: 875.50,
      status: 'paid',
      items: [
        { description: 'Surgery', quantity: 1, unitPrice: 750, total: 750 },
        { description: 'Medication', quantity: 5, unitPrice: 25.10, total: 125.50 }
      ]
    },
    {
      id: 'BILL-003',
      patientId: 'P003',
      patientName: 'Robert Johnson',
      billDate: '2025-01-05',
      dueDate: '2025-02-05',
      totalAmount: 1500,
      paidAmount: 500,
      status: 'overdue',
      items: [
        { description: 'Emergency Care', quantity: 1, unitPrice: 1200, total: 1200 },
        { description: 'Medication', quantity: 6, unitPrice: 50, total: 300 }
      ]
    }
  ]);

  // Uncomment when connecting to Redux
  // const { bills, loading, error } = useSelector((state: RootState) => state.billing);

  // useEffect(() => {
  //   dispatch(fetchBillings());
  // }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value as 'all' | 'paid' | 'pending' | 'overdue');
  };

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedBill(null);
  };

  const handlePayment = (billId: string, amount: number) => {
    // This would be replaced with a Redux action when connected to backend
    setBills(prevBills => 
      prevBills.map(bill => {
        if (bill.id === billId) {
          const newPaidAmount = bill.paidAmount + amount;
          const newStatus = newPaidAmount >= bill.totalAmount 
            ? 'paid' 
            : new Date() > new Date(bill.dueDate) 
              ? 'overdue' 
              : 'pending';
          
          return {
            ...bill,
            paidAmount: newPaidAmount,
            status: newStatus
          };
        }
        return bill;
      })
    );
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bill.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || bill.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeColor = (status: 'paid' | 'pending' | 'overdue') => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const openPaymentModal = () => {
    if (selectedBill) {
      setPaymentAmount(selectedBill.totalAmount - selectedBill.paidAmount);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSubmit = () => {
    if (selectedBill && paymentAmount > 0) {
      handlePayment(selectedBill.id, paymentAmount);
      setShowPaymentModal(false);
      // Update the selected bill view
      setSelectedBill(bills.find(bill => bill.id === selectedBill.id) || null);
    }
  };

  if (viewMode === 'detail' && selectedBill) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleBackToList}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Billing List
          </button>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Bill
            </button>
            
            {selectedBill.status !== 'paid' && (
              <button 
                onClick={openPaymentModal}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md text-white flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Process Payment
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Invoice #{selectedBill.id}</h1>
                <p className="text-gray-600">Patient: {selectedBill.patientName} (ID: {selectedBill.patientId})</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(selectedBill.status)} uppercase`}>
                  {selectedBill.status}
                </span>
                <p className="text-gray-600 mt-1">Bill Date: {selectedBill.billDate}</p>
                <p className="text-gray-600">Due Date: {selectedBill.dueDate}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedBill.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-8 border-t pt-4">
              <div className="flex justify-end">
                <div className="w-1/3">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Subtotal:</span>
                    <span>${selectedBill.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Paid Amount:</span>
                    <span>${selectedBill.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-lg font-bold">
                    <span>Balance Due:</span>
                    <span>${(selectedBill.totalAmount - selectedBill.paidAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Process Payment</h2>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Amount Due: ${(selectedBill.totalAmount - selectedBill.paidAmount).toFixed(2)}
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  max={selectedBill.totalAmount - selectedBill.paidAmount}
                  min={0}
                  step={0.01}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Billing Management</h1>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by patient name or ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-4 py-2 border rounded-md w-full md:w-64 pl-10"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className="px-4 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
        
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white flex items-center justify-center md:justify-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Bill
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                    <button onClick={() => handleViewBill(bill)}>
                      {bill.id}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bill.patientName}
                    <div className="text-xs text-gray-500">ID: {bill.patientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bill.billDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bill.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${bill.totalAmount.toFixed(2)}
                    {bill.paidAmount > 0 && bill.paidAmount < bill.totalAmount && (
                      <div className="text-xs text-gray-500">Paid: ${bill.paidAmount.toFixed(2)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(bill.status)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewBill(bill)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    {bill.status !== 'paid' && (
                      <button
                        onClick={() => {
                          setSelectedBill(bill);
                          openPaymentModal();
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No billing records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;