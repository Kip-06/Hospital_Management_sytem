// src/pages/doctor/MedicalRecordsPage.tsx
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FileText, 
  Download, 
  Share2, 
  Plus, 
  ChevronDown, 
  Calendar,
  Clipboard,
  Activity,
  MoreHorizontal,
  AlertCircle,
  Tag,
  Paperclip,
  Eye,
  CheckCircle,
  Edit
} from 'lucide-react';

// Import the MedicalRecordForm component
import MedicalRecordForm from './MedicalrecordsForm';
import { 
  medicalRecordsApi, 
  MedicalRecord as ApiMedicalRecord,
  Patient as ApiPatient 
} from '../../../store/api/medicalRecordsApi';

// TypeScript interfaces
interface Patient {
  id: string;
  name: string;
  avatar: string;
  bgColor: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patient: Patient;
  patientName?: string;
  recordType: 'Visit Notes' | 'Lab Results' | 'Diagnosis' | 'Treatment Plan' | 'Prescription' | 'Imaging' | 'Surgery';
  title: string;
  date: string;
  lastUpdated: string;
  tags: string[];
  status: 'Final' | 'Draft' | 'Pending Review';
  hasAttachments: boolean;
  createdBy: string;
  summary?: string;
  diagnosisCode?: string;
  diagnosis?: string;
  symptoms?: string[];
  treatment?: string;
  medications?: string[];
  followUpDate?: string;
  attachments?: string[];
  notes?: string;
}

type SortOption = 'newest' | 'oldest' | 'patient-az' | 'patient-za' | 'record-type';

const MedicalRecordsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRecordType, setSelectedRecordType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [recordToEdit, setRecordToEdit] = useState<MedicalRecord | null>(null);
  


  const { data: recordTypesData } = medicalRecordsApi.useGetRecordTypesQuery();
   
  const [deleteMedicalRecord] = medicalRecordsApi.useDeleteMedicalRecordMutation();
const [createMedicalRecord] = medicalRecordsApi.useCreateMedicalRecordMutation();
const [updateMedicalRecord] = medicalRecordsApi.useUpdateMedicalRecordMutation();
  
  // Mock data for medical records
  const { 
    data: apiMedicalRecords, 
    isLoading, 
    isError 
  } = medicalRecordsApi.useGetMedicalRecordsQuery({
    page: 1,
    limit: 100,
    search: searchTerm || undefined,
    recordType: selectedRecordType === 'all' ? undefined : selectedRecordType
  });

  // Transform API records to component's record type
  const transformRecord = (apiRecord: ApiMedicalRecord): MedicalRecord => {
    if (!apiRecord) {
      console.error('Received undefined apiRecord');
      return generateDefaultRecord(); // Return a default record instead of null
    }
  
    try {
      return {
        id: String(apiRecord.id || ''),
        patientId: String(apiRecord.patientId || ''),
        patient: {
          id: String(apiRecord.patientId || ''),
          name: apiRecord.patient 
            ? `${apiRecord.patient.firstName || ''} ${apiRecord.patient.lastName || ''}`.trim() 
            : 'Unknown Patient',
          avatar: apiRecord.patient 
            ? `${apiRecord.patient.firstName?.[0] || ''}${apiRecord.patient.lastName?.[0] || ''}` 
            : '??',
          bgColor: apiRecord.patient?.bgColor || 'bg-gray-100',
          age: apiRecord.patient?.age || 0,
          gender: apiRecord.patient?.gender || 'Other'
        },
        recordType: apiRecord.recordType || 'Visit Notes',
        title: apiRecord.title || 'Untitled Record',
        date: apiRecord.date || new Date().toISOString(),
        lastUpdated: apiRecord.lastUpdated || new Date().toISOString(),
        tags: apiRecord.tags || [],
        status: apiRecord.status || 'Draft',
        hasAttachments: Boolean(apiRecord.hasAttachments),
        createdBy: apiRecord.createdBy || 'Unknown',
        summary: apiRecord.summary || '',
        diagnosisCode: apiRecord.diagnosisCode || '',
        diagnosis: apiRecord.diagnosis || '',
        symptoms: apiRecord.symptoms || [],
        treatment: apiRecord.treatment || '',
        medications: apiRecord.medications || [],
        followUpDate: apiRecord.followUpDate || '',
        attachments: apiRecord.attachments?.map(a => a.url) || [],
        notes: apiRecord.notes || ''
      };
    } catch (error) {
      console.error('Error transforming medical record:', error);
      return generateDefaultRecord(); // Return a default record in case of error
    }
  };

// Function to generate a default record in case of errors
const generateDefaultRecord = (): MedicalRecord => ({
  id: `error-${Date.now()}`,
  patientId: 'unknown',
  patient: {
    id: 'unknown',
    name: 'Unknown Patient',
    avatar: '??',
    bgColor: 'bg-gray-100',
    age: 0,
    gender: 'Other'
  },
  recordType: 'Visit Notes',
  title: 'Error Loading Record',
  date: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  tags: [],
  status: 'Draft',
  hasAttachments: false,
  createdBy: 'System',
  summary: 'This record could not be loaded correctly.',
  attachments: [],
  symptoms: []
});

  // Transform records and memoize
  // Transform records and memoize
const medicalRecords = useMemo(() => {
  if (!apiMedicalRecords?.data) {
    console.log('No medical records data available');
    return [];
  }
  
  return apiMedicalRecords.data
    .map(record => transformRecord(record))
    .filter(record => record !== null);
}, [apiMedicalRecords]);

interface ApiError {
  status?: number;
  data?: {
    error?: string;
  };
}

const handleRecordSaved = async (newRecord: any): Promise<void> => {
  try {
    if (recordToEdit) {
      // Update existing record
      await updateMedicalRecord({ 
        id: parseInt(recordToEdit.id), 
        record: newRecord 
      }).unwrap();
    } else {
      // Add new record
      await createMedicalRecord(newRecord).unwrap();
    }
    
    setIsFormOpen(false);
    setRecordToEdit(null);
  } catch (error) {
    console.error('Failed to save record', error);
    let errorMessage = 'Failed to save the medical record.';
    
    const apiError = error as ApiError;
    if (apiError.status === 500) {
      errorMessage += ' Server error occurred.';
    }
    
    if (apiError.data?.error) {
      errorMessage += ` Details: ${apiError.data.error}`;
    }
    
    // You could show this error message to the user with a toast or alert
    alert(errorMessage);
  }
};
  // Get unique record types for filter dropdown
const recordTypes = ['all', ...(recordTypesData || [])];

  // Filter and sort records
  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = 
      record.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedRecordType === 'all' || record.recordType === selectedRecordType;
    
    return matchesSearch && matchesType;
  });
  // Add a more explicit flag to track API connectivity
const apiNotConnected = isError || (filteredRecords.length === 0 && apiMedicalRecords === undefined);

// Replace the existing conditional with this
if (apiNotConnected) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <FileText size={64} className="text-gray-300 mb-4" />
      <h3 className="text-xl font-medium text-gray-900">API Connection Issue</h3>
      <p className="text-gray-500 mt-2">
        Cannot retrieve medical records. The API endpoint returned a 404 Not Found error.
      </p>
      <p className="text-gray-500 mt-2">
        Please check that your backend server has implemented:
      </p>
      <ul className="list-disc pl-8 mt-2 text-gray-500">
        <li>GET /medical-records</li>
        <li>GET /medical-records/types</li>
      </ul>
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700">Developer Information:</p>
        <p className="text-xs text-gray-600 mt-1">
          The OPTIONS requests are succeeding (CORS preflight) but the GET requests are returning 404.
          This suggests the routes exist but the GET handlers are not implemented correctly.
        </p>
      </div>
    </div>
  );
}

  // Sort records based on selected sort option
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'patient-az':
        return a.patient.name.localeCompare(b.patient.name);
      case 'patient-za':
        return b.patient.name.localeCompare(a.patient.name);
      case 'record-type':
        return a.recordType.localeCompare(b.recordType);
      default:
        return 0;
    }
  });

  // Get status badge style based on status
  const getStatusBadgeStyle = (status: MedicalRecord['status']): string => {
    switch (status) {
      case 'Final':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Pending Review':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get record type icon based on type
  const getRecordTypeIcon = (type: MedicalRecord['recordType']): JSX.Element => {
    switch (type) {
      case 'Visit Notes':
        return <FileText size={16} />;
      case 'Lab Results':
        return <Clipboard size={16} />;
      case 'Diagnosis':
        return <AlertCircle size={16} />;
      case 'Treatment Plan':
        return <Clipboard size={16} />;
      case 'Prescription':
        return <FileText size={16} />;
      case 'Imaging':
        return <Eye size={16} />;
      case 'Surgery':
        return <Activity size={16} />;
      default:
        return <FileText size={16} />;
    }
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

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
        <button 
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
          onClick={() => {
            setRecordToEdit(null);
            setIsFormOpen(true);
          }}
        >
          <Plus size={18} className="mr-2" />
          New Record
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
              placeholder="Search by patient, title, or tags..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Record Type Filter */}
            <div className="relative inline-block">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedRecordType}
                onChange={(e) => setSelectedRecordType(e.target.value)}
              >
                {recordTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Record Types' : type}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-500" />
              </div>
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
                <option value="record-type">Record Type</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Records list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRecords.map((record) => (
                <tr 
                  key={record.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedRecord(record)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${record.patient.bgColor} flex items-center justify-center mr-3`}>
                        <span className="font-medium text-xs">{record.patient.avatar}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.patient.name}</div>
                        <div className="text-xs text-gray-500">
                          {record.patient.age} years • {record.patient.gender}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{record.title}</div>
                    <div className="text-xs text-gray-500">ID: {record.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`p-1 rounded-full ${
                        record.recordType === 'Visit Notes' ? 'bg-blue-50 text-blue-600' :
                        record.recordType === 'Lab Results' ? 'bg-purple-50 text-purple-600' :
                        record.recordType === 'Diagnosis' ? 'bg-red-50 text-red-600' :
                        record.recordType === 'Treatment Plan' ? 'bg-green-50 text-green-600' :
                        record.recordType === 'Prescription' ? 'bg-amber-50 text-amber-600' :
                        record.recordType === 'Imaging' ? 'bg-sky-50 text-sky-600' :
                        'bg-gray-50 text-gray-600'
                      } mr-2`}>
                        {getRecordTypeIcon(record.recordType)}
                      </span>
                      <span className="text-sm text-gray-900">{record.recordType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(record.date)}</div>
                    <div className="text-xs text-gray-500">Updated: {formatDate(record.lastUpdated)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {record.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {record.hasAttachments && (
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          title="Has attachments"
                        >
                          <Paperclip size={10} className="mr-1" />
                          attachment
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-blue-600 hover:text-blue-900" 
                        title="View Record"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(record);
                        }}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="p-1 text-gray-600 hover:text-gray-900" 
                        title="Download Record"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        className="p-1 text-gray-600 hover:text-gray-900" 
                        title="Share Record"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Share2 size={18} />
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
        
        {/* If no records found */}
        {sortedRecords.length === 0 && (
          <div className="text-center py-10">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No records found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
      
      {/* Record detail panel (would be a modal or slide-in panel in a real implementation) */}
      {selectedRecord && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedRecord.title}</h2>
              <p className="text-gray-500 mt-1">Record ID: {selectedRecord.id}</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                <Download size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                <Share2 size={20} />
              </button>
              <button 
                className="p-2 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-50"
                onClick={() => {
                  setRecordToEdit(selectedRecord);
                  setIsFormOpen(true);
                  setSelectedRecord(null);
                }}
              >
                <Edit size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Patient Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className={`w-10 h-10 rounded-full ${selectedRecord.patient.bgColor} flex items-center justify-center mr-3`}>
                    <span className="font-medium text-sm">{selectedRecord.patient.avatar}</span>
                  </div>
                  <div>
                    <div className="text-base font-medium text-gray-900">{selectedRecord.patient.name}</div>
                    <div className="text-sm text-gray-500">
                      {selectedRecord.patient.age} years • {selectedRecord.patient.gender} • ID: {selectedRecord.patient.id}
                    </div>
                  </div>
                </div>
                {/* More patient details would go here in a real implementation */}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Record Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Record Type</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center mt-1">
                      <span className={`p-1 rounded-full ${
                        selectedRecord.recordType === 'Visit Notes' ? 'bg-blue-50 text-blue-600' :
                        selectedRecord.recordType === 'Lab Results' ? 'bg-purple-50 text-purple-600' :
                        selectedRecord.recordType === 'Diagnosis' ? 'bg-red-50 text-red-600' :
                        selectedRecord.recordType === 'Treatment Plan' ? 'bg-green-50 text-green-600' :
                        selectedRecord.recordType === 'Prescription' ? 'bg-amber-50 text-amber-600' :
                        selectedRecord.recordType === 'Imaging' ? 'bg-sky-50 text-sky-600' :
                        'bg-gray-50 text-gray-600'
                      } mr-2`}>
                        {getRecordTypeIcon(selectedRecord.recordType)}
                      </span>
                      {selectedRecord.recordType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date Created</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatDate(selectedRecord.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatDate(selectedRecord.lastUpdated)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-medium mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(selectedRecord.status)}`}>
                        {selectedRecord.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Record Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-900">
                {selectedRecord.summary || 'No summary available for this record.'}
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Tags</h3>
              <button className="text-xs text-blue-600 hover:text-blue-800">+ Add Tag</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedRecord.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                >
                  <Tag size={14} className="mr-1 text-gray-500" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {selectedRecord.hasAttachments && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Attachments</h3>
                <button className="text-xs text-blue-600 hover:text-blue-800">+ Add Attachment</button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-md mr-3">
                      <FileText size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Report.pdf</p>
                      <p className="text-xs text-gray-500">1.2 MB • Uploaded on {formatDate(selectedRecord.lastUpdated)}</p>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700">
                    <Download size={18} />
                  </button>
                </div>
                {/* Additional attachments would go here */}
                {selectedRecord.recordType === 'Imaging' && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white mt-2">
                    <div className="flex items-center">
                      <div className="p-2 bg-sky-50 rounded-md mr-3">
                        <Eye size={18} className="text-sky-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">X-Ray_Image.jpg</p>
                        <p className="text-xs text-gray-500">3.5 MB • Uploaded on {formatDate(selectedRecord.lastUpdated)}</p>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Download size={18} />
                    </button>
                  </div>
                )}
                
                {selectedRecord.recordType === 'Lab Results' && (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white mt-2">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-50 rounded-md mr-3">
                        <Clipboard size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Lab_Results.csv</p>
                        <p className="text-xs text-gray-500">0.8 MB • Uploaded on {formatDate(selectedRecord.lastUpdated)}</p>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Download size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Record History */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Record History</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Calendar size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">Record created</p>
                      <p className="text-xs text-gray-500">{formatDate(selectedRecord.date)}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Created by {selectedRecord.createdBy}</p>
                  </div>
                </div>
                
                {selectedRecord.date !== selectedRecord.lastUpdated && (
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <Edit size={16} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">Record updated</p>
                        <p className="text-xs text-gray-500">{formatDate(selectedRecord.lastUpdated)}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Updated by {selectedRecord.createdBy}</p>
                    </div>
                  </div>
                )}
                
                {selectedRecord.status === 'Final' && (
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">Record finalized</p>
                        <p className="text-xs text-gray-500">{formatDate(selectedRecord.lastUpdated)}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Finalized by {selectedRecord.createdBy}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
              onClick={() => setSelectedRecord(null)}
            >
              Close
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
              onClick={() => {
                setRecordToEdit(selectedRecord);
                setIsFormOpen(true);
                setSelectedRecord(null);
              }}
            >
              Edit Record
            </button>
          </div>
        </div>
      )}
      
      {/* Import and integrate the MedicalRecordForm component */}
      <MedicalRecordForm
  isOpen={isFormOpen}
  onClose={() => {
    setIsFormOpen(false);
    setRecordToEdit(null);
  }}
  onRecordSaved={handleRecordSaved}
  editRecord={recordToEdit ? {
    // Fields from your existing record
    id: recordToEdit.id,
    patientId: recordToEdit.patientId,
    date: recordToEdit.date,
    
    // Add missing required fields with defaults
    patientName: recordToEdit.patient.name,
    diagnosisCode: '', // Default or extract from summary if present
    diagnosis: recordToEdit.recordType, // Using recordType as default diagnosis
    symptoms: recordToEdit.tags || [], // Using tags as symptoms
    treatment: recordToEdit.summary || '', // Using summary as treatment
    medications: [], // Default empty array
    vitalSigns: {}, // Default empty object
    notes: recordToEdit.summary || '', // Using summary as notes
    doctorId: "D001", // Same as passed prop
    doctorName: "Dr. Sarah Johnson" // Same as passed prop
  } : undefined}
  doctorId="D001"
  doctorName="Dr. Sarah Johnson"
/>
    </div>
  );
};

export default MedicalRecordsPage;