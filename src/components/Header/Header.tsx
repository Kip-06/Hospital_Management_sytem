import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Menu,
  Bell,
  Calendar,
  Users,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Activity
} from 'lucide-react';

interface HeaderProps {
  setCurrentPage?: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ setCurrentPage }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const authState = useSelector((state: any) => state.auth);
  const user = {
    name: authState.firstName && authState.lastName 
      ? `Dr. ${authState.firstName} ${authState.lastName}` 
      : 'Loading...',
    role: authState.role || 'User',
    avatar: authState.avatar || '/api/placeholder/36/36'
  };

  const notifications = [
    { id: 1, title: 'New appointment request', message: 'You have a new appointment request from John Doe.', time: '2 mins ago', read: false },
    { id: 2, title: 'Appointment confirmed', message: 'Your appointment with Dr. Smith has been confirmed.', time: '1 hour ago', read: true },
    { id: 3, title: 'New message', message: 'You have received a new message from Jane Doe.', time: '3 hours ago', read: false }
  ];

  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Activity className="h-5 w-5" /> },
    { name: 'Appointments', path: '/appointments', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Patients', path: '/patients', icon: <Users className="h-5 w-5" /> },
    { name: 'Doctors', path: '/doctors', icon: <User className="h-5 w-5" /> },
    { name: 'Services', path: '/services', icon: <Activity className="h-5 w-5" /> }
  ];

  // Check if a nav item is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setUserMenuOpen(false);
    setNotificationsOpen(false);
  };

  // Toggle user menu
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setNotificationsOpen(false);
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setUserMenuOpen(false);
  };

  // Handle navigation click (for mobile)
  const handleNavClick = (pageName: string) => {
    if (setCurrentPage) {
      setCurrentPage(pageName);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-1 rounded">
                <Activity className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">HealthCare</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-1 py-2 text-sm font-medium ${
                  isActive(item.path)
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                onClick={() => handleNavClick(item.name)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={toggleNotifications}
              >
                <span className="relative">
                  <Bell className="h-6 w-6" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3"></span>
                  )}
                </span>
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">No new notifications</div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                onClick={toggleUserMenu}
              >
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.avatar}
                  alt={user.name}
                />
                <div className="hidden md:block text-left">
                  <span className="block text-sm font-medium">{user.name}</span>
                  <span className="block text-xs text-gray-500">{user.role}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Your Profile
                    </div>
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </div>
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => handleNavClick(item.name)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;