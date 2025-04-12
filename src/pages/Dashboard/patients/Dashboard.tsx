// src/pages/patient/PatientDashboardHome.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clipboard, 
  FileText, 
  Heart, 
  Clock, 
  MessageSquare,
  CreditCard,
  X,
  ChevronRight
} from 'lucide-react';
import AIChatbot from '../../../components/ChatbotPage/AIChatbotPage';
import { dashboardApi } from '../../../store/api/dashboardApi';
import { authApi } from '../../../store/api/authApi';

const PatientDashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { data: currentUser } = authApi.useGetCurrentUserQuery();
  const patientId = currentUser?.id || 1;
  const [showChatbot, setShowChatbot] = useState(false);
  const chatbotRef = useRef<HTMLDivElement>(null); // For focus trapping and click outside

  const { data: upcomingAppointments, isLoading: appointmentsLoading } = dashboardApi.useGetTodaysAppointmentsQuery({
    userType: 'patient',
    userId: patientId,
  });

  // Navigation handlers
  const handleViewAppointments = useCallback(() => navigate('/patient/appointments'), [navigate]);
  const handleViewMedications = useCallback(() => navigate('/patient/prescriptions'), [navigate]);
  const handleViewMedicalRecords = useCallback(() => navigate('/patient/records'), [navigate]);
  const handleBookAppointment = useCallback(() => navigate('/patient/appointments', { state: { openBookingForm: true } }), [navigate]);
  const handleSymptomCheck = useCallback(() => setShowChatbot(true), []);
  const handleViewBilling = useCallback(() => navigate('/patient/billing'), [navigate]);
  const handleViewAppointmentDetails = useCallback((appointmentId: number) => navigate(`/patient/appointments/${appointmentId}`), [navigate]);

  // Date utilities
  const getNextAppointmentDays = useCallback(() => {
    if (!upcomingAppointments?.length) return null;
    const nextAppointment = upcomingAppointments[0];
    const diffTime = new Date(nextAppointment.date).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [upcomingAppointments]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  const formatDateTime = useCallback((dateString: string, timeString: string) => `${formatDate(dateString)} at ${timeString}`, [formatDate]);

  // Chatbot controls
  const closeChatbot = useCallback(() => setShowChatbot(false), []);

  // Close on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showChatbot) closeChatbot();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (showChatbot && chatbotRef.current && !chatbotRef.current.contains(e.target as Node)) {
        closeChatbot();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChatbot, closeChatbot]);

  // Mock data
  const medications = [
    { id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
    { id: '2', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime' },
  ];
  const vitals = { bloodPressure: '120/80 mmHg', heartRate: '72 bpm', lastUpdated: '2025-02-28' };

  const renderLoading = (message: string = 'Loading...') => (
    <div className="flex items-center justify-center p-6">
      <Clock className="animate-spin mr-2" />
      <span>{message}</span>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
        <Link to="/" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Back to Homepage
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewAppointments}>
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Next Appointment</h2>
          </div>
          {appointmentsLoading ? renderLoading() : upcomingAppointments?.length ? (
            <>
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-2xl font-bold text-blue-500">{getNextAppointmentDays()}</span>
                <span className="ml-2 text-gray-600">days from now</span>
              </div>
              <p className="text-gray-600 mb-4">{formatDate(upcomingAppointments[0].date)}</p>
            </>
          ) : (
            <p className="text-gray-500 mb-4">No upcoming appointments</p>
          )}
          <button onClick={handleViewAppointments} className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium">
            View all appointments <ChevronRight size={16} className="ml-1" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewMedications}>
          <div className="flex items-center mb-4">
            <Clipboard className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Active Medications</h2>
          </div>
          <div className="mb-2">
            <span className="text-2xl font-bold text-green-500">{medications.length}</span>
          </div>
          <p className="text-gray-600 mb-4">
            {medications.length ? `${medications[0].name}${medications.length > 1 ? `, +${medications.length - 1} more` : ''}` : 'No active medications'}
          </p>
          <button onClick={handleViewMedications} className="text-green-500 hover:text-green-700 flex items-center text-sm font-medium">
            View all medications <ChevronRight size={16} className="ml-1" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewMedicalRecords}>
          <div className="flex items-center mb-4">
            <Heart className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Latest Vitals</h2>
          </div>
          <div className="space-y-2 mb-4">
            <p className="text-gray-600"><span className="font-medium">BP:</span> {vitals.bloodPressure}</p>
            <p className="text-gray-600"><span className="font-medium">Heart Rate:</span> {vitals.heartRate}</p>
          </div>
          <button onClick={handleViewMedicalRecords} className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium">
            View medical records <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Upcoming Appointments + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
            <button onClick={handleViewAppointments} className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center">
              View All <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          {appointmentsLoading ? renderLoading() : !upcomingAppointments?.length ? (
            <div className="p-5 text-center text-gray-500">
              <p>No upcoming appointments</p>
              <button onClick={handleBookAppointment} className="mt-2 text-blue-500 hover:text-blue-700">
                Book an appointment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-5 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div className="mb-3 md:mb-0">
                      <h3 className="text-lg font-medium text-gray-900">{appointment.doctorName || 'Doctor'}</h3>
                      <p className="text-gray-500">{appointment.type || 'Appointment'}</p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-col items-start md:items-end">
                      <div className="flex items-center text-gray-500 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDateTime(appointment.date, appointment.time)}</span>
                      </div>
                      <button onClick={() => handleViewAppointmentDetails(appointment.id)} className="px-3 py-1 border border-blue-500 rounded text-blue-500 text-sm hover:bg-blue-50">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            <button onClick={handleBookAppointment} className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors">
              <Calendar className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 text-center">Book Appointment</span>
            </button>
            <button onClick={handleSymptomCheck} className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors">
              <MessageSquare className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 text-center">AI Symptom Check</span>
            </button>
            <button onClick={handleViewMedicalRecords} className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors">
              <FileText className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 text-center">Medical Records</span>
            </button>
            <button onClick={handleViewBilling} className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors">
              <CreditCard className="h-8 w-8 text-red-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 text-center">Billing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chatbot Popup */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={chatbotRef} className="bg-white rounded-lg shadow-lg w-full max-w-2xl sm:max-w-3xl md:max-w-4xl h-[80vh] sm:h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">AI Symptom Checker</h3>
              <button onClick={closeChatbot} className="text-gray-500 hover:text-gray-700 focus:outline-none" aria-label="Close chatbot">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <AIChatbot patientId={patientId} /> {/* Pass patientId if needed */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboardHome;