import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Pill, Calendar, AlertCircle, CheckCircle, RefreshCw, Clock, Search, X } from 'lucide-react';
import { prescriptionApi } from '../../../store/api/prescriptionsApi';

interface Prescription {
  id: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
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
  lastRefillDate?: string;
}

interface Medication {
  id: string;
  name: string;
  strength: string;
  form: 'Tablet' | 'Capsule' | 'Liquid' | 'Injection' | 'Patch' | 'Inhaler' | 'Cream' | 'Drops';
  category: string;
}

const PatientPrescriptionsPage: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user) || {};
  const patientId = user.id;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [medicationSearch, setMedicationSearch] = useState('');
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>('');

  const [requestForm, setRequestForm] = useState({
    reason: '',
    symptoms: '',
    allergies: '',
    currentMedications: '',
    preferredPharmacy: 'City Pharmacy',
    urgency: 'normal',
    additionalNotes: '',
  });

  const { data: prescriptionsData, isLoading, error, refetch } = 
    prescriptionApi.useGetPrescriptionsByPatientQuery({
      patientId,
      page: 1,
      limit: 20,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }, { skip: !patientId });

  const { data: medicationsData, isLoading: medicationsLoading } = 
    prescriptionApi.useGetMedicationsQuery({ search: medicationSearch }, { skip: !isRequestModalOpen });

  const [renewPrescription] = prescriptionApi.useRenewPrescriptionMutation();
  const [createPrescription] = prescriptionApi.useCreatePrescriptionMutation();

  // Log detailed data for debugging
  console.log('Prescriptions Data:', prescriptionsData);
  if (prescriptionsData?.data) {
    prescriptionsData.data.forEach((prescription: Prescription, index: number) => {
      console.log(`Prescription ${index}:`, prescription);
    });
  }

  // Filter prescriptions, only including those with required fields
  const filteredPrescriptions = error || !prescriptionsData?.data
    ? []
    : prescriptionsData.data.filter((prescription: Prescription) => {
        // Require medication, prescribedBy, and status to consider it a valid prescription
        if (!prescription.medication || !prescription.prescribedBy || !prescription.status) {
          return false;
        }
        const medication = prescription.medication;
        const prescribedBy = prescription.prescribedBy;
        const matchesSearch = 
          medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prescribedBy.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });

  const handleRequestRefill = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsRefillModalOpen(true);
  };

  const submitRefillRequest = async (pharmacy: string) => {
    if (!selectedPrescription) return;
    try {
      await renewPrescription({ id: selectedPrescription.id }).unwrap();
      setIsRefillModalOpen(false);
      refetch();
      alert('Refill request submitted successfully!');
    } catch (err) {
      console.error('Failed to request refill:', err);
      alert('Failed to submit refill request. Please try again.');
    }
  };

  const handleRequestFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRequestForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicationSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMedicationSearch(e.target.value);
  };

  const submitPrescriptionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !selectedMedicationId) {
      alert('Please log in and select a medication.');
      return;
    }

    const prescriptionRequest = {
      patientId,
      medicationId: selectedMedicationId,
      dosage: 'To be determined by provider',
      frequency: 'To be determined by provider',
      route: 'Oral' as const,
      duration: 'To be determined by provider',
      quantity: 30,
      refills: 0,
      instructions: `${requestForm.reason}\nSymptoms: ${requestForm.symptoms}\nAllergies: ${requestForm.allergies}\nCurrent Medications: ${requestForm.currentMedications}\nUrgency: ${requestForm.urgency}\nNotes: ${requestForm.additionalNotes}`,
      pharmacy: requestForm.preferredPharmacy,
    };

    try {
      await createPrescription(prescriptionRequest).unwrap();
      setRequestForm({
        reason: '',
        symptoms: '',
        allergies: '',
        currentMedications: '',
        preferredPharmacy: 'City Pharmacy',
        urgency: 'normal',
        additionalNotes: '',
      });
      setMedicationSearch('');
      setSelectedMedicationId('');
      setIsRequestModalOpen(false);
      refetch();
      alert('Prescription request submitted successfully!');
    } catch (err) {
      console.error('Failed to submit prescription request:', err);
      alert('Failed to submit prescription request. Please try again.');
    }
  };

  const renderStatusBadge = (status: string | undefined) => {
    if (!status) {
      return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><AlertCircle size={12} className="mr-1" />Unknown</span>;
    }

    switch (status.toLowerCase()) {
      case 'active': return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" />Active</span>;
      case 'expired': return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle size={12} className="mr-1" />Expired</span>;
      case 'pending': return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12} className="mr-1" />Pending</span>;
      case 'completed':
      case 'cancelled': return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><X size={12} className="mr-1" />{status}</span>;
      default: return <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><AlertCircle size={12} className="mr-1" />{status}</span>;
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><RefreshCw className="animate-spin" size={24} /></div>;

  if (error) {
    console.error('API Error Details:', error);
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> Unable to connect to the server. Please check your network or try again later.
        </div>
      </div>
    );
  }

  if (!patientId) return (
    <div className="p-6">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <strong>Warning:</strong> Please log in to view your prescriptions.
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 flex items-center" onClick={() => setIsRequestModalOpen(true)}>
          <Pill size={16} className="mr-2" />Request New Prescription
        </button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search prescriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="block p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredPrescriptions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              {prescriptionsData?.data.length === 0 
                ? "No current prescriptions available." 
                : "No valid prescriptions match your search or filter."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredPrescriptions.map((prescription: Prescription) => (
              <li key={prescription.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-2 md:mb-0">
                    <div className="flex items-center mb-1">
                      <h3 className="text-lg font-medium text-gray-900 mr-2">{prescription.medication}</h3>
                      {renderStatusBadge(prescription.status)}
                    </div>
                    <p className="text-sm text-gray-500">{prescription.dosage} - {prescription.frequency}</p>
                    <p className="text-sm text-gray-500">Prescribed by: {prescription.prescribedBy}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      <span>
                        Issued: {new Date(prescription.dateIssued).toLocaleDateString()}
                        {prescription.expiryDate && ` • Expires: ${new Date(prescription.expiryDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setSelectedPrescription(prescription)} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      View Details
                    </button>
                    {prescription.status === 'Active' && (prescription.refills - prescription.refillsUsed) > 0 && (
                      <button onClick={() => handleRequestRefill(prescription)} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center">
                        <RefreshCw size={14} className="mr-1" />Request Refill ({prescription.refills - prescription.refillsUsed} left)
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Prescription Details</h2>
              <button onClick={() => setSelectedPrescription(null)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">{selectedPrescription.medication}</h3>
                {renderStatusBadge(selectedPrescription.status)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm font-medium text-gray-500">Dosage</p><p className="text-md text-gray-900">{selectedPrescription.dosage || 'N/A'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Frequency</p><p className="text-md text-gray-900">{selectedPrescription.frequency || 'N/A'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Date Issued</p><p className="text-md text-gray-900">{new Date(selectedPrescription.dateIssued).toLocaleDateString()}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Expiry Date</p><p className="text-md text-gray-900">{selectedPrescription.expiryDate ? new Date(selectedPrescription.expiryDate).toLocaleDateString() : 'N/A'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Prescribed By</p><p className="text-md text-gray-900">{selectedPrescription.prescribedBy}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Pharmacy</p><p className="text-md text-gray-900">{selectedPrescription.pharmacy || 'Not specified'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Last Refill</p><p className="text-md text-gray-900">{selectedPrescription.lastRefillDate ? new Date(selectedPrescription.lastRefillDate).toLocaleDateString() : 'N/A'}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Refills Remaining</p><p className="text-md text-gray-900">{selectedPrescription.refills - selectedPrescription.refillsUsed}</p></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Instructions</p>
                <p className="text-md text-gray-900 p-3 bg-gray-50 rounded mt-1">{selectedPrescription.instructions || 'No instructions provided'}</p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setSelectedPrescription(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Close</button>
                {selectedPrescription.status === 'Active' && (selectedPrescription.refills - selectedPrescription.refillsUsed) > 0 && (
                  <button onClick={() => handleRequestRefill(selectedPrescription)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                    <RefreshCw size={16} className="mr-2" />Request Refill
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refill Request Modal */}
      {isRefillModalOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Request Medication Refill</h2>
              <button onClick={() => setIsRefillModalOpen(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-medium">{selectedPrescription.medication} - {selectedPrescription.dosage || 'N/A'}</p>
                <p className="text-sm text-gray-600">Prescribed by {selectedPrescription.prescribedBy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedPrescription.pharmacy || 'City Pharmacy'}
                  onChange={(e) => submitRefillRequest(e.target.value)}
                >
                  <option value="City Pharmacy">City Pharmacy</option>
                  <option value="Health First Pharmacy">Health First Pharmacy</option>
                  <option value="MedPlus Pharmacy">MedPlus Pharmacy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (optional)</label>
                <textarea className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="Any special instructions or requests..."></textarea>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <p className="ml-3 text-sm text-yellow-700">
                    Your request will be sent to your healthcare provider for approval. Allow 1-2 business days for processing.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setIsRefillModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button onClick={() => submitRefillRequest(selectedPrescription.pharmacy || 'City Pharmacy')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Prescription Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Request New Prescription</h2>
              <button onClick={() => setIsRequestModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={submitPrescriptionRequest} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                  <p className="text-sm text-blue-700">Your request will be reviewed by a healthcare provider. They may contact you for additional information.</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="medicationSearch">Medication Name*</label>
                <input
                  id="medicationSearch"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search for a medication..."
                  value={medicationSearch}
                  onChange={handleMedicationSearch}
                />
                {medicationsLoading && <p className="text-sm text-gray-500">Loading medications...</p>}
                {medicationsData && (
                  <ul className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                    {medicationsData.map((med: Medication) => (
                      <li
                        key={med.id}
                        className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedMedicationId === med.id ? 'bg-blue-100' : ''}`}
                        onClick={() => setSelectedMedicationId(med.id)}
                      >
                        {med.name} ({med.strength}, {med.form})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reason">Reason for Medication*</label>
                <input
                  id="reason"
                  name="reason"
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Why do you need this medication?"
                  value={requestForm.reason}
                  onChange={handleRequestFormChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="symptoms">Current Symptoms*</label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  required
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your symptoms"
                  value={requestForm.symptoms}
                  onChange={handleRequestFormChange}
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="allergies">Known Allergies</label>
                  <textarea
                    id="allergies"
                    name="allergies"
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List any allergies to medications"
                    value={requestForm.allergies}
                    onChange={handleRequestFormChange}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="currentMedications">Current Medications</label>
                  <textarea
                    id="currentMedications"
                    name="currentMedications"
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List any other medications you're taking"
                    value={requestForm.currentMedications}
                    onChange={handleRequestFormChange}
                  ></textarea>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="preferredPharmacy">Preferred Pharmacy*</label>
                  <select
                    id="preferredPharmacy"
                    name="preferredPharmacy"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={requestForm.preferredPharmacy}
                    onChange={handleRequestFormChange}
                  >
                    <option value="City Pharmacy">City Pharmacy</option>
                    <option value="Health First Pharmacy">Health First Pharmacy</option>
                    <option value="MedPlus Pharmacy">MedPlus Pharmacy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="urgency">Urgency*</label>
                  <select
                    id="urgency"
                    name="urgency"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={requestForm.urgency}
                    onChange={handleRequestFormChange}
                  >
                    <option value="normal">Normal - Within 48 hours</option>
                    <option value="urgent">Urgent - Within 24 hours</option>
                    <option value="emergency">Emergency - ASAP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="additionalNotes">Additional Notes</label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information that might be helpful"
                  value={requestForm.additionalNotes}
                  onChange={handleRequestFormChange}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsRequestModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptionsPage;