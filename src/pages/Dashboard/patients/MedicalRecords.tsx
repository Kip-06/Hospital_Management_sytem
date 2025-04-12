import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { medicalRecordsApi } from '../../../store/api/medicalRecordsApi';

// Define TypeScript interfaces (unchanged)
interface MedicalRecord {
  id: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  symptoms: string[];
  prescriptions: Prescription[];
  notes: string;
  followUpDate?: string;
  attachments?: Attachment[];
  testResults?: TestResult[];
}

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
}

interface TestResult {
  id: string;
  name: string;
  date: string;
  result: string;
  normalRange?: string;
  notes?: string;
}

interface ApiMedicalRecord {
  id: number;
  date: string;
  createdBy: string;
  diagnosis?: string;
  title: string;
  symptoms?: string[];
  medications?: string[];
  notes?: string;
  summary?: string;
  followUpDate?: string;
  recordType?: string;
  attachments?: {
    id: number;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }[];
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
  };
}

interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
}

const PatientMedicalRecords: React.FC = () => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'prescriptions' | 'attachments' | 'testResults'>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');

  // Get patientId and info from Redux auth state
  const user = useSelector((state: any) => state.auth.user) || {};
  const patientId = user.id;

  console.log('User from Redux:', user);
  console.log('Patient ID from Redux:', patientId);

  const {
    data: medicalRecordsData,
    isLoading: isLoadingRecords,
    error: recordsError,
    refetch,
  } = medicalRecordsApi.useGetMedicalRecordsQuery({
    patientId,
    page: 1,
    limit: 20,
    search: searchTerm || undefined,
  }, { skip: !patientId });

  console.log('Query params:', { patientId, page: 1, limit: 20, search: searchTerm || undefined });
  console.log('API response:', medicalRecordsData);

  useEffect(() => {
    if (!patientId) {
      setError('Please log in to view your medical records.');
      setLoading(false);
      return;
    }

    // Set patient info directly from Redux user data
    setPatientInfo({
      id: user.id?.toString() ?? 'unknown',
      name: `${user.firstName || ''} ${user.lastName || ''}`,
      age: user.age ?? 0,
      gender: user.gender ?? 'Unknown',
      bloodType: user.bloodType ?? 'Unknown', // Add if available in user
      allergies: user.allergies ?? [],
      chronicConditions: user.chronicConditions ?? [],
    });

    refetch(); // Force refetch to ensure fresh data
    setLoading(true);

    if (!medicalRecordsData || !medicalRecordsData.data) {
      setLoading(false);
      return;
    }

    const mappedRecords: MedicalRecord[] = medicalRecordsData.data.map((record: ApiMedicalRecord) => {
      const prescriptions: Prescription[] = (record.medications || []).map((med, index) => ({
        id: `presc-${record.id ?? 'unknown'}-${index}`,
        medicationName: med || 'Unknown',
        dosage: 'Not specified',
        frequency: 'Not specified',
        duration: 'Not specified',
        notes: undefined,
      }));

      const attachments: Attachment[] | undefined = record.attachments?.map((att) => ({
        id: att.id?.toString() ?? 'unknown',
        name: att.name || 'Unnamed',
        type: att.type || 'Unknown',
        url: att.url || '#',
        uploadDate: att.uploadedAt || new Date().toISOString(),
      }));

      const testResults: TestResult[] | undefined =
        record.recordType === 'Lab Results' && record.summary
          ? [
              {
                id: `test-${record.id ?? 'unknown'}`,
                name: record.title || 'Unnamed Test',
                date: record.date || new Date().toISOString(),
                result: record.summary,
                normalRange: 'Not specified',
                notes: record.notes,
              },
            ]
          : undefined;

      return {
        id: record.id?.toString() ?? 'unknown',
        date: record.date || new Date().toISOString(),
        doctorName: record.createdBy || 'Unknown',
        diagnosis: record.diagnosis || record.title || 'No diagnosis',
        symptoms: record.symptoms || [],
        prescriptions,
        notes: record.notes || record.summary || '',
        followUpDate: record.followUpDate,
        attachments,
        testResults,
      };
    });
    setMedicalRecords(mappedRecords);
    setLoading(false);

    if (recordsError) {
      setError('Failed to fetch medical records. Please try again later.');
      setLoading(false);
    }
  }, [medicalRecordsData, recordsError, refetch, patientId, user]);

  const viewRecordDetails = (record: MedicalRecord) => setSelectedRecord(record);
  const closeRecordDetails = () => setSelectedRecord(null);

  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSearch =
      searchTerm === '' ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.symptoms.some((symptom) => symptom.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate = filterDate === '' || record.date === filterDate;
    return matchesSearch && matchesDate;
  });

  if (loading || isLoadingRecords) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!patientInfo) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Warning: </strong>
          <span className="block sm:inline">Patient information not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
          <Link to="/patient" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-1">
            <h2 className="text-lg font-semibold mb-2">Patient Information</h2>
            <div className="space-y-1">
              <p><span className="font-medium">Name:</span> {patientInfo.name}</p>
              <p><span className="font-medium">Age:</span> {patientInfo.age}</p>
              <p><span className="font-medium">Gender:</span> {patientInfo.gender}</p>
              <p><span className="font-medium">Blood Type:</span> {patientInfo.bloodType}</p>
            </div>
          </div>
          <div className="col-span-1">
            <h2 className="text-lg font-semibold mb-2">Allergies</h2>
            <div className="space-y-1">
              {patientInfo.allergies.length > 0 ? (
                patientInfo.allergies.map((allergy, index) => (
                  <span key={index} className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded mr-2 mb-2">
                    {allergy}
                  </span>
                ))
              ) : (
                <p>No known allergies</p>
              )}
            </div>
          </div>
          <div className="col-span-1">
            <h2 className="text-lg font-semibold mb-2">Chronic Conditions</h2>
            <div className="space-y-1">
              {patientInfo.chronicConditions.length > 0 ? (
                patientInfo.chronicConditions.map((condition, index) => (
                  <span key={index} className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-2 mb-2">
                    {condition}
                  </span>
                ))
              ) : (
                <p>No chronic conditions</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="md:w-1/2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Records
            </label>
            <input
              type="text"
              id="search"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by diagnosis, doctor, or symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-1/4">
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Date
            </label>
            <input
              type="date"
              id="dateFilter"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="md:w-1/4 flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterDate('');
              }}
              className="w-full px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Medical History</h2>
        {filteredRecords.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No medical records found for the specified filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Follow-up
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.doctorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.diagnosis}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.followUpDate ? new Date(record.followUpDate).toLocaleDateString() : 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => viewRecordDetails(record)} className="text-blue-600 hover:text-blue-900 mr-4">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Medical Record Details - {new Date(selectedRecord.date).toLocaleDateString()}
              </h3>
              <button onClick={closeRecordDetails} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="border-b mb-4">
                <nav className="flex -mb-px space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('prescriptions')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'prescriptions'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Prescriptions {selectedRecord.prescriptions.length > 0 && `(${selectedRecord.prescriptions.length})`}
                  </button>
                  <button
                    onClick={() => setActiveTab('attachments')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'attachments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Attachments {selectedRecord.attachments?.length ? `(${selectedRecord.attachments.length})` : '(0)'}
                  </button>
                  <button
                    onClick={() => setActiveTab('testResults')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'testResults'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Test Results {selectedRecord.testResults?.length ? `(${selectedRecord.testResults.length})` : '(0)'}
                  </button>
                </nav>
              </div>

              {activeTab === 'overview' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Doctor</h4>
                      <p>{selectedRecord.doctorName}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Diagnosis</h4>
                      <p>{selectedRecord.diagnosis}</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">Symptoms</h4>
                    <div className="flex flex-wrap">
                      {selectedRecord.symptoms.length > 0 ? (
                        selectedRecord.symptoms.map((symptom, index) => (
                          <span key={index} className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded mr-2 mb-2">
                            {symptom}
                          </span>
                        ))
                      ) : (
                        <p>No symptoms recorded</p>
                      )}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
                    <p className="text-gray-700 whitespace-pre-line">{selectedRecord.notes}</p>
                  </div>
                  {selectedRecord.followUpDate && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Follow-up Date</h4>
                      <p>{new Date(selectedRecord.followUpDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'prescriptions' && (
                <div>
                  {selectedRecord.prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {selectedRecord.prescriptions.map((prescription) => (
                        <div key={prescription.id} className="border rounded-lg p-4 bg-gray-50">
                          <h4 className="text-lg font-semibold mb-2">{prescription.medicationName}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Dosage</p>
                              <p>{prescription.dosage}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Frequency</p>
                              <p>{prescription.frequency}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Duration</p>
                              <p>{prescription.duration}</p>
                            </div>
                          </div>
                          {prescription.notes && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">Notes</p>
                              <p>{prescription.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No prescriptions for this visit</div>
                  )}
                </div>
              )}

              {activeTab === 'attachments' && (
                <div>
                  {selectedRecord.attachments && selectedRecord.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedRecord.attachments.map((attachment) => (
                        <div key={attachment.id} className="border rounded-lg overflow-hidden">
                          <div className="p-4">
                            <h4 className="font-semibold mb-1">{attachment.name}</h4>
                            <p className="text-sm text-gray-500">
                              Uploaded: {new Date(attachment.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="border-t px-4 py-2 bg-gray-50 flex justify-between">
                            <span className="text-sm text-gray-500">{attachment.type}</span>
                            <a href={attachment.url} className="text-blue-600 hover:text-blue-800 text-sm" target="_blank" rel="noreferrer">
                              View
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No attachments for this visit</div>
                  )}
                </div>
              )}

              {activeTab === 'testResults' && (
                <div>
                  {selectedRecord.testResults && selectedRecord.testResults.length > 0 ? (
                    <div className="space-y-4">
                      {selectedRecord.testResults.map((test) => (
                        <div key={test.id} className="border rounded-lg p-4 bg-gray-50">
                          <h4 className="text-lg font-semibold mb-2">{test.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p>{new Date(test.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Result</p>
                              <p>{test.result}</p>
                            </div>
                          </div>
                          {test.normalRange && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">Normal Range</p>
                              <p>{test.normalRange}</p>
                            </div>
                          )}
                          {test.notes && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">Notes</p>
                              <p>{test.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No test results for this visit</div>
                  )}
                </div>
              )}
            </div>
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={closeRecordDetails}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientMedicalRecords;