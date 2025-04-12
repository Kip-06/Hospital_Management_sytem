// src/App.tsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/authentication context/aunthenticationContextPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Layouts
import DashboardLayout from './components/Layout/DoctorDashboardLayout';
import AdminDashboardLayout from './components/Layout/AdminDashboardLayout';
import PatientDashboardLayout from './components/Layout/PatientDashboardLayout';

// Public Pages
import HomePage from './components/Home/Homepage';
import ServicesPage from './components/Services/ServicesPage';
import Blog from './components/blog/blog';
import SignInPage from './components/Home/SignInPage';
import RegistrationPage from './components/Home/RegistrationPage';

// Doctor Pages
import DashboardHome from './pages/Dashboard/doctors/DashboardHome';
import PatientsPage from './pages/Dashboard/doctors/Patients';
import AppointmentsPage from './pages/Dashboard/doctors/Appointments';
import MedicalRecordsPage from './pages/Dashboard/doctors/MedicalRecords';
import PrescriptionPage from './pages/Dashboard/doctors/Prescriptions';
import PatientUpdatesPage from './pages/Dashboard/doctors/Updates';
import ActivitiesPage from './pages/Dashboard/doctors/Activities';
import DoctorCalendarPage from './pages/Dashboard/doctors/DoctorCalendar';
import AnalyticsPage from './pages/Dashboard/doctors/AnalyticsPage'
import SettingsPage from './pages/Dashboard/doctors/Settings';

// Admin Pages
import AdminDashboardPage from './pages/Dashboard/admin/DashboardPage';
import UserManagementPage from './pages/Dashboard/admin/UserManagement';
import DoctorsPage from './pages/Dashboard/admin/Doctors';
import DepartmentsPage from './pages/Dashboard/admin/Departments';
import AdminAppointmentsPage from './pages/Dashboard/admin/Appointments';
import ReportsPage from './pages/Dashboard/admin/ReportsPage';
import AdminSettingsPage from './pages/Dashboard/admin/SettingsPage';
import RecentUpdatesPage from './pages/Dashboard/admin/UpdatesPage';
import RecentActivitiesPage from './pages/Dashboard/admin/RecentActivities';
import FullCalendarPage from './pages/Dashboard/admin/Calendar';

// Patient Pages
import PatientDashboard from './pages/Dashboard/patients/Dashboard';
import PatientAppointmentsPage from './pages/Dashboard/patients/appointments';
import PatientMedicalRecords from './pages/Dashboard/patients/MedicalRecords';
import PatientPrescriptionsPage from './pages/Dashboard/patients/prescriptions';
import PatientBillingPage from './pages/Dashboard/patients/Billing';
import PatientSettings from './pages/Dashboard/patients/Settings';
import PatientDoctorsPage from './pages/Dashboard/patients/Doctors';

// Other Pages
import AIChatbot from './components/ChatbotPage/AIChatbotPage';
import AboutUsPage from './components/Home/AboutUsPage';
import ContactsPage from './components/Home/Contacts';

const App: React.FC = () => {
  const [, setCurrentPage] = useState<string>('Home');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/">
            <Route index element={<HomePage />} />
            <Route path="/services" element={<ServicesPage setCurrentPage={setCurrentPage} />} />
            <Route path='/about' element={<AboutUsPage setCurrentPage={setCurrentPage}/>} />
            <Route path='/blog' element={<Blog setCurrentPage={setCurrentPage}/>} />
            <Route path='/contacts' element={<ContactsPage setCurrentPage={setCurrentPage}/>} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/register" element={<RegistrationPage />} />
          </Route>

          {/* Protected Doctor Routes */}
          
            <Route path="/doctor" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="records" element={<MedicalRecordsPage />} />
              <Route path="prescriptions" element={<PrescriptionPage />} />
              <Route path="patient-updates" element={<PatientUpdatesPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="doctor-calendar" element={<DoctorCalendarPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
         

          {/* Protected Patient Routes */}
         
            <Route path="/patient" element={<PatientDashboardLayout />}>
              <Route index element={<PatientDashboard />} />
              <Route path="doctors" element={<PatientDoctorsPage />} />
              <Route path="appointments" element={<PatientAppointmentsPage />} />
              <Route path="records" element={<PatientMedicalRecords />} />
              <Route path="prescriptions" element={<PatientPrescriptionsPage />} />
              <Route path="billing" element={<PatientBillingPage />} />
              <Route path="settings" element={<PatientSettings patientId="123" />} />
            </Route>
         

          {/* Protected Admin Routes */}
          
            <Route path="/admin" element={<AdminDashboardLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="doctors" element={<DoctorsPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="appointments" element={<AdminAppointmentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="updates" element={<RecentUpdatesPage />} />
              <Route path="activities" element={<RecentActivitiesPage />} />
              <Route path="calendar" element={<FullCalendarPage />} />
              <Route path="help" element={
                <div className="p-6 bg-white rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Help & Support</h2>
                  <p>This is the help and support page for hospital administrators. For assistance, please contact the IT department.</p>
                </div>
              } />
            </Route>
          

          {/* Other Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/aichatbot" element={<AIChatbot />} />
          </Route>

          {/* Redirect to home or 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;