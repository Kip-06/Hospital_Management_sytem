// src/pages/Dashboard/admin/RecentUpdates.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Filter, Search, AlertTriangle } from 'lucide-react';
import { updatesApi} from '../../../store/api/updatesApi';

interface UpdatesFilters {
  timeFrame: '24h' | 'week' | 'month' | 'all';
  page: number;
  limit: number;
  search?: string;
  departmentId?: number;
}

const RecentUpdatesPage: React.FC = () => {
  // State for filters
  const [filters, setFilters] = useState<UpdatesFilters>({
    timeFrame: '24h',
    page: 1,
    limit: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Fetch data using RTK Query
  const { 
    data: updatesResponse, 
    isLoading: updatesLoading, 
    error: updatesError,
    refetch: refetchUpdates
  } = updatesApi.useGetUpdatesQuery(filters);

  const { 
    data: departments = [], 
    isLoading: departmentsLoading
  } = updatesApi.useGetDepartmentsQuery();

  // Ensure we have arrays even if the API fails
  const updates = updatesResponse?.data || [];
  const departmentsList = Array.isArray(departments) ? departments : [];
  const pagination = updatesResponse?.pagination || {
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 10
  };

  // Handle search input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
      } else {
        setFilters(prev => {
          const { search, ...rest } = prev;
          return { ...rest, page: 1 };
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle department filter change
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDepartment(value);
    
    if (value === 'all') {
      setFilters(prev => {
        const { departmentId, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    } else {
      setFilters(prev => ({ 
        ...prev, 
        departmentId: parseInt(value),
        page: 1
      }));
    }
  };

  // Handle time frame filter change
  const handleTimeFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as '24h' | 'week' | 'month' | 'all';
    setFilters(prev => ({ ...prev, timeFrame: value, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo(0, 0);
  };

  // Generate avatar text from patient name
  const getAvatarText = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Generate a background color based on ID
  const getBackgroundColor = (id: number): string => {
    const colors = [
      'bg-emerald-100',
      'bg-blue-100',
      'bg-amber-100',
      'bg-purple-100',
      'bg-pink-100',
      'bg-indigo-100',
      'bg-green-100',
      'bg-teal-100'
    ];
    return colors[id % colors.length];
  };

  // Format relative time (e.g., "3 hours ago")
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
    refetchUpdates();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/admin" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Recent Updates</h1>
        </div>
        <Link to="/" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Back to Homepage
        </Link>
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
              placeholder="Search updates"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Filter size={16} className="mr-2" />
              Filter
            </button>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              disabled={departmentsLoading}
            >
              <option value="all">All Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </option>
              ))}
            </select>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.timeFrame}
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
      {updatesLoading && (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <p className="text-gray-500">Loading updates...</p>
        </div>
      )}

      {/* Error state */}
      {updatesError && (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <div className="flex flex-col items-center justify-center">
            <AlertTriangle size={40} className="text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Updates</h3>
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

      {/* Updates List */}
      {!updatesLoading && !updatesError && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Updates</h2>
          </div>
          
          {updates.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No updates found matching your filters.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {updates.map(update => {
                const avatarText = update.avatarText || getAvatarText(update.patientName);
                const bgColor = getBackgroundColor(update.id);
                const relativeTime = formatRelativeTime(update.createdAt);
                
                return (
                  <li key={update.id} className="hover:bg-gray-50">
                    <div className="px-6 py-5">
                      <div className="flex items-start">
                        <div className={`${bgColor} rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0`}>
                          <span className="font-medium text-sm">{avatarText}</span>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-base font-medium">{update.patientName}</h3>
                              <div className="text-sm text-gray-500 mt-1">
                                <span className="font-medium text-gray-900">{update.doctorName}</span> • {update.departmentName}
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock size={14} className="mr-1" />
                              {relativeTime}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{update.updateText}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <Link 
                              to={`/admin/updates/${update.id}`}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              View Details
                            </Link>
                            <Link 
                              to={`/admin/patients/${update.patientId}`}
                              className="inline-flex items-center px-3 py-1 border border-blue-600 shadow-sm text-xs font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Patient Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          
          {/* Pagination */}
          {updates.length > 0 && (
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
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.currentPage === 1 
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
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current page
                        return (
                          page === 1 || 
                          page === pagination.lastPage || 
                          Math.abs(page - pagination.currentPage) <= 1
                        );
                      })
                      .map((page, i, arr) => {
                        // Add ellipsis where there are gaps
                        const showEllipsisBefore = i > 0 && arr[i - 1] !== page - 1;
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsisBefore && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              aria-current={pagination.currentPage === page ? 'page' : undefined}
                              className={`${
                                pagination.currentPage === page
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })
                    }
                    
                    {/* Next page button */}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.lastPage}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.currentPage === pagination.lastPage
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

export default RecentUpdatesPage;