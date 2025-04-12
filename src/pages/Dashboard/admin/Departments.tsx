// src/pages/admin/DepartmentsPage.tsx
import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  X,
  Check,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { departmentApi, DepartmentResponse } from '../../../store/api/departmentsApi';

interface HeadDoctor {
  firstName: string;
  lastName: string;
}

interface DepartmentData {
  id?: number;
  name: string;
  description: string;
  staffCount: number;
  appointmentsPerMonth: number;
  status: string;
}

interface Department {
  id?: number;
  department?: DepartmentData;
  headDoctor?: HeadDoctor;
  name: string;
  description?: string;
  head?: string;
  staffCount: number;
  appointmentsPerMonth: number;
  status: 'active' | 'inactive';
}


// Define a complete department with defaults for UI
const emptyDepartment: Department = {
  name: '',
  description: '',
  head: '',
  staffCount: 0,
  appointmentsPerMonth: 0,
  status: 'active'
};

const DepartmentsPage: React.FC = () => {
  // State for UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDepartment, setCurrentDepartment] = useState<Department>(emptyDepartment);

  // RTK Query hooks
  const { data: departments = [], isLoading, error } = departmentApi.useGetDepartmentsQuery({ limit: 100});
  const [createDepartment, { isLoading: isCreating }] = departmentApi.useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = departmentApi.useUpdateDepartmentMutation();
  const [deleteDepartment] = departmentApi.useDeleteDepartmentMutation();

  useEffect(() => {
    console.log("Department before edit:", currentDepartment);
  }, [currentDepartment]);

  // Filtered departments based on search term
  const filteredDepartments = departments.filter(dept => 
    (dept.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (dept.head?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalStaff = departments.reduce((sum, dept) => sum + (dept.staffCount || 0), 0);
  const totalAppointments = departments.reduce((sum, dept) => sum + (dept.appointmentsPerMonth || 0), 0);

  // Handle opening the "add department" modal
  const handleAddNew = () => {
    setCurrentDepartment(emptyDepartment);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Handle editing a department
  // Handle editing a department
const handleEdit = (department: Department | DepartmentResponse) => {
  console.log("Department to edit:", department);
  
  // Determine if we're dealing with a nested response
  if ('department' in department && department.department) {
    // It's a DepartmentResponse
    const departmentData: Department = {
      id: department.department.id,
      name: department.department.name,
      description: department.department.description || '',
      head: department.headDoctor ? `Dr. ${department.headDoctor.firstName} ${department.headDoctor.lastName}` : '',
      staffCount: department.department.staffCount,
      appointmentsPerMonth: department.department.appointmentsPerMonth,
      status: (department.department.status === 'inactive' ? 'inactive' : 'active')
    };
    
    console.log("Prepared nested department data:", departmentData);
    setCurrentDepartment(departmentData);
  } else {
    // It's a direct Department object
    const departmentData: Department = {
      id: (department as Department).id,
      name: (department as Department).name,
      description: (department as Department).description || '',
      head: (department as Department).head || '',
      staffCount: (department as Department).staffCount || 0,
      appointmentsPerMonth: (department as Department).appointmentsPerMonth || 0,
      status: (department as Department).status || 'active'
    };
    
    console.log("Prepared direct department data:", departmentData);
    setCurrentDepartment(departmentData);
  }
  
  setIsEditing(true);
  setIsModalOpen(true);
};

  // Handle saving a department (create or update)
  const handleSave = async () => {
    try {
      console.log("Saving department:");
      console.log("isEditing:", isEditing);
      console.log("Department ID:", currentDepartment.id);
      console.log("Department data:", currentDepartment);
  
      if (isEditing && currentDepartment.id) {
        console.log("Updating existing department with ID:", currentDepartment.id);
        
        await updateDepartment({
          id: currentDepartment.id,
          department: currentDepartment
        }).unwrap();
        
        console.log("Update successful");
      } else {
        console.log("Creating new department");
        await createDepartment(currentDepartment).unwrap();
        console.log("Creation successful");
      }
      
      // Close modal and reset form
      setIsModalOpen(false);
      setCurrentDepartment(emptyDepartment);
    } catch (error) {
      console.error('Failed to save department:', error);
    }
  };

  // Handle deleting a department
  const handleDelete = async (id: number) => {
    console.log('handleDelete called with ID:', id);
    
    const confirmResult = window.confirm('Are you sure you want to delete this department?');
    console.log('Confirmation result:', confirmResult);
    
    if (confirmResult) {
      try {
        console.log('Attempting to delete department with ID:', id);
        const result = await deleteDepartment(id).unwrap();
        console.log('Delete result:', result);
      } catch (error) {
        console.error('Failed to delete department:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Building2 className="mr-2" size={24} />
            Departments Management
          </h2>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            Add Department
          </button>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-64 mb-6">
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <p className="text-sm text-red-700">Failed to load departments. Please try again later.</p>
              </div>
            </div>
          </div>
        )}

        {/* Departments Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments/Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No departments found
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((department) => (
                    <tr key={department.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{department.name}</div>
                            <div className="text-xs text-gray-500">{department.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{department.head || 'Not assigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Users size={16} className="mr-2 text-blue-500" />
                          {department.staffCount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar size={16} className="mr-2 text-green-500" />
                          {department.appointmentsPerMonth || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          department.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {department.status ? department.status.charAt(0).toUpperCase() + department.status.slice(1) : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
  onClick={() => {
    // Ensure status is never undefined by providing a default
    const departmentWithDefaults = {
      ...department,
      status: department.status || 'active' // Default to 'active' if undefined
    };
    handleEdit(departmentWithDefaults);
  }}
  className="text-indigo-600 hover:text-indigo-900 mr-3"
>
  <Edit2 size={16} />
</button>
                        <button
  onClick={() => {
    console.log('Delete button clicked for department:', department);
    if (department.id) {
      console.log('Department ID exists, calling handleDelete with ID:', department.id);
      handleDelete(department.id);
    } else {
      console.log('Department ID is missing!');
    }
  }}
  className="text-red-600 hover:text-red-900"
  disabled={!department.id}
>
  <Trash2 size={16} />
</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Department Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Departments</p>
              <p className="text-2xl font-semibold mt-1">{departments.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Building2 size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Staff</p>
              <p className="text-2xl font-semibold mt-1">{totalStaff}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Appointments</p>
              <p className="text-2xl font-semibold mt-1">{totalAppointments}</p>
            </div>
            <div className="bg-amber-100 rounded-full p-3">
              <Calendar size={24} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Department Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={currentDepartment.name}
                  onChange={(e) => setCurrentDepartment({ ...currentDepartment, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Cardiology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={currentDepartment.description || ''}
                  onChange={(e) => setCurrentDepartment({ ...currentDepartment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of department"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Head
                </label>
                <input
                  type="text"
                  value={currentDepartment.head || ''}
                  onChange={(e) => setCurrentDepartment({ ...currentDepartment, head: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Dr. Sarah Johnson"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Count
                  </label>
                  <input
                    type="number"
                    value={currentDepartment.staffCount || 0}
                    onChange={(e) => setCurrentDepartment({ 
                      ...currentDepartment, 
                      staffCount: parseInt(e.target.value) || 0 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Appointments
                  </label>
                  <input
                    type="number"
                    value={currentDepartment.appointmentsPerMonth || 0}
                    onChange={(e) => setCurrentDepartment({ 
                      ...currentDepartment, 
                      appointmentsPerMonth: parseInt(e.target.value) || 0 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      checked={currentDepartment.status === 'active'}
                      onChange={() => setCurrentDepartment({ ...currentDepartment, status: 'active' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      checked={currentDepartment.status === 'inactive'}
                      onChange={() => setCurrentDepartment({ ...currentDepartment, status: 'inactive' })}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  disabled={!currentDepartment.name || isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      {isEditing ? 'Update Department' : 'Add Department'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;