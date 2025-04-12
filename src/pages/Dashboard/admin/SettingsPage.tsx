import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Save,
  Upload
} from 'lucide-react';
import { 
  settingsApi, 
  SystemSettings,
  UpdateSystemSettingsRequest,
  ChangePasswordRequest
} from '../../../store/api/SettingsApi';
import { toast } from 'react-toastify'; // Make sure this is installed

const AdminSettingsPage: React.FC = () => {
  // Use RTK Query hooks
  const { 
    data: settings, 
    isLoading, 
    error 
  } = settingsApi.useGetSystemSettingsQuery();

  const [updateSettings] = settingsApi.useUpdateSystemSettingsMutation();
  const [changePassword] = settingsApi.useChangePasswordMutation();
  const [updateProfileImage] = settingsApi.useUpdateProfileImageMutation();
  const [toggleMaintenanceMode] = settingsApi.useToggleMaintenanceModeMutation();

  // Local state for form inputs
  const [formData, setFormData] = useState<UpdateSystemSettingsRequest>({});
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update local state when settings are fetched
  useEffect(() => {
    if (settings) {
      setFormData({
        adminName: settings.adminName,
        adminEmail: settings.adminEmail,
        emailNotifications: settings.emailNotifications,
        appNotifications: settings.appNotifications,
        twoFactorAuth: settings.twoFactorAuth,
        autoLogoutTime: settings.autoLogoutTime,
        maintenanceMode: settings.maintenanceMode,
        darkMode: settings.darkMode,
        databaseBackupFrequency: settings.databaseBackupFrequency,
        logLevel: settings.logLevel,
        language: settings.language,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat
      });
    }
  }, [settings]);

  // Handler for saving settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData).unwrap();
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Settings save error:', error);
    }
  };

  // Handler for changing password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await changePassword(passwordData).unwrap();
      toast.success('Password changed successfully!');
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to change password');
      console.error('Password change error:', error);
    }
  };

  // Handler for profile image upload
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        await updateProfileImage(formData).unwrap();
        toast.success('Profile image updated successfully!');
      } catch (error) {
        toast.error('Failed to update profile image');
        console.error('Profile image upload error:', error);
      }
    }
  };

  // Render loading state
  if (isLoading) return <div>Loading settings...</div>;
  if (error) return <div>Error loading settings</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          <nav className="space-y-1">
            <a href="#account" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
              <User className="mr-3 h-5 w-5 text-blue-500" />
              Account Settings
            </a>
            <a href="#notifications" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
              <Bell className="mr-3 h-5 w-5 text-gray-400" />
              Notifications
            </a>
            <a href="#security" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
              <Shield className="mr-3 h-5 w-5 text-gray-400" />
              Security
            </a>
            <a href="#system" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
              <Database className="mr-3 h-5 w-5 text-gray-400" />
              System
            </a>
            <a href="#localization" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
              <Globe className="mr-3 h-5 w-5 text-gray-400" />
              Localization
            </a>
          </nav>
        </div>
        
        {/* Settings Forms */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveSettings}>
            {/* Account Settings */}
            <div id="account" className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">Admin Name</label>
                  <input 
                    type="text" 
                    id="adminName" 
                    name="adminName" 
                    value={formData.adminName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    id="adminEmail" 
                    name="adminEmail" 
                    value={formData.adminEmail || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Profile Image</label>
                  <div className="mt-1 flex items-center">
                    <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                      <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </span>
                    <input 
                      type="file" 
                      id="profile-image" 
                      name="profile-image" 
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                    />
                    <label 
                      htmlFor="profile-image"
                      className="ml-5 flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div id="notifications" className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="email-notifications" className="font-medium text-gray-700">Email Notifications</label>
                    <p className="text-sm text-gray-500">Receive system alerts and updates via email</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      type="button"
                      className={`${
                        formData.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      onClick={() => setFormData(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                    >
                      <span className="sr-only">Toggle email notifications</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          formData.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      ></span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="app-notifications" className="font-medium text-gray-700">In-App Notifications</label>
                    <p className="text-sm text-gray-500">Receive notifications within the dashboard</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      type="button"
                      className={`${
                        formData.appNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      onClick={() => setFormData(prev => ({ ...prev, appNotifications: !prev.appNotifications }))}
                    >
                      <span className="sr-only">Toggle app notifications</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          formData.appNotifications ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Security */}
            <div id="security" className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input 
                    type="password" 
                    id="currentPassword" 
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input 
                    type="password" 
                    id="newPassword" 
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Change Password
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="two-factor" className="font-medium text-gray-700">Two-Factor Authentication</label>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      type="button"
                      className={`${
                        formData.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      onClick={() => setFormData(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
                    >
                      <span className="sr-only">Toggle two-factor authentication</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          formData.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      ></span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="autoLogoutTime" className="block text-sm font-medium text-gray-700">Auto Logout (minutes)</label>
                  <select
                    id="autoLogoutTime"
                    name="autoLogoutTime"
                    value={formData.autoLogoutTime?.toString() || '30'}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoLogoutTime: parseInt(e.target.value) }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="0">Never</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* System */}
            <div id="system" className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">System Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="maintenance-mode" className="font-medium text-gray-700">Maintenance Mode</label>
                    <p className="text-sm text-gray-500">Take the system offline for maintenance</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      type="button"
                      className={`${
                        formData.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      onClick={async () => {
                        try {
                          const result = await toggleMaintenanceMode(!formData.maintenanceMode).unwrap();
                          setFormData(prev => ({ ...prev, maintenanceMode: result.maintenanceMode }));
                          toast.success(`Maintenance mode ${result.maintenanceMode ? 'enabled' : 'disabled'}`);
                        } catch (error) {
                          toast.error('Failed to toggle maintenance mode');
                          console.error('Maintenance mode toggle error:', error);
                        }
                      }}
                    >
                      <span className="sr-only">Toggle maintenance mode</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          formData.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      ></span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="dark-mode" className="font-medium text-gray-700">Dark Mode</label>
                    <p className="text-sm text-gray-500">Use dark theme for the admin dashboard</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      type="button"
                      className={`${
                        formData.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      onClick={() => setFormData(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                    >
                      <span className="sr-only">Toggle dark mode</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          formData.darkMode ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      ></span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="databaseBackupFrequency" className="block text-sm font-medium text-gray-700">Database Backup Frequency</label>
                  <select
                    id="databaseBackupFrequency"
                    name="databaseBackupFrequency"
                    value={formData.databaseBackupFrequency || 'daily'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      databaseBackupFrequency: e.target.value as 'hourly' | 'daily' | 'weekly' | 'monthly' 
                    }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="hourly">Every Hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="logLevel" className="block text-sm font-medium text-gray-700">System Log Level</label>
                  <select
                    id="logLevel"
                    name="logLevel"
                    value={formData.logLevel || 'info'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      logLevel: e.target.value as 'error' | 'warn' | 'info' | 'debug' 
                    }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="error">Error Only</option>
                    <option value="warn">Warnings & Errors</option>
                    <option value="info">Info, Warnings & Errors</option>
                    <option value="debug">Debug (All)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Localization */}
            <div id="localization" className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Localization Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">System Language</label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language || 'english'}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="chinese">Chinese</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Timezone</label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={formData.timezone || 'utc'}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="utc">UTC</option>
                    <option value="est">Eastern Time (EST)</option>
                    <option value="cst">Central Time (CST)</option>
                    <option value="mst">Mountain Time (MST)</option>
                    <option value="pst">Pacific Time (PST)</option>
                    <option value="gmt">Greenwich Mean Time (GMT)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">Date Format</label>
                  <select
                    id="dateFormat"
                    name="dateFormat"
                    value={formData.dateFormat || 'mm-dd-yyyy'}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateFormat: e.target.value }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="mm-dd-yyyy">MM-DD-YYYY</option>
                    <option value="dd-mm-yyyy">DD-MM-YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700">Time Format</label>
                  <select
                    id="timeFormat"
                    name="timeFormat"
                    value={formData.timeFormat || '12hour'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      timeFormat: e.target.value as '12hour' | '24hour' 
                    }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="12hour">12-hour (AM/PM)</option>
                    <option value="24hour">24-hour</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;