import React, { useState } from 'react';
import { X, Save, Search } from 'lucide-react';
import { patientsApi } from '../../../store/api/patientsApi'; // Adjust as needed
interface PrescriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prescriptionData: any) => void;
  onCancel: () => void;
}

interface Patient {
  id: number;
  name: string | null;
  age: number | null;
  gender: string | null;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    form: '',
    frequency: '',
    route: '',
    duration: '',
    quantity: '',
    refills: '',
    instructions: '',
    pharmacy: '',
    notes: '',
  });

  const [patientSearchTerm, setPatientSearchTerm] = useState<string>('');

  const { data: patientsData, isLoading: patientsLoading, error: patientsError } = patientsApi.useGetPatientsQuery({ page: 1, limit: 100 });
  console.log('patientsData:', patientsData); // Debug the response

  const patients: Patient[] = Array.isArray(patientsData?.data)
    ? patientsData.data.filter((patient: any) => patient && typeof patient === 'object')
    : [];
  console.log('patients:', patients);

  const filteredPatients = patients.filter(patient =>
    patient && patient.name ? patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) : false
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePatientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientSearchTerm(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      patientId: Number(formData.patientId),
      quantity: formData.quantity ? Number(formData.quantity) : undefined,
      refills: formData.refills ? Number(formData.refills) : undefined,
    };
    onSave(submissionData);
  };

  if (!isOpen) return null;

  if (patientsError) {
    return <div>Error loading patients: {JSON.stringify(patientsError)}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">New Prescription</h2>
            <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Patient Selection with Search */}
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={patientSearchTerm}
                    onChange={handlePatientSearchChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search patients by name..."
                  />
                </div>
                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={patientsLoading}
                >
                  <option value="">Select Patient</option>
                  {patientsLoading ? (
                    <option>Loading patients...</option>
                  ) : filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.age || 'N/A'}, {patient.gender || 'N/A'})
                      </option>
                    ))
                  ) : (
                    <option>No patients found</option>
                  )}
                </select>
              </div>

              {/* ... rest of the form unchanged */}
              <div>
                <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">
                  Medication <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="medication"
                  name="medication"
                  value={formData.medication}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Lisinopril"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="dosage"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 10 mg"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="form" className="block text-sm font-medium text-gray-700 mb-1">
                    Form <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="form"
                    name="form"
                    value={formData.form}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Form</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Liquid">Liquid</option>
                    <option value="Injection">Injection</option>
                    <option value="Patch">Patch</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Cream">Cream</option>
                    <option value="Drops">Drops</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="Every 4-6 hours as needed">Every 4-6 hours as needed</option>
                  <option value="Every 6-8 hours as needed">Every 6-8 hours as needed</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Twice weekly">Twice weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-1">
                    Route <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="route"
                    name="route"
                    value={formData.route}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Route</option>
                    <option value="Oral">Oral</option>
                    <option value="Topical">Topical</option>
                    <option value="Intravenous">Intravenous</option>
                    <option value="Intramuscular">Intramuscular</option>
                    <option value="Subcutaneous">Subcutaneous</option>
                    <option value="Inhalation">Inhalation</option>
                    <option value="Ophthalmic">Ophthalmic</option>
                    <option value="Otic">Otic</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 10 days, 1 month"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 30"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="refills" className="block text-sm font-medium text-gray-700 mb-1">
                    Refills
                  </label>
                  <input
                    type="number"
                    id="refills"
                    name="refills"
                    value={formData.refills}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Instructions for patient"
                  required
                ></textarea>
              </div>

              <div>
                <label htmlFor="pharmacy" className="block text-sm font-medium text-gray-700 mb-1">
                  Pharmacy
                </label>
                <select
                  id="pharmacy"
                  name="pharmacy"
                  value={formData.pharmacy}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Pharmacy (Optional)</option>
                  <option value="City Pharmacy">City Pharmacy</option>
                  <option value="MedPlus Pharmacy">MedPlus Pharmacy</option>
                  <option value="Health Mart">Health Mart</option>
                  <option value="Village Pharmacy">Village Pharmacy</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (not visible to patient)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Internal notes"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center"
                  disabled={patientsLoading}
                >
                  <Save size={18} className="mr-2" />
                  Save Prescription
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm;