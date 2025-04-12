// src/layouts/AdminDashboardLayout.tsx
import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'; // Add useNavigate
import { useDispatch, useSelector } from 'react-redux'; // Add useDispatch and useSelector
import { 
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Building2,
  HelpCircle
} from 'lucide-react';

// Assuming you have a logout action in your auth slice
import { logout } from '../../store/slices/authSlice'; // Adjust the import path based on your project structure

const AdminDashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const dispatch = useDispatch(); // Add dispatch
  const navigate = useNavigate(); // Add navigate
  
  // Fetch auth state from Redux (optional, for consistency with other layouts)
  const user = useSelector((state: any) => state.auth.user) || {};

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action to clear auth state
    navigate('/login'); // Redirect to login page
  };

  // Admin navigation links
  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'User Management', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Doctors', path: '/admin/doctors', icon: <Stethoscope size={20} /> },
    { name: 'Departments', path: '/admin/departments', icon: <Building2 size={20} /> },
    { name: 'Appointments', path: '/admin/appointments', icon: <Calendar size={20} /> },
    { name: 'Reports', path: '/admin/reports', icon: <FileText size={20} /> },
    { name: 'Updates', path: '/admin/updates', icon: <FileText size={20} /> },
    { name: 'Activities', path: '/admin/activities', icon: <FileText size={20} /> },
    { name: 'Calendar', path: '/admin/calendar', icon: <FileText size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Bell size={20} />}
  ];

  // Get current page title from location
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    const currentLink = navLinks.find(link => 
      currentPath === link.path || 
      (link.path === '/admin' && currentPath === '/admin/')
    );
    return currentLink?.name || 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 text-white shadow-xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {isSidebarOpen ? (
            <h2 className="text-xl font-semibold text-white">HMS Admin</h2>
          ) : (
            <h2 className="text-xl font-semibold text-white">HMS</h2>
          )}
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <div className="flex flex-col justify-between h-full overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold">A</span>
              </div>
              {isSidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-gray-400">System Administrator</p>
                </div>
              )}
            </div>
            
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => 
                    `flex items-center py-2 px-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-700 text-white' 
                        : 'text-gray-300 hover:bg-slate-700'
                    }`
                  }
                  end={link.path === '/admin'}
                >
                  <span className="mr-3">{link.icon}</span>
                  {isSidebarOpen && <span>{link.name}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="p-4 mt-auto border-t border-slate-700">
            <NavLink 
              to="/admin/help" 
              className="flex items-center py-2 px-3 text-gray-300 hover:bg-slate-700 rounded-lg mb-2"
            >
              <HelpCircle size={20} className="mr-3" />
              {isSidebarOpen && <span>Help & Support</span>}
            </NavLink>
            <button 
              onClick={handleLogout} // Add onClick handler
              className="flex items-center py-2 px-3 w-full text-left text-red-400 hover:bg-red-900/30 rounded-lg"
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
              {getCurrentPageTitle()}
            </h1>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">A</span>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-2">
            <nav className="flex text-sm">
              <span className="text-blue-600 hover:text-blue-700">Admin</span>
              {location.pathname !== '/admin' && (
                <>
                  <span className="mx-2 text-gray-500">/</span>
                  <span className="text-gray-500">{getCurrentPageTitle()}</span>
                </>
              )}
            </nav>
          </div>
        </div>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;