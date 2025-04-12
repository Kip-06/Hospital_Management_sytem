// PatientSettingsPage.tsx
import React, { useState, useEffect } from 'react';

// Types
interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  profileImage?: string;
}

interface Notification {
  id: string;
  type: 'email' | 'sms' | 'app';
  enabled: boolean;
}

interface SettingsProps {
  patientId: string;
}

const PatientSettings: React.FC<SettingsProps> = ({ patientId }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences'>('profile');
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    language: 'english',
    theme: 'light',
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false
    }
  });

  // Mock data fetching
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        // In a real app, fetch from API
        // const response = await fetch(`/api/patients/${patientId}`);
        // const data = await response.json();
        
        // Mock data
        setTimeout(() => {
          setProfile({
            id: patientId,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '(123) 456-7890',
            dateOfBirth: '1985-05-15',
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '90210',
            emergencyContact: 'Jane Doe',
            emergencyPhone: '(123) 456-7891',
            profileImage: 'https://via.placeholder.com/150'
          });
          
          setNotifications([
            { id: '1', type: 'email', enabled: true },
            { id: '2', type: 'sms', enabled: false },
            { id: '3', type: 'app', enabled: true }
          ]);
          
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  // Handle profile update
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (profile) {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  // Handle profile save
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaveStatus('saving');
      
      // In a real app, send to API
      // await fetch(`/api/patients/${patientId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profile)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, enabled: !notification.enabled } : notification
    ));
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword({
      ...password,
      [name]: value
    });
  };

  // Handle password save
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    // Validation
    if (!password.current || !password.new || !password.confirm) {
      setPasswordError('All password fields are required');
      return;
    }
    
    if (password.new !== password.confirm) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    
    try {
      setSaveStatus('saving');
      
      // In a real app, send to API
      // await fetch(`/api/patients/${patientId}/password`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     currentPassword: password.current, 
      //     newPassword: password.new 
      //   })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Reset form
      setPassword({
        current: '',
        new: '',
        confirm: ''
      });
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      setSaveStatus('error');
      setPasswordError('Failed to update password. Please try again.');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Handle preferences change
  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'accessibility') {
        setPreferences({
          ...preferences,
          accessibility: {
            ...preferences.accessibility,
            [child]: checked
          }
        });
      }
    } else {
      setPreferences({
        ...preferences,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle file change for profile image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      // In a real app, upload to server and get URL
      // Here we're just creating a local URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({
          ...profile,
          profileImage: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save preferences
  const handleSavePreferences = () => {
    setSaveStatus('saving');
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
        
        {/* Settings Tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('notifications')} 
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'notifications' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Notifications
            </button>
            <button 
              onClick={() => setActiveTab('security')} 
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Security
            </button>
            <button 
              onClick={() => setActiveTab('preferences')} 
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'preferences' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Preferences
            </button>
          </div>
          
          {/* Profile Settings */}
          {activeTab === 'profile' && profile && (
            <div className="p-4 md:p-6">
              <form onSubmit={handleProfileSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Image */}
                  <div className="md:col-span-2 flex items-center">
                    <div className="mr-4">
                      <img 
                        src={profile.profileImage || 'https://via.placeholder.com/150'} 
                        alt="Profile" 
                        className="h-16 w-16 rounded-full object-cover border border-gray-200"
                      />
                    </div>
                  
                  <div className="pt-6">
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                      onClick={handleSavePreferences}
                    >
                      {saveStatus === 'saving' ? 'Saving...' : 'Save Preferences'}
                    </button>
                    
                    {saveStatus === 'success' && (
                      <span className="ml-3 text-green-600 text-sm">
                        Preferences saved successfully!
                      </span>
                    )}
                  </div>
                    <div>
                      <label htmlFor="profile-image" className="bg-white hover:bg-gray-50 text-blue-600 px-4 py-2 border border-blue-600 rounded-md text-sm font-medium cursor-pointer">
                        Change Photo
                      </label>
                      <input 
                        id="profile-image" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                      <p className="mt-1 text-xs text-gray-500">JPEG, PNG, or GIF up to 2MB</p>
                    </div>
                  </div>
                  
                  {/* Personal Information */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input 
                      type="text" 
                      id="firstName" 
                      name="firstName" 
                      value={profile.firstName} 
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input 
                      type="text" 
                      id="lastName" 
                      name="lastName" 
                      value={profile.lastName} 
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={profile.email} 
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={profile.phone} 
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input 
                      type="date" 
                      id="dateOfBirth" 
                      name="dateOfBirth" 
                      value={profile.dateOfBirth} 
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input 
                      type="text" 
                      id="address" 
                      name="address" 
                      value={profile.address} 
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input 
                      type="text" 
                      id="city" 
                      name="city" 
                      value={profile.city} 
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input 
                        type="text" 
                        id="state" 
                        name="state" 
                        value={profile.state} 
                        onChange={handleProfileChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input 
                        type="text" 
                        id="zipCode" 
                        name="zipCode" 
                        value={profile.zipCode} 
                        onChange={handleProfileChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <input 
                      type="text" 
                      id="emergencyContact" 
                      name="emergencyContact" 
                      value={profile.emergencyContact} 
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Phone
                    </label>
                    <input 
                      type="tel" 
                      id="emergencyPhone" 
                      name="emergencyPhone" 
                      value={profile.emergencyPhone} 
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex items-center">
                  <button 
                    type="submit" 
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      saveStatus === 'saving' 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                  </button>
                  
                  {saveStatus === 'success' && (
                    <span className="ml-3 text-green-600 text-sm">
                      Changes saved successfully!
                    </span>
                  )}
                  
                  {saveStatus === 'error' && (
                    <span className="ml-3 text-red-600 text-sm">
                      Error saving changes. Please try again.
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
          
          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
              <p className="text-sm text-gray-500 mb-6">Manage how and when you receive notifications.</p>
              
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.id} className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">
                        {notification.type === 'email' && 'Email Notifications'}
                        {notification.type === 'sms' && 'SMS Notifications'}
                        {notification.type === 'app' && 'App Notifications'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {notification.type === 'email' && 'Receive notifications via email'}
                        {notification.type === 'sms' && 'Receive notifications via text message'}
                        {notification.type === 'app' && 'Receive in-app notifications'}
                      </p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notification.enabled}
                        onChange={() => handleNotificationToggle(notification.id)}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
                
                <div className="pt-4">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    onClick={() => {
                      setSaveStatus('saving');
                      setTimeout(() => {
                        setSaveStatus('success');
                        setTimeout(() => setSaveStatus('idle'), 2000);
                      }, 800);
                    }}
                  >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Preferences'}
                  </button>
                  
                  {saveStatus === 'success' && (
                    <span className="ml-3 text-green-600 text-sm">
                      Preferences saved successfully!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
              
              <div className="space-y-6">
                {/* Change Password */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Change Password</h3>
                  <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
                    <div>
                      <label htmlFor="current" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input 
                        type="password" 
                        id="current" 
                        name="current" 
                        value={password.current} 
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="new" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input 
                        type="password" 
                        id="new" 
                        name="new" 
                        value={password.new} 
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input 
                        type="password" 
                        id="confirm" 
                        name="confirm" 
                        value={password.confirm} 
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {passwordError && (
                      <div className="text-sm text-red-600">
                        {passwordError}
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <button 
                        type="submit" 
                        className={`px-4 py-2 rounded-md text-white font-medium ${
                          saveStatus === 'saving' 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={saveStatus === 'saving'}
                      >
                        {saveStatus === 'saving' ? 'Updating...' : 'Update Password'}
                      </button>
                      
                      {saveStatus === 'success' && (
                        <span className="ml-3 text-green-600 text-sm">
                          Password updated successfully!
                        </span>
                      )}
                    </div>
                  </form>
                </div>
                
                {/* Two-Factor Authentication */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 font-medium">
                      Set Up
                    </button>
                  </div>
                </div>
                
                {/* Login History */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Recent Login Activity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Today, 9:41 AM</p>
                        <p className="text-xs text-gray-500">Nairobi, Kenya • Chrome on Windows</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Current
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Yesterday, 6:30 PM</p>
                        <p className="text-xs text-gray-500">Nairobi, Kenya • Safari on iPhone</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">March 3, 2025, 2:15 PM</p>
                        <p className="text-xs text-gray-500">Nairobi, Kenya • Chrome on Windows</p>
                      </div>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-3">
                    View All Activity
                  </button>
                </div>
                
                {/* Account Deletion */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-md font-medium text-gray-900 mb-1">Delete Account</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-300 rounded-md hover:bg-red-100 font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Preferences Settings */}
          {activeTab === 'preferences' && (
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Display & Accessibility Preferences</h2>
              
              <div className="space-y-6 max-w-md">
                {/* Language */}
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select 
                    id="language" 
                    name="language" 
                    value={preferences.language} 
                    onChange={handlePreferencesChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="swahili">Swahili</option>
                  </select>
                </div>
                
                {/* Theme */}
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <select 
                    id="theme" 
                    name="theme" 
                    value={preferences.theme} 
                    onChange={handlePreferencesChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                
                {/* Accessibility */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Accessibility Options</h3>
                  
                  <div className="space-y-3">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="highContrast" 
                      name="accessibility.highContrast" 
                      checked={preferences.accessibility.highContrast} 
                      onChange={handlePreferencesChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="highContrast" className="ml-2 block text-sm text-gray-700">
                      High Contrast Mode
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="largeText" 
                      name="accessibility.largeText" 
                      checked={preferences.accessibility.largeText} 
                      onChange={handlePreferencesChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="largeText" className="ml-2 block text-sm text-gray-700">
                      Larger Text
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="screenReader" 
                      name="accessibility.screenReader" 
                      checked={preferences.accessibility.screenReader} 
                      onChange={handlePreferencesChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="screenReader" className="ml-2 block text-sm text-gray-700">
                      Screen Reader Support
                    </label>
                  </div>
                </div>
                </div>
                
                {/* Save Preferences Button */}
                <div className="pt-6">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    onClick={handleSavePreferences}
                  >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Preferences'}
                  </button>
                  
                  {saveStatus === 'success' && (
                    <span className="ml-3 text-green-600 text-sm">
                      Preferences saved successfully!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientSettings;