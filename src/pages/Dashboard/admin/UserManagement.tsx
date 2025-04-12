// src/pages/admin/UserManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  X,
  Check,
  Users,
  UserPlus,
  Shield,
  Clock
} from 'lucide-react';

// Import the API hooks
import { User, UserFilter, usersApi} from '../../../store/api/userManagementApi';

// Define user types (adjusted for API usage)
type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient';
type ActivityType = 'create' | 'update' | 'delete' | 'login';

// Refactor the interface to match API response structure
interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department?: string;
  status: 'active' | 'inactive' | 'pending';
  password?: string; // For new users
}

interface Activity {
  id: number;
  type: ActivityType; // Make sure this matches your backend enum
  userId: number; // If your API provides this
  userName: string; // Changed from optional to required
  details?: string; // For any additional information 
  createdAt: string; // ISO date string from the backend
  description?: string;
  user?: string;
  timeAgo?: string;
}
const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for search, filtering, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'pending' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  // State for the modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'doctor',
    department: '',
    status: 'active',
    password: '',
  });

  // Prepare filter params for API
  const userFilters: UserFilter = {
    search: searchTerm || undefined,
    role: selectedRole !== 'all' ? selectedRole : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    page: currentPage,
    limit: usersPerPage,
  };

  // RTK Query hooks
  const { 
    data: usersData, 
    isLoading: isLoadingUsers, 
    isFetching: isFetchingUsers 
  } = usersApi.useGetUsersQuery(userFilters);
  
  const { 
    data: userStats,
    isLoading: isLoadingStats 
  } = usersApi.useGetUserStatsQuery();

  const { 
    data: userActivities,
    isLoading: isLoadingActivities 
  } = usersApi.useGetUserActivitiesQuery();
  
  const [createUser, { isLoading: isCreatingUser }] = usersApi.useCreateUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = usersApi.useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = usersApi.useDeleteUserMutation();

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedStatus]);

  // Get current users from API response
  const currentUsers = usersData?.data || [];
  const totalPages = usersData?.pagination.totalPages || 1;
  const totalUsers = usersData?.pagination.total || 0;

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Role badge color map
  const roleBadgeColors: Record<UserRole, { bg: string; text: string }> = {
    admin: { bg: 'bg-purple-100', text: 'text-purple-800' },
    doctor: { bg: 'bg-blue-100', text: 'text-blue-800' },
    nurse: { bg: 'bg-green-100', text: 'text-green-800' },
    receptionist: { bg: 'bg-amber-100', text: 'text-amber-800' },
    patient: { bg: 'bg-gray-100', text: 'text-gray-800' }
  };

  // Status badge color map
  const statusBadgeColors: Record<'active' | 'inactive' | 'pending', { bg: string; text: string }> = {
    active: { bg: 'bg-green-100', text: 'text-green-800' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-800' },
    pending: { bg: 'bg-amber-100', text: 'text-amber-800' }
  };

  // Handle adding a new user
  const handleAddUser = async () => {
    try {
      await createUser({ 
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        status: newUser.status,
        password: newUser.password || 'defaultPassword123' // You might want to handle this differently
      });
      
      // Reset form
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        role: 'doctor',
        department: '',
        status: 'active',
        password: '',
      });
      
      setIsAddUserModalOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Handle editing a user
  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      await updateUser({ 
        id: editingUser.id, 
        user: {
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email,
          role: editingUser.role,
          department: editingUser.department,
          status: editingUser.status,
        }
      });
      
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };
  
  // Helper to format name
  const formatName = (user: User) => {
    return `${user.firstName} ${user.lastName}`;
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'create':
        return <UserPlus size={16} className="text-blue-600" />;
      case 'update':
        return <Edit2 size={16} className="text-amber-600" />;
      case 'delete':
        return <Trash2 size={16} className="text-red-600" />;
      case 'login':
        return <Check size={16} className="text-green-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getActivityIconClass = (type: ActivityType) => {
    switch (type) {
      case 'create':
        return 'bg-blue-100';
      case 'update':
        return 'bg-amber-100';
      case 'delete':
        return 'bg-red-100';
      case 'login':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Add this function before the return statement
const getFormattedActivities = () => {
  if (!userActivities) return [];
  
  return userActivities.map(activity => {
    // Format the activity for display
    let description = '';
    let user = activity.userName || `User ${activity.userId}`;
    
    // Format the description based on activity type
    switch(activity.type) {
      case 'create':
        description = 'New user registered';
        break;
      case 'update':
        description = 'User profile updated';
        break;
      case 'delete':
        description = 'User account deleted';
        break;
      case 'login':
        description = 'User logged in';
        break;
      default:
        description = 'User activity recorded';
    }
    
    // Calculate time ago
    const timeAgo = formatTimeAgo(new Date(activity.createdAt));
    
    return {
      ...activity,
      description,
      user,
      timeAgo
    };
  });
};

// Helper function to format relative time
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
};

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Users className="mr-2" size={24} />
            User Management
          </h2>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
          >
            <UserPlus size={18} className="mr-2" />
            Add New User
          </button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="relative md:w-64">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex flex-wrap items-center space-x-2 space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <Filter size={18} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-500 mr-2">Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
                <option value="patient">Patient</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'active' | 'inactive' | 'pending' | 'all')}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            {(searchTerm || selectedRole !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={resetFilters}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <X size={16} className="mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : currentUsers.length > 0 ? (
                currentUsers.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatName(user)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${roleBadgeColors[user.role as UserRole]?.bg || 'bg-gray-100'} ${roleBadgeColors[user.role as UserRole]?.text || 'text-gray-800'}`}>
                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.department || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusBadgeColors[user.status]?.bg || ''} ${statusBadgeColors[user.status]?.text || ''}`}>
                      {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.lastLogin || 'Never'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isDeletingUser}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoadingUsers && totalUsers > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => paginate(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1 || isFetchingUsers}
                className={`p-2 rounded-md ${currentPage === 1 || isFetchingUsers ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => Math.abs(page - currentPage) < 3 || page === 1 || page === totalPages)
                .map((page, index, array) => {
                  // Add ellipsis when there are pages skipped
                  const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                  const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                  
                  return (
                    <React.Fragment key={page}>
                      {showEllipsisBefore && <span className="px-3 py-1">...</span>}
                      <button
                        onClick={() => paginate(page)}
                        disabled={isFetchingUsers}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                      {showEllipsisAfter && <span className="px-3 py-1">...</span>}
                    </React.Fragment>
                  );
                })}
              <button
                onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages || isFetchingUsers}
                className={`p-2 rounded-md ${currentPage === totalPages || isFetchingUsers ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="patient">Patient</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {(newUser.role === 'doctor' || newUser.role === 'nurse') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newUser.department || ''}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={newUser.status === 'active'}
                      onChange={() => setNewUser({ ...newUser, status: 'active' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={newUser.status === 'inactive'}
                      onChange={() => setNewUser({ ...newUser, status: 'inactive' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Inactive</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="pending"
                      checked={newUser.status === 'pending'}
                      onChange={() => setNewUser({ ...newUser, status: 'pending' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pending</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  disabled={isCreatingUser || !newUser.firstName || !newUser.lastName || !newUser.email}
                >
                  {isCreatingUser ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      Add User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={editingUser.firstName}
                  onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editingUser.lastName}
                  onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="patient">Patient</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {(editingUser.role === 'doctor' || editingUser.role === 'nurse') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editingUser.department || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="edit-status"
                      value="active"
                      checked={editingUser.status === 'active'}
                      onChange={() => setEditingUser({ ...editingUser, status: 'active' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="edit-status"
                      value="inactive"
                      checked={editingUser.status === 'inactive'}
                      onChange={() => setEditingUser({ ...editingUser, status: 'inactive' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Inactive</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="edit-status"
                      value="pending"
                      checked={editingUser.status === 'pending'}
                      onChange={() => setEditingUser({ ...editingUser, status: 'pending' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pending</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  disabled={isUpdatingUser || !editingUser.firstName || !editingUser.lastName || !editingUser.email}
                >
                  {isUpdatingUser ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold mt-1">{isLoadingStats ? '...' : userStats?.totalUsers}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold mt-1">
                {isLoadingStats ? '...' : userStats?.activeUsers}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Check size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-semibold mt-1">
                {isLoadingStats ? '...' : userStats?.pendingApprovals}
              </p>
            </div>
            <div className="bg-amber-100 rounded-full p-3">
              <Clock size={24} className="text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Admin Users</p>
              <p className="text-2xl font-semibold mt-1">
                {isLoadingStats ? '...' : userStats?.adminUsers}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Shield size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">User Role Distribution</h3>
          {isLoadingStats ? (
            <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
              <p className="text-gray-500">Loading role distribution...</p>
            </div>
          ) : (
            <>
              <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Role Distribution Chart</p>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-4">
                {Object.entries(userStats?.roleDistribution || {}).map(([role, count]) => (
                  <div key={role} className="flex flex-col items-center">
                    <div className={`h-2 w-full ${roleBadgeColors[role as UserRole]?.bg || 'bg-gray-100'} rounded-full mb-1`}></div>
                    <span className="text-xs text-gray-600 capitalize">{role}</span>
                    <span className="text-sm font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-medium mb-4">Recent User Activities</h3>
  {isLoadingActivities ? (
    <div className="text-center py-4">
      <p className="text-gray-500">Loading activities...</p>
    </div>
  ) : userActivities && userActivities.length > 0 ? (
    <div className="space-y-4">
      {getFormattedActivities().slice(0, 4).map((activity, index) => (
        <div key={index} className="flex items-start">
          <div className={`rounded-full p-2 mr-3 ${getActivityIconClass(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div>
            <p className="text-sm font-medium">{activity.description}</p>
            <p className="text-xs text-gray-500">{activity.user} - {activity.timeAgo}</p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-4">
      <p className="text-gray-500">No recent activities</p>
    </div>
  )}
  <button 
    onClick={() => navigate('/admin/activities')} 
    className="mt-4 w-full text-blue-600 text-sm font-medium py-2 border border-blue-200 rounded-md hover:bg-blue-50"
  >
    View All Activities
  </button>
</div>
      </div>
    </div>
  );
};

export default UserManagementPage;