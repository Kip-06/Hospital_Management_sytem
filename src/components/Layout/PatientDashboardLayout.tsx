import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // Add useDispatch
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'; // Add useNavigate
import { 
  Calendar, 
  FileText, 
  Clipboard, 
  Settings, 
  Bell, 
  Home, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  UserPlus
} from 'lucide-react';

// Assuming you have a logout action in your auth slice
import { logout } from '../../store/slices/authSlice'; // Adjust the import path based on your project structure

const PatientDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const dispatch = useDispatch(); // Add dispatch
  const navigate = useNavigate(); // Add navigate

  // Fetch auth state from Redux
  const authState = useSelector((state: any) => state.auth);
  const user = useSelector((state: any) => state.auth.user) || {};

  // Create user display info with fallbacks
  const userDisplayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : `${user.email ? user.email.split('@')[0] : 'Loading...'}`;
  const userId = user.id ? `Patient ID: #${user.id}` : 'Patient ID: N/A';
  const userInitials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}` 
    : user.email ? user.email[0].toUpperCase() : 'P';

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action to clear auth state
    navigate('/login'); // Redirect to login page
  };

  // Patient navigation links
  const navLinks = [
    { name: 'Dashboard', path: '/patient', icon: <Home size={20} /> },
    { name: 'Find Doctors', path: '/patient/doctors', icon: <UserPlus size={20} /> },
    { name: 'Appointments', path: '/patient/appointments', icon: <Calendar size={20} /> },
    { name: 'Medical Records', path: '/patient/records', icon: <FileText size={20} /> },
    { name: 'Prescriptions', path: '/patient/prescriptions', icon: <Clipboard size={20} /> },
    { name: 'Billing', path: '/patient/billing', icon: <CreditCard size={20} /> },
    { name: 'Settings', path: '/patient/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b">
          {isSidebarOpen ? (
            <h2 className="text-xl font-semibold text-blue-600">Patient Portal</h2>
          ) : (
            <h2 className="text-xl font-semibold text-blue-600">PP</h2>
          )}
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-blue-600">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <div className="flex flex-col justify-between h-[calc(100%-64px)]">
          <div className="p-4">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">{userInitials}</span>
              </div>
              {isSidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{userDisplayName}</p>
                  <p className="text-xs text-gray-500">{userId}</p>
                </div>
              )}
            </div>
            
            <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-240px)]">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => 
                    `flex items-center py-2 px-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  end={link.path === '/patient'}
                >
                  <span className="mr-3">{link.icon}</span>
                  {isSidebarOpen && <span>{link.name}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t">
            <button 
              onClick={handleLogout} // Add onClick handler
              className="flex items-center py-2 px-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={20} className="mr-3" />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">
              {navLinks.find(link => 
                location.pathname === link.path || 
                (link.path === '/patient' && location.pathname === '/patient/') ||
                location.pathname.startsWith(link.path + '/')
              )?.name || 'Dashboard'}
            </h1>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">{userInitials}</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientDashboardLayout;