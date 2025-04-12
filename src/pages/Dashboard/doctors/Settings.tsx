import React, { useState } from 'react';
import { User, Bell, Lock, Monitor, Shield, Moon, Sun, Accessibility } from 'lucide-react';
import { ChangePasswordRequest, settingsApi, SystemSettings, UpdateSystemSettingsRequest } from '../../../store/api/SettingsApi';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const SettingsPage: React.FC = () => {
  // Fetch system settings
  const { data: systemSettings, isLoading: isSettingsLoading, error: settingsError } = settingsApi.useGetSystemSettingsQuery();
  
  // Mutations
  const [updateSystemSettings, { isLoading: isUpdatingSettings }] = settingsApi.useUpdateSystemSettingsMutation();
  const [changePassword, { isLoading: isChangingPassword, error: changePasswordError }] = settingsApi.useChangePasswordMutation();
  const [updateProfileImage, { isLoading: isUpdatingImage }] = settingsApi.useUpdateProfileImageMutation();
  const [toggleMaintenanceMode, { isLoading: isTogglingMaintenance }] = settingsApi.useToggleMaintenanceModeMutation();
  const [triggerDatabaseBackup, { isLoading: isTriggeringBackup, error: backupError }] = settingsApi.useTriggerDatabaseBackupMutation();
  
  // Fetch system logs (example: fetch info level logs, page 1, 10 items)
  const { data: systemLogs, isLoading: isLogsLoading } = settingsApi.useGetSystemLogsQuery({ level: 'info', page: 1, limit: 10 });

  // Active section state
  const [activeSection, setActiveSection] = useState<string>('profile');
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Sections for the settings page
  const sections: SettingsSection[] = [
    { id: 'profile', title: 'Profile Settings', icon: <User size={20} /> },
    { id: 'notifications', title: 'Notifications', icon: <Bell size={20} /> },
    { id: 'security', title: 'Security & Privacy', icon: <Lock size={20} /> },
    { id: 'appearance', title: 'Appearance', icon: <Monitor size={20} /> },
    { id: 'accessibility', title: 'Accessibility', icon: <Accessibility size={20} /> },
    { id: 'permissions', title: 'Permissions', icon: <Shield size={20} /> },
  ];

  // Handle notification settings change
  const handleNotificationChange = async (setting: keyof Pick<SystemSettings, 'emailNotifications' | 'appNotifications'>) => {
    if (!systemSettings) return;
    const updatedValue = !systemSettings[setting];
    const update: UpdateSystemSettingsRequest = { [setting]: updatedValue };
    try {
      await updateSystemSettings(update).unwrap();
    } catch (error) {
      console.error(`Failed to update ${setting}:`, error);
    }
  };

  // Handle profile settings change
  const handleProfileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!systemSettings) return;
    const { name, value } = e.target;
    const update: UpdateSystemSettingsRequest = { [name]: value };
    try {
      await updateSystemSettings(update).unwrap();
    } catch (error) {
      console.error(`Failed to update ${name}:`, error);
    }
  };

  // Handle theme toggle
  const toggleTheme = async () => {
    if (!systemSettings) return;
    const updatedDarkMode = !systemSettings.darkMode;
    try {
      await updateSystemSettings({ darkMode: updatedDarkMode }).unwrap();
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }
    try {
      const result = await changePassword(passwordForm).unwrap();
      if (result.success) {
        alert(result.message);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  // Handle profile image upload
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      await updateProfileImage(formData).unwrap();
    } catch (error) {
      console.error('Failed to update profile image:', error);
    }
  };

  // Handle maintenance mode toggle
  const handleToggleMaintenanceMode = async () => {
    if (!systemSettings) return;
    try {
      await toggleMaintenanceMode(!systemSettings.maintenanceMode).unwrap();
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
    }
  };

  // Handle database backup
  const handleTriggerBackup = async () => {
    try {
      const result = await triggerDatabaseBackup().unwrap();
      if (result.success) {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to trigger database backup:', error);
    }
  };

  // Render content based on active section
  const renderSectionContent = () => {
    if (isSettingsLoading) return <div>Loading settings...</div>;
    if (settingsError) return <div>Error loading settings: {JSON.stringify(settingsError)}</div>;
    if (!systemSettings) return <div>No settings data available</div>;

    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="adminName"
                  name="adminName"
                  value={systemSettings.adminName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  name="adminEmail"
                  value={systemSettings.adminEmail}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-xl">
                    {systemSettings.adminName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Change Photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                      disabled={isUpdatingImage}
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG or GIF. 1MB max size.</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={systemSettings.emailNotifications}
                    onChange={() => handleNotificationChange('emailNotifications')}
                    disabled={isUpdatingSettings}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">App Notifications</h4>
                  <p className="text-sm text-gray-500">Receive in-app notifications for critical alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={systemSettings.appNotifications}
                    onChange={() => handleNotificationChange('appNotifications')}
                    disabled={isUpdatingSettings}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Security Settings</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Change Password</h4>
                <form className="space-y-4" onSubmit={handlePasswordChange}>
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  {changePasswordError && (
                    <p className="text-red-500 text-sm">{JSON.stringify(changePasswordError)}</p>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={systemSettings.twoFactorAuth}
                      onChange={() => updateSystemSettings({ twoFactorAuth: !systemSettings.twoFactorAuth })}
                      disabled={isUpdatingSettings}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Session Management</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Current Session</p>
                      <p className="text-xs text-gray-500">Windows • Chrome • Last active: Just now</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Appearance Settings</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Theme</h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    {systemSettings.darkMode ? <Moon size={20} className="text-gray-700 mr-3" /> : <Sun size={20} className="text-yellow-500 mr-3" />}
                    <span className="text-sm font-medium">{systemSettings.darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={systemSettings.darkMode}
                      onChange={toggleTheme}
                      disabled={isUpdatingSettings}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Dashboard Layout</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-md p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                    <div className="w-full h-20 mb-2 bg-gray-200 rounded flex flex-col">
                      <div className="h-3 w-full bg-gray-300 rounded-t"></div>
                      <div className="flex-1 flex">
                        <div className="w-1/4 bg-gray-300 h-full"></div>
                        <div className="w-3/4 p-1">
                          <div className="h-2 w-full bg-gray-300 rounded mb-1"></div>
                          <div className="h-2 w-3/4 bg-gray-300 rounded mb-1"></div>
                          <div className="h-2 w-1/2 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-center">Default View</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                    <div className="w-full h-20 mb-2 bg-gray-200 rounded flex flex-col">
                      <div className="h-3 w-full bg-gray-300 rounded-t"></div>
                      <div className="flex-1 flex">
                        <div className="w-1/5 bg-gray-300 h-full"></div>
                        <div className="w-4/5 p-1 grid grid-cols-2 gap-1">
                          <div className="bg-gray-300 rounded"></div>
                          <div className="bg-gray-300 rounded"></div>
                          <div className="bg-gray-300 rounded"></div>
                          <div className="bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-center">Grid View</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Color Scheme</h4>
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer ring-2 ring-offset-2 ring-blue-500"></div>
                  <div className="w-8 h-8 rounded-full bg-green-500 cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-red-500 cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-gray-700 cursor-pointer"></div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'accessibility':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Accessibility Settings</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Text Size</h4>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">A</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    defaultValue="3"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg">A</span>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Contrast Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="default-contrast"
                      name="contrast"
                      type="radio"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="default-contrast" className="ml-3 block text-sm font-medium text-gray-700">
                      Default
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="high-contrast"
                      name="contrast"
                      type="radio"
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="high-contrast" className="ml-3 block text-sm font-medium text-gray-700">
                      High Contrast
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Animation Settings</h4>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Reduce motion when possible</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'permissions':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">System Permissions</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-4">System Settings</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                    <p className="text-xs text-gray-500">Enable to restrict access during updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={systemSettings.maintenanceMode}
                      onChange={handleToggleMaintenanceMode}
                      disabled={isTogglingMaintenance}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Database Backup</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Backup Frequency</p>
                    <select
                      value={systemSettings.databaseBackupFrequency}
                      onChange={(e) => updateSystemSettings({ databaseBackupFrequency: e.target.value as SystemSettings['databaseBackupFrequency'] })}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <button
                    onClick={handleTriggerBackup}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isTriggeringBackup}
                  >
                    {isTriggeringBackup ? 'Backing up...' : 'Trigger Backup Now'}
                  </button>
                </div>
                {backupError && <p className="text-red-500 text-sm mt-2">{JSON.stringify(backupError)}</p>}
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">System Logs</h4>
                <div className="bg-white border border-gray-200 rounded-md">
                  {isLogsLoading ? (
                    <p>Loading logs...</p>
                  ) : systemLogs ? (
                    systemLogs.logs.map((log, index) => (
                      <div key={index} className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-700">{log}</p>
                      </div>
                    ))
                  ) : (
                    <p>No logs available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a section to view settings</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
      <div className="px-6 py-5">
        <h2 className="text-lg font-medium text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences.</p>
      </div>
      
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Settings navigation */}
          <div className="col-span-1 bg-gray-50 rounded-md p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center px-3 py-2 w-full text-sm font-medium rounded-md ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{section.icon}</span>
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Settings content */}
          <div className="col-span-3">
            <div className="bg-white p-6 rounded-md border border-gray-200">
              {renderSectionContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;