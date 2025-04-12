// src/pages/admin/PatientUpdatesPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  ArrowUpDown,
  ChevronDown,
  Loader
} from 'lucide-react';
import { updatesApi, UpdatesFilters } from '../../../store/api/updatesApi';

const PatientUpdatesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  
  // Create the API filter parameters
  const filters: UpdatesFilters = {
    search: searchQuery || undefined,
    departmentId: undefined, // Add department filter if needed
    page: currentPage,
    limit
  };
  
  // Use the RTK Query hook to fetch updates
  const { 
    data: updatesData, 
    isLoading, 
    isError,
    refetch 
  } = updatesApi.useGetUpdatesQuery(filters);
  
  // Get departments for filtering
  const { 
    data: departmentsData,
    isLoading: isLoadingDepartments,
    isError: isDepartmentsError
  } = updatesApi.useGetDepartmentsQuery();

  const departments = (departmentsData as any)?.data || [];
  
  // Sort updates by timestamp (client-side sorting)
  const sortedUpdates = React.useMemo(() => {
    if (!updatesData?.data) return [];
    
    return [...updatesData.data].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [updatesData, sortOrder]);
  
  // Filter updates by type
  const filteredUpdates = React.useMemo(() => {
    if (!sortedUpdates) return [];
    
    return sortedUpdates.filter(update => {
      if (selectedFilter === 'all') return true;
      return update.type === selectedFilter;
    });
  }, [sortedUpdates, selectedFilter]);
  
  // Format relative time from timestamp
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };
  
  // Get icon based on update type
  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <FileText size={16} className="text-purple-500" />;
      case 'test-results':
        return <FileText size={16} className="text-blue-500" />;
      case 'appointment':
        return <Clock size={16} className="text-amber-500" />;
      case 'therapy':
        return <User size={16} className="text-green-500" />;
      case 'vaccination':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <AlertTriangle size={16} className="text-gray-500" />;
    }
  };
  
  // Get status badge based on action
  const getStatusBadge = (action: string) => {
    switch (action) {
      case 'completed':
        return <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'pending':
        return <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Pending</span>;
      case 'active':
        return <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Active</span>;
      case 'alert':
        return <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Alert</span>;
      case 'scheduled':
        return <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">Scheduled</span>;
      case 'missed':
        return <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Missed</span>;
      case 'updated':
        return <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Updated</span>;
      default:
        return <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Info</span>;
    }
  };
  
  // Get background color for avatar
  const getAvatarBgColor = (id: number): string => {
    const colors = ['bg-blue-100', 'bg-purple-100', 'bg-amber-100', 'bg-green-100', 'bg-emerald-100', 'bg-sky-100', 'bg-red-100'];
    return colors[id % colors.length];
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/admin" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Patient Updates</h1>
        </div>
        <Link to="/admin" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search patients, updates, or doctors..."
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                disabled={isLoading}
              >
                <option value="all">All Updates</option>
                <option value="medication">Medication</option>
                <option value="test-results">Test Results</option>
                <option value="appointment">Appointments</option>
                <option value="therapy">Therapy</option>
                <option value="vaccination">Vaccination</option>
              </select>
            </div>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <ArrowUpDown size={14} className="mr-2" />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>
      </div>

      {/* Updates list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader size={24} className="mx-auto animate-spin text-blue-500" />
            <p className="mt-2 text-gray-600">Loading updates...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <AlertTriangle size={24} className="mx-auto text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load updates</h3>
            <p className="mt-1 text-sm text-gray-500">
              There was an error loading the updates. Please try again.
            </p>
            <button 
              onClick={() => refetch()}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUpdates.length > 0 ? (
              filteredUpdates.map(update => (
                <div key={update.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className={`${getAvatarBgColor(update.id)} rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0`}>
                      <span className="font-medium text-sm">{update.avatarText || 'UN'}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <h3 className="text-base font-medium text-gray-900">{update.patientName || 'Unknown Patient'}</h3>
                          <span className="text-sm text-gray-500">(Patient #{update.patientId || 'N/A'})</span>
                        </div>
                        <div className="flex items-center">
                          {getStatusBadge(update.action)}
                        </div>
                      </div>
                      
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span>{formatRelativeTime(update.createdAt)}</span>
                        <span className="mx-1">•</span>
                        <span>{update.doctorName || 'Unknown Doctor'}</span>
                        <span className="mx-1">•</span>
                        <span>{update.departmentName || 'Unknown Department'}</span>
                      </div>
                      
                      <div className="mt-2 flex items-start space-x-2">
                        <div className="flex-shrink-0 mt-0.5">
                          {getUpdateIcon(update.type)}
                        </div>
                        <p className="text-sm text-gray-700">{update.updateText}</p>
                      </div>
                      
                      <div className="mt-2 flex justify-end">
                        <Link to={`/admin/updates/${update.id}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="inline-block mx-auto rounded-full bg-gray-100 p-4">
                  <AlertTriangle size={24} className="text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No updates found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {!isLoading && !isError && updatesData && updatesData.pagination && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 rounded-lg shadow sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button 
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={() => handlePageChange(updatesData.pagination.currentPage - 1)}
              disabled={updatesData.pagination.currentPage === 1}
            >
              Previous
            </button>
            <button 
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={() => handlePageChange(updatesData.pagination.currentPage + 1)}
              disabled={updatesData.pagination.currentPage === updatesData.pagination.lastPage}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(updatesData.pagination.currentPage - 1) * updatesData.pagination.perPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(updatesData.pagination.currentPage * updatesData.pagination.perPage, updatesData.pagination.total)}
                </span> of{' '}
                <span className="font-medium">{updatesData.pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button 
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => handlePageChange(updatesData.pagination.currentPage - 1)}
                  disabled={updatesData.pagination.currentPage === 1}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
                </button>
                
                {/* Generate page numbers */}
                {Array.from({ length: updatesData.pagination.lastPage }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    return page === 1 || 
                      page === updatesData.pagination.lastPage || 
                      Math.abs(page - updatesData.pagination.currentPage) <= 1;
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there are gaps
                    const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                    const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                    
                    return (
                      <React.Fragment key={page}>
                        {showEllipsisBefore && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                            ${updatesData.pagination.currentPage === page
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                        
                        {showEllipsisAfter && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                
                <button 
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => handlePageChange(updatesData.pagination.currentPage + 1)}
                  disabled={updatesData.pagination.currentPage === updatesData.pagination.lastPage}
                >
                  <span className="sr-only">Next</span>
                  <ChevronDown className="h-5 w-5 -rotate-90" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientUpdatesPage;