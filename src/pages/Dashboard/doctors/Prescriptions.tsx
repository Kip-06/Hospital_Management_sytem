import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  FileText, 
  Download, 
  Clipboard,
  MoreHorizontal,
  RefreshCw,
  XCircle,
  AlertTriangle,
  Pill,
  Edit
} from 'lucide-react';
import PrescriptionForm from './PrescriptionsForm';
import { prescriptionApi } from '../../../store/api/prescriptionsApi';

// TypeScript interfaces (keep these as they match your API)
interface Patient {
  id: string;
  name: string;
  avatar: string;
  bgColor: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  allergies: string[];
}

interface Medication {
  id: string;
  name: string;
  strength: string;
  form: 'Tablet' | 'Capsule' | 'Liquid' | 'Injection' | 'Patch' | 'Inhaler' | 'Cream' | 'Drops';
  category: string;
  interactions?: string[];
  contraindications?: string[];
}

interface Prescription {
  id: string;
  patientId: string;
  patient: Patient;
  medication: Medication;
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

type FilterOption = 'all' | 'active' | 'expired' | 'completed' | 'cancelled' | 'pending';
type SortOption = 'newest' | 'oldest' | 'patient-az' | 'patient-za' | 'medication-az';

const PrescriptionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showNewPrescriptionForm, setShowNewPrescriptionForm] = useState<boolean>(false);

  const { data, isLoading, error } = prescriptionApi.useGetAllPrescriptionsQuery({
    page: 1,
    limit: 10,
    status: filterStatus === 'all' ? undefined : filterStatus,
    search: searchTerm || undefined,
  });

  const [createPrescription] = prescriptionApi.useCreatePrescriptionMutation();
  const [renewPrescription] = prescriptionApi.useRenewPrescriptionMutation();
  const [updatePrescription] = prescriptionApi.useUpdatePrescriptionMutation();

  console.log('Raw API Response:', data); // Debug log

  const prescriptions = data?.data
    ?.filter(item => item && item.prescription)
    .map(item => {
      const issuedAt = item.prescription.issuedAt
        ? new Date(item.prescription.issuedAt)
        : null;
      const validUntil = item.prescription.validUntil
        ? new Date(item.prescription.validUntil)
        : null;
      const lastRefillDate = item.prescription.lastRefillDate
        ? new Date(item.prescription.lastRefillDate)
        : null;

      const rawAllergies = item.patient?.allergies;
      const allergies = Array.isArray(rawAllergies)
        ? rawAllergies
        : typeof rawAllergies === 'string'
          ? (rawAllergies as string).split(',').map(a => a.trim())
          : [];

      return {
        id: item.prescription.id.toString(),
        patientId: item.patient?.id.toString() || '',
        patient: {
          id: item.patient?.id.toString() || '',
          name: item.patient?.name || 'Unknown',
          avatar: item.patient?.name?.split(' ').map(n => n[0]).join('') || '??',
          bgColor: 'bg-blue-100',
          age: item.patient?.age || 0,
          gender: (item.patient?.gender as 'Male' | 'Female' | 'Other') || 'Other',
          allergies,
        },
        medication: {
          id: item.prescription.id.toString(),
          name: item.prescription.medication || 'Unknown',
          strength: item.prescription.dosage?.split(' ')[1] || '',
          form: (item.prescription.form || 'Tablet') as Medication['form'],
          category: '',
        },
        dosage: item.prescription.dosage || '',
        frequency: item.prescription.frequency || '',
        route: (item.prescription.route as Prescription['route']) || 'Oral',
        duration: item.prescription.duration || '',
        quantity: item.prescription.quantity || 1,
        refills: item.prescription.refills || 0,
        refillsUsed: item.prescription.refillsUsed || 0,
        instructions: item.prescription.instructions || '',
        dateIssued: issuedAt ? issuedAt.toISOString().split('T')[0] : '',
        expiryDate: validUntil ? validUntil.toISOString().split('T')[0] : '',
        status: (item.prescription.status.charAt(0).toUpperCase() + item.prescription.status.slice(1)) as Prescription['status'],
        prescribedBy: `${item.doctor?.firstName || ''} ${item.doctor?.lastName || ''}`.trim() || 'Unknown',
        pharmacy: item.prescription.pharmacy,
        notes: item.prescription.notes,
        lastRefillDate: lastRefillDate ? lastRefillDate.toISOString().split('T')[0] : '',
      };
    }) || [];

  if (isLoading) return <div>Loading prescriptions...</div>;
  if (error) {
    console.error('API Error:', error);
    return <div>Error loading prescriptions: {JSON.stringify(error)}</div>;
  }

  // Client-side sorting (if backend doesn't handle all sorting options)
  const sortedPrescriptions = [...prescriptions].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime();
      case 'oldest':
        return new Date(a.dateIssued).getTime() - new Date(b.dateIssued).getTime();
      case 'patient-az':
        return a.patient.name.localeCompare(b.patient.name);
      case 'patient-za':
        return b.patient.name.localeCompare(a.patient.name);
      case 'medication-az':
        return a.medication.name.localeCompare(b.medication.name);
      default:
        return 0;
    }
  });

  // Get status badge style based on status
  const getStatusBadgeStyle = (status: Prescription['status']): string => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Determine if prescription is near expiry (within 7 days)
  const isNearExpiry = (expiryDate: string): boolean => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Handle save from prescription form
  const handleSavePrescription = async (prescriptionData: any) => {
    try {
      await createPrescription(prescriptionData).unwrap();
      setShowNewPrescriptionForm(false);
    } catch (err) {
      console.error('Failed to save prescription:', err);
    }
  };

  // Handle renew prescription
  const handleRenewPrescription = async (id: string) => {
    try {
      await renewPrescription({ id }).unwrap();
    } catch (err) {
      console.error('Failed to renew prescription:', err);
    }
  };

  // Handle cancel from prescription form
  const handleCancelPrescription = () => {
    setShowNewPrescriptionForm(false);
  };

  // Get medication form icon
  const getMedicationFormIcon = (form: Medication['form']): JSX.Element => {
    return <Pill size={16} />; // Simplified for now; expand as needed
  };

  // Check for medication allergies
  const hasAllergyWarning = (prescription: Prescription): boolean => {
    return prescription.patient.allergies.some(allergy =>
      prescription.medication.name.toLowerCase().includes(allergy.toLowerCase())
    );
  };

  // Render loading or error states
  if (isLoading) {
    return <div>Loading prescriptions...</div>;
  }

  if (error) {
    return <div>Error loading prescriptions: {JSON.stringify(error)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        <button 
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
          onClick={() => setShowNewPrescriptionForm(true)}
        >
          <Plus size={18} className="mr-2" />
          New Prescription
        </button>
      </div>
      
      {/* Search and filter section */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by patient, medication, or prescription ID..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button 
                className={`px-3 py-2 text-sm ${filterStatus === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button 
                className={`px-3 py-2 text-sm ${filterStatus === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => setFilterStatus('active')}
              >
                Active
              </button>
              <button 
                className={`px-3 py-2 text-sm ${filterStatus === 'expired' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                onClick={() => setFilterStatus('expired')}
              >
                Expired
              </button>
            </div>
            
            {/* Sort By */}
            <div className="relative inline-block">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="patient-az">Patient (A-Z)</option>
                <option value="patient-za">Patient (Z-A)</option>
                <option value="medication-az">Medication (A-Z)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Prescriptions list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage & Route</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refills</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPrescriptions.map((prescription) => (
                <tr 
                  key={prescription.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${prescription.patient.bgColor} flex items-center justify-center mr-3`}>
                        <span className="font-medium text-xs">{prescription.patient.avatar}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{prescription.patient.name}</div>
                        <div className="text-xs text-gray-500">{prescription.patient.age} years • {prescription.patient.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="p-1 rounded-full bg-blue-50 text-blue-600 mr-2">
                        {getMedicationFormIcon(prescription.medication.form)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{String(prescription.medication.name)}</div>
                        <div className="text-xs text-gray-500">{prescription.medication.strength} • {prescription.medication.form}</div>
                      </div>
                      {hasAllergyWarning(prescription) && (
                        <div className="ml-2 text-red-500" title="Patient has an allergy to this medication or class">
                          <AlertTriangle size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{prescription.dosage}</div>
                    <div className="text-xs text-gray-500">{prescription.frequency} • {prescription.route}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(prescription.dateIssued)}</div>
                    <div className="text-xs text-gray-500">
                      Expires: {formatDate(prescription.expiryDate)}
                      {isNearExpiry(prescription.expiryDate) && (
                        <span className="ml-1 text-amber-500" title="Near expiry">
                          <AlertTriangle size={12} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{prescription.refillsUsed} of {prescription.refills} used</div>
                    {prescription.lastRefillDate && (
                      <div className="text-xs text-gray-500">Last refill: {formatDate(prescription.lastRefillDate)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(prescription.status)}`}>
                      {prescription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {prescription.status === 'Active' && (
                        <button 
                          className="p-1 text-blue-600 hover:text-blue-900" 
                          title="Renew Prescription"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenewPrescription(prescription.id);
                          }}
                        >
                          <RefreshCw size={18} />
                        </button>
                      )}
                      <button 
                        className="p-1 text-gray-600 hover:text-gray-900" 
                        title="Print Prescription"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText size={18} />
                      </button>
                      <button 
                        className="p-1 text-gray-600 hover:text-gray-900" 
                        title="Download Prescription"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-700" 
                        title="More Options"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* If no prescriptions found */}
        {sortedPrescriptions.length === 0 && (
          <div className="text-center py-10">
            <Clipboard size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No prescriptions found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
      
      {/* Prescription detail panel */}
      {selectedPrescription && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Prescription: {selectedPrescription.medication.name}</h2>
              <p className="text-gray-500 mt-1">Prescription ID: {selectedPrescription.id}</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                <FileText size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                <Download size={20} />
              </button>
              <button className="p-2 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-50">
                <Edit size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Patient Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Patient Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className={`w-10 h-10 rounded-full ${selectedPrescription.patient.bgColor} flex items-center justify-center mr-3`}>
                    <span className="font-medium text-sm">{selectedPrescription.patient.avatar}</span>
                  </div>
                  <div>
                    <div className="text-base font-medium text-gray-900">{selectedPrescription.patient.name}</div>
                    <div className="text-sm text-gray-500">{selectedPrescription.patient.age} years • {selectedPrescription.patient.gender} • ID: {selectedPrescription.patient.id}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">Allergies</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPrescription.patient.allergies.length > 0 ? (
                      selectedPrescription.patient.allergies.map((allergy, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                          {allergy}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-600">No known allergies</span>
                    )}
                  </div>
                </div>
                {hasAllergyWarning(selectedPrescription) && (
                  <div className="mt-2 flex items-center p-2 bg-red-50 text-red-800 rounded-md">
                    <AlertTriangle size={16} className="mr-2" />
                    <span className="text-xs font-medium">Allergy warning: Patient has an allergy to this medication or class</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Prescription Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Prescription Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Date Issued</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(selectedPrescription.dateIssued)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expiry Date</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center">
                      {formatDate(selectedPrescription.expiryDate)}
                      {isNearExpiry(selectedPrescription.expiryDate) && (
                        <span className="ml-1 text-amber-500" title="Near expiry">
                          <AlertTriangle size={12} />
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-medium mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(selectedPrescription.status)}`}>
                        {selectedPrescription.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Prescribed By</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedPrescription.prescribedBy}</p>
                  </div>
                  {selectedPrescription.pharmacy && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Pharmacy</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{selectedPrescription.pharmacy}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Medication Details */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Medication Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-50 rounded-md text-blue-600 mr-3">
                  {getMedicationFormIcon(selectedPrescription.medication.form)}
                </div>
                <div>
                  <div className="text-lg font-medium text-gray-900">{selectedPrescription.medication.name} {selectedPrescription.medication.strength}</div>
                  <div className="text-sm text-gray-500">{selectedPrescription.medication.form} • {selectedPrescription.medication.category}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Dosage</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedPrescription.dosage}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Frequency</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedPrescription.frequency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Route</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedPrescription.route}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedPrescription.duration}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Quantity</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedPrescription.quantity} {selectedPrescription.medication.form.toLowerCase()}(s)</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Refills</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedPrescription.refillsUsed} of {selectedPrescription.refills} used
                    {selectedPrescription.lastRefillDate && (
                      <span className="text-xs text-gray-500 block">Last refill: {formatDate(selectedPrescription.lastRefillDate)}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-1">Instructions</p>
                <div className="p-3 bg-white rounded border border-gray-200">
                  <p className="text-sm text-gray-900">{selectedPrescription.instructions}</p>
                </div>
              </div>
              {selectedPrescription.notes && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <div className="p-3 bg-white rounded border border-gray-200">
                    <p className="text-sm text-gray-900">{selectedPrescription.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
              onClick={() => setSelectedPrescription(null)}
            >
              Close
            </button>
            {selectedPrescription.status === 'Active' && (
              <>
                <button 
                  className="px-4 py-2 border border-blue-300 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center"
                  onClick={() => handleRenewPrescription(selectedPrescription.id)}
                >
                  <RefreshCw size={18} className="mr-2" />
                  Renew
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                  // Add edit logic here with updatePrescription
                >
                  Edit Prescription
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* New Prescription Form */}
      {showNewPrescriptionForm && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">New Prescription</h2>
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              onClick={() => setShowNewPrescriptionForm(false)}
            >
              <XCircle size={20} />
            </button>
          </div>
          <PrescriptionForm 
            isOpen={showNewPrescriptionForm}
            onClose={() => setShowNewPrescriptionForm(false)}
            onSave={handleSavePrescription}
            onCancel={handleCancelPrescription}
          />
        </div>
      )}
    </div>
  );
};

export default PrescriptionsPage;
