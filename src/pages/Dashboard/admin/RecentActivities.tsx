// src/pages/Dashboard/admin/RecentActivities.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Clock, 
  Users,
  Check,
  AlertCircle,
  Download,
  Flag,
  Settings,
  Database,
  Edit,
  X,
  User,
  Calendar,
  Bell,
  Loader
} from 'lucide-react';
import { activitiesApi } from '../../../store/api/activitiesApi';

const RecentActivitiesPage: React.FC = () => {
  // State for filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [timeFrame, setTimeFrame] = useState('24h');
  
  // Fetch data using RTK Query
  const { 
    data: activitiesResponse, 
    isLoading, 
    error,
    refetch
  } = activitiesApi.useGetActivitiesQuery({
    page,
    limit,
    type: selectedType
  });

  // Ensure we have arrays even if the API fails
  const activities = activitiesResponse?.data || [];
  const pagination = activitiesResponse?.pagination || {
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 10
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // You would typically debounce this and then update your query parameters
  };

  // Handle category filter change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedType(value === 'all' ? undefined : value);
    setPage(1); // Reset to first page when filter changes
  };

  // Handle time frame filter change
  const handleTimeFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFrame(e.target.value);
    setPage(1); // Reset to first page when filter changes
    // Note: Your API might need to handle this timeFrame parameter
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  // Get appropriate icon for activity type
  const getActivityIcon = (type: string, importance: string) => {
    switch (type) {
      case 'user_management':
        return <Users size={16} className="text-blue-500" />;
      case 'system':
        return <Database size={16} className="text-amber-500" />;
      case 'appointment':
        return <Calendar size={16} className="text-blue-500" />;
      case 'medical_record':
        return <Edit size={16} className="text-green-500" />;
      case 'prescription':
        return <Edit size={16} className="text-purple-500" />;
      case 'incident':
        return <Flag size={16} className="text-red-500" />;
      case 'notification':
        return <Bell size={16} className="text-amber-500" />;
      default:
        // Use importance level for default icons
        if (importance === 'high' || importance === 'urgent') {
          return <AlertCircle size={16} className="text-red-500" />;
        } else if (importance === 'normal') {
          return <Check size={16} className="text-green-500" />;
        } else {
          return <Bell size={16} className="text-gray-500" />;
        }
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

  // Handle retry when data loading fails
  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/admin" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Recent Activities</h1>
        </div>
        <Link to="/" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Back to Homepage
        </Link>
      </div>

      {/* Activity summary - could be augmented with API data for counts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-gray-700">Total Activities</h3>
          <p className="text-3xl font-bold mt-2">{pagination.total || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Based on current filters</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-blue-700">System</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {activities.filter(a => a.type === 'system').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">System activities</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-green-700">Clinical</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {activities.filter(a => ['medical_record', 'prescription', 'appointment'].includes(a.type)).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Clinical activities</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-amber-700">High Priority</h3>
          <p className="text-3xl font-bold text-amber-600 mt-2">
            {activities.filter(a => a.importance === 'high' || a.importance === 'urgent').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Important activities</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full md:w-auto flex-grow md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:placeholder-gray-400 sm:text-sm"
              placeholder="Search activities"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Filter size={16} className="mr-2" />
              Filter
            </button>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedType || 'all'}
              onChange={handleTypeChange}
            >
              <option value="all">All Types</option>
              <option value="system">System</option>
              <option value="user_management">User Management</option>
              <option value="appointment">Appointments</option>
              <option value="medical_record">Medical Records</option>
              <option value="prescription">Prescriptions</option>
              <option value="incident">Incidents</option>
              <option value="notification">Notifications</option>
            </select>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={timeFrame}
              onChange={handleTimeFrameChange}
            >
              <option value="24h">Last 24 hours</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <div className="flex flex-col items-center">
            <Loader size={40} className="animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">Loading activities...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle size={40} className="text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Activities</h3>
            <p className="text-gray-500 mb-4">
              There was a problem connecting to the server. Please try again later.
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Activities List */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Activity Log</h2>
          </div>
          
          {activities.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No activities found matching your filters.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {activities.map(activity => {
                const icon = getActivityIcon(activity.type, activity.importance);
                const relativeTime = formatRelativeTime(activity.createdAt);
                
                return (
                  <li key={activity.id} className="hover:bg-gray-50">
                    <div className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="bg-gray-100 rounded-full p-2 mr-3 flex-shrink-0">
                          {icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-medium">{activity.userName || 'System'}</span> • {activity.type}
                              </p>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock size={14} className="mr-1" />
                              {relativeTime}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          
          {/* Pagination */}
          {activities.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.perPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.perPage, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {/* Previous page button */}
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        page === 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Generate page numbers */}
                    {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                      .filter(pageNum => {
                        // Show first page, last page, current page, and pages around current page
                        return (
                          pageNum === 1 || 
                          pageNum === pagination.lastPage || 
                          Math.abs(pageNum - page) <= 1
                        );
                      })
                      .map((pageNum, i, arr) => {
                        // Add ellipsis where there are gaps
                        const showEllipsisBefore = i > 0 && arr[i - 1] !== pageNum - 1;
                        
                        return (
                          <React.Fragment key={pageNum}>
                            {showEllipsisBefore && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              aria-current={page === pageNum ? 'page' : undefined}
                              className={`${
                                page === pageNum
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                            >
                              {pageNum}
                            </button>
                          </React.Fragment>
                        );
                      })
                    }
                    
                    {/* Next page button */}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pagination.lastPage}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        page === pagination.lastPage
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentActivitiesPage;