// src/pages/doctor/MedicalRecordForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Stethoscope, 
  Pill,
  Heart,
  Thermometer,
  Activity,
  Upload,
  Save,
  Users,
  Check,
  AlertCircle
} from 'lucide-react';
import { patientsApi } from '../../../store/api/patientsApi';

// Define TypeScript interfaces
interface Patient {
  id: string;
  name: string;
  avatar: string;
  bgColor: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
}

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosisCode: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  medications: Medication[];
  vitalSigns: any;
  notes: string;
  followUpDate?: string;
  doctorId: string;
  doctorName: string;
  attachments?: Attachment[];
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface VitalSigns {
  temperature?: number;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
}

interface MedicalRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordSaved: (record: MedicalRecord) => void;
  editRecord?: MedicalRecord; // Optional for editing existing records
  doctorId: string;
  doctorName: string;
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ 
  isOpen, 
  onClose, 
  onRecordSaved,
  editRecord,
  doctorId,
  doctorName
}) => {
  // Patient selection state
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientList, setShowPatientList] = useState<boolean>(false);

  const { 
    data: patientsData, 
    isLoading: isLoadingPatients 
  } = patientsApi.useGetPatientsQuery({
    search: patientSearch,
    limit: 10
  });
  
  // Form fields state
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [diagnosisCode, setDiagnosisCode] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [symptomsText, setSymptomsText] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [treatment, setTreatment] = useState<string>('');
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    temperature: undefined,
    bloodPressure: '',
    heartRate: undefined,
    respiratoryRate: undefined,
    oxygenSaturation: undefined,
    weight: undefined,
    height: undefined
  });
  const [notes, setNotes] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // Validation
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  

  // Filter patients based on search
  const filteredPatients = (patientsData?.data || []).map(patient => ({
    id: patient.id.toString(),
    name: `${patient.firstName} ${patient.lastName}`,
    avatar: `${patient.firstName[0]}${patient.lastName[0]}`,
    bgColor: patient.bgColor || 'bg-blue-100',
    age: patient.age || 30,
    gender: patient.gender || 'Other'
  })).filter(patient => 
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // Set form for editing if editRecord is provided
  useEffect(() => {
    if (editRecord) {
      // Find the patient
      const patient = filteredPatients.find(p => p.id === editRecord.patientId);
      setSelectedPatient(patient || null);
      setDate(editRecord.date);
      setDiagnosisCode(editRecord.diagnosisCode);
      setDiagnosis(editRecord.diagnosis);
      setSymptoms(editRecord.symptoms);
      setSymptomsText(editRecord.symptoms.join(', '));
      setTreatment(editRecord.treatment);
      setMedications(editRecord.medications);
      setVitalSigns(editRecord.vitalSigns);
      setNotes(editRecord.notes);
      setFollowUpDate(editRecord.followUpDate || '');
      setAttachments(editRecord.attachments || []);
    }
  }, [editRecord]);

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearch('');
    setShowPatientList(false);
    
    // Clear patient-related errors
    const updatedErrors = {...formErrors};
    delete updatedErrors.patient;
    setFormErrors(updatedErrors);
  };

  // Handle symptoms input
  const handleSymptomsChange = (value: string) => {
    setSymptomsText(value);
    // Convert comma-separated string to array, trim whitespace
    const symptomArray = value.split(',').map(s => s.trim()).filter(s => s !== '');
    setSymptoms(symptomArray);
  };

  // Handle medication changes
  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    setMedications(updatedMedications);
  };

  // Add a new medication
  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  // Remove a medication
  const removeMedication = (index: number) => {
    const updatedMedications = [...medications];
    updatedMedications.splice(index, 1);
    setMedications(updatedMedications);
  };

  // Handle vital signs changes
  const handleVitalSignChange = (field: keyof VitalSigns, value: string) => {
    const updatedVitalSigns = { ...vitalSigns };
    
    if (field === 'bloodPressure') {
      updatedVitalSigns.bloodPressure = value;
    } else {
      const numericField = field as Exclude<keyof VitalSigns, 'bloodPressure'>;
      updatedVitalSigns[numericField] = value === '' ? undefined : Number(value);
    }
    
    setVitalSigns(updatedVitalSigns);
  };

  // Handle file upload (mock implementation)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: Attachment[] = Array.from(e.target.files).map((file, index) => ({
        id: `att-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file)
      }));
      
      setAttachments([...attachments, ...newAttachments]);
    }
  };
  
  // Remove an attachment
  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!selectedPatient) {
      errors.patient = 'Please select a patient';
    }
    
    if (!date) {
      errors.date = 'Please select a date';
    }
    
    if (!diagnosis.trim()) {
      errors.diagnosis = 'Diagnosis is required';
    }
    
    if (!treatment.trim()) {
      errors.treatment = 'Treatment is required';
    }
    
    // Validate medications
    const invalidMedicationIndex = medications.findIndex(
      med => med.name.trim() !== '' && (med.dosage.trim() === '' || med.frequency.trim() === '')
    );
    
    if (invalidMedicationIndex !== -1) {
      errors.medications = 'Please complete all fields for each medication';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Create medical record object
      const newRecord: MedicalRecord = {
        id: editRecord ? editRecord.id : `MR-${Date.now()}`, // Simple ID generation
        patientId: selectedPatient!.id,
        patientName: selectedPatient!.name,
        date,
        diagnosisCode,
        diagnosis,
        symptoms,
        treatment,
        medications: medications.filter(med => med.name.trim() !== ''),
        vitalSigns,
        notes,
        followUpDate: followUpDate || undefined,
        doctorId,
        doctorName,
        attachments
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save the record
      onRecordSaved(newRecord);
      
      // Show success message
      setIsSuccess(true);
      
      // Close after 1.5 seconds
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving medical record:', error);
      setFormErrors({ submit: 'Failed to save record. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setSelectedPatient(null);
    setPatientSearch('');
    setDate(new Date().toISOString().split('T')[0]);
    setDiagnosisCode('');
    setDiagnosis('');
    setSymptomsText('');
    setSymptoms([]);
    setTreatment('');
    setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
    setVitalSigns({
      temperature: undefined,
      bloodPressure: '',
      heartRate: undefined,
      respiratoryRate: undefined,
      oxygenSaturation: undefined,
      weight: undefined,
      height: undefined
    });
    setNotes('');
    setFollowUpDate('');
    setAttachments([]);
    setFormErrors({});
    setIsSuccess(false);
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editRecord ? 'Edit Medical Record' : 'Add New Medical Record'}
            </h2>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={handleClose}
              disabled={isSaving}
            >
              <X size={24} />
            </button>
          </div>
          
          {isSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <Check size={24} className="text-green-500 mr-3" />
              <div>
                <h3 className="font-medium text-green-800">Successfully Saved</h3>
                <p className="text-green-700">The medical record has been saved successfully.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Patient Selection */}
                <div className="relative">
                  <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">
                    Patient <span className="text-red-500">*</span>
                  </label>
                  {selectedPatient ? (
                    <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full ${selectedPatient.bgColor} flex items-center justify-center mr-4`}>
                          <span className="font-medium text-sm">{selectedPatient.avatar}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{selectedPatient.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {selectedPatient.id} • {selectedPatient.age} years • {selectedPatient.gender}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => setSelectedPatient(null)}
                        disabled={isSaving}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          id="patient"
                          value={patientSearch}
                          onChange={(e) => {
                            setPatientSearch(e.target.value);
                            setShowPatientList(true);
                          }}
                          onFocus={() => setShowPatientList(true)}
                          className={`w-full p-3 border rounded-lg ${formErrors.patient ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Search patient by name or ID"
                          disabled={isSaving}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <Users size={18} className="text-gray-400" />
                        </div>
                      </div>
                      {formErrors.patient && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.patient}</p>
                      )}
                      {showPatientList && patientSearch.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                          {filteredPatients.length > 0 ? (
                            filteredPatients.map(patient => (
                              <div
                                key={patient.id}
                                className="p-3 hover:bg-gray-50 cursor-pointer flex items-center"
                                onClick={() => handlePatientSelect(patient)}
                              >
                                <div className={`w-8 h-8 rounded-full ${patient.bgColor} flex items-center justify-center mr-3`}>
                                  <span className="font-medium text-xs">{patient.avatar}</span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                  <div className="text-xs text-gray-500">
                                    ID: {patient.id} • {patient.age} years • {patient.gender}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-sm text-gray-500">No patients found</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="recordDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Record Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="recordDate"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        const updatedErrors = {...formErrors};
                        delete updatedErrors.date;
                        setFormErrors(updatedErrors);
                      }}
                      className={`w-full p-2 border rounded-lg ${formErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isSaving}
                    />
                    {formErrors.date && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Follow-up Date
                    </label>
                    <input
                      type="date"
                      id="followUpDate"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      disabled={isSaving}
                    />
                  </div>
                </div>
                
                {/* Diagnosis Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label htmlFor="diagnosisCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnosis Code
                    </label>
                    <input
                      type="text"
                      id="diagnosisCode"
                      value={diagnosisCode}
                      onChange={(e) => setDiagnosisCode(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="e.g. J45.901"
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnosis <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="diagnosis"
                        value={diagnosis}
                        onChange={(e) => {
                          setDiagnosis(e.target.value);
                          const updatedErrors = {...formErrors};
                          delete updatedErrors.diagnosis;
                          setFormErrors(updatedErrors);
                        }}
                        className={`w-full p-2 border rounded-lg ${formErrors.diagnosis ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter primary diagnosis"
                        disabled={isSaving}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Stethoscope size={18} className="text-gray-400" />
                      </div>
                    </div>
                    {formErrors.diagnosis && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.diagnosis}</p>
                    )}
                  </div>
                </div>
                
                {/* Symptoms */}
                <div>
                  <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms
                  </label>
                  <input
                    type="text"
                    id="symptoms"
                    value={symptomsText}
                    onChange={(e) => handleSymptomsChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter symptoms separated by commas"
                    disabled={isSaving}
                  />
                  {symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {symptoms.map((symptom, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Treatment */}
                <div>
                  <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-1">
                    Treatment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="treatment"
                    value={treatment}
                    onChange={(e) => {
                      setTreatment(e.target.value);
                      const updatedErrors = {...formErrors};
                      delete updatedErrors.treatment;
                      setFormErrors(updatedErrors);
                    }}
                    rows={3}
                    className={`w-full p-2 border rounded-lg ${formErrors.treatment ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Describe the treatment plan"
                    disabled={isSaving}
                  ></textarea>
                  {formErrors.treatment && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.treatment}</p>
                  )}
                </div>
                
                {/* Medications */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Medications
                    </label>
                    <button
                      type="button"
                      onClick={addMedication}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      disabled={isSaving}
                    >
                      + Add Medication
                    </button>
                  </div>
                  
                  {medications.map((medication, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg mb-3">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Medication {index + 1}</h4>
                        {medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            className="text-sm text-red-600 hover:text-red-800"
                            disabled={isSaving}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <div>
                          <label htmlFor={`med-name-${index}`} className="block text-xs text-gray-500 mb-1">
                            Medication Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id={`med-name-${index}`}
                              value={medication.name}
                              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg"
                              placeholder="Medication name"
                              disabled={isSaving}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <Pill size={16} className="text-gray-400" />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor={`med-dosage-${index}`} className="block text-xs text-gray-500 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            id={`med-dosage-${index}`}
                            value={medication.dosage}
                            onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="e.g. 500mg"
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <div>
                          <label htmlFor={`med-frequency-${index}`} className="block text-xs text-gray-500 mb-1">
                            Frequency
                          </label>
                          <input
                            type="text"
                            id={`med-frequency-${index}`}
                            value={medication.frequency}
                            onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="e.g. 3 times daily"
                            disabled={isSaving}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`med-duration-${index}`} className="block text-xs text-gray-500 mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            id={`med-duration-${index}`}
                            value={medication.duration}
                            onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="e.g. 7 days"
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {formErrors.medications && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.medications}</p>
                  )}
                </div>
                
                {/* Vital Signs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Vital Signs
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="temperature" className="block text-xs text-gray-500 mb-1">
                        Temperature (°C)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="temperature"
                          value={vitalSigns.temperature === undefined ? '' : vitalSigns.temperature}
                          onChange={(e) => handleVitalSignChange('temperature', e.target.value)}
                          step="0.1"
                          min="30"
                          max="45"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          placeholder="e.g. 37.0"
                          disabled={isSaving}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <Thermometer size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="bloodPressure" className="block text-xs text-gray-500 mb-1">
                        Blood Pressure (mmHg)
                      </label>
                      <input
                        type="text"
                        id="bloodPressure"
                        value={vitalSigns.bloodPressure}
                        onChange={(e) => handleVitalSignChange('bloodPressure', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="e.g. 120/80"
                        disabled={isSaving}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="heartRate" className="block text-xs text-gray-500 mb-1">
                        Heart Rate (bpm)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="heartRate"
                          value={vitalSigns.heartRate === undefined ? '' : vitalSigns.heartRate}
                          onChange={(e) => handleVitalSignChange('heartRate', e.target.value)}
                          min="40"
                          max="200"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          placeholder="e.g. 75"
                          disabled={isSaving}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <Heart size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label htmlFor="respiratoryRate" className="block text-xs text-gray-500 mb-1">
                        Respiratory Rate (bpm)
                      </label>
                      <input
                        type="number"
                        id="respiratoryRate"
                        value={vitalSigns.respiratoryRate === undefined ? '' : vitalSigns.respiratoryRate}
                        onChange={(e) => handleVitalSignChange('respiratoryRate', e.target.value)}
                        min="8"
                        max="40"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="e.g. 16"
                        disabled={isSaving}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="oxygenSaturation" className="block text-xs text-gray-500 mb-1">
                        Oxygen Saturation (%)
                      </label>
                      <input
                        type="number"
                        id="oxygenSaturation"
                        value={vitalSigns.oxygenSaturation === undefined ? '' : vitalSigns.oxygenSaturation}
                        onChange={(e) => handleVitalSignChange('oxygenSaturation', e.target.value)}
                        min="70"
                        max="100"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="e.g. 98"
                        disabled={isSaving}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="weight" className="block text-xs text-gray-500 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          id="weight"
                          value={vitalSigns.weight === undefined ? '' : vitalSigns.weight}
                          onChange={(e) => handleVitalSignChange('weight', e.target.value)}
                          min="0"
                          step="0.1"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          placeholder="e.g. 70.5"
                          disabled={isSaving}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="height" className="block text-xs text-gray-500 mb-1">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          id="height"
                          value={vitalSigns.height === undefined ? '' : vitalSigns.height}
                          onChange={(e) => handleVitalSignChange('height', e.target.value)}
                          min="0"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          placeholder="e.g. 175"
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Any additional notes or observations"
                    disabled={isSaving}
                  ></textarea>
                </div>
                
                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isSaving}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center">
                        <Upload size={36} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Images, PDFs, or documents (max. 10MB each)
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
                      <div className="space-y-2">
                        {attachments.map(attachment => (
                          <div key={attachment.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                            <div className="flex items-center">
                              <FileText size={18} className="text-gray-500 mr-2" />
                              <span className="text-sm text-gray-700 truncate max-w-md">{attachment.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(attachment.id)}
                              className="text-gray-400 hover:text-red-600"
                              disabled={isSaving}
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Error message */}
                {formErrors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle size={20} className="text-red-500 mr-2" />
                    {formErrors.submit}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    onClick={handleClose}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        {editRecord ? 'Update Record' : 'Save Record'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordForm;