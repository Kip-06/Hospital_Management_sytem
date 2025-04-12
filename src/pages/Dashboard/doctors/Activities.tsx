import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Activity,
  Calendar,
  FileText,
  Clock,
  Check,
  AlertCircle,
  Filter,
  Search,
  ChevronDown,
  User,
  Pill,
  Clipboard,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { activitiesApi} from '../../../store/api/activitiesApi'; // Adjust the import path

const ActivitiesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const [expanded, setExpanded] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const limit = 15; // Matches the mock data's page size

  // Fetch activities using the API
  const { data: activitiesData, isLoading, isError, refetch } = activitiesApi.useGetActivitiesQuery({
    page,
    limit,
    type: selectedCategory === 'all' ? undefined : selectedCategory,
  });

  const activities = activitiesData?.data || [];
  const pagination = activitiesData?.pagination || {
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: limit,
  };

  // Calculate stats dynamically
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const todaysActivities = activities.filter(activity => {
    const activityDate = new Date(activity.createdAt);
    return activityDate >= startOfDay;
  });

  const appointmentCount = activities.filter(activity => activity.type === 'appointment').length;
  const prescriptionCount = activities.filter(activity => activity.type === 'prescription').length;
  const recordCount = activities.filter(activity => activity.type === 'record').length;

  // Filter activities based on search query and timeframe
  const filteredActivities = activities
    .filter(activity => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const patientName = activity.patient
        ? `${activity.patient.firstName} ${activity.patient.lastName}`.toLowerCase()
        : '';
      return (
        activity.title.toLowerCase().includes(searchLower) ||
        activity.description.toLowerCase().includes(searchLower) ||
        patientName.includes(searchLower) ||
        activity.type.toLowerCase().includes(searchLower)
      );
    })
    .filter(activity => {
      // Time filter
      const now = new Date();
      const activityDate = new Date(activity.createdAt);
      switch (selectedTimeframe) {
        case 'today': {
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          return activityDate >= startOfDay;
        }
        case 'yesterday': {
          const startOfYesterday = new Date(now);
          startOfYesterday.setDate(now.getDate() - 1);
          startOfYesterday.setHours(0, 0, 0, 0);

          const endOfYesterday = new Date(now);
          endOfYesterday.setDate(now.getDate() - 1);
          endOfYesterday.setHours(23, 59, 59, 999);

          return activityDate >= startOfYesterday && activityDate <= endOfYesterday;
        }
        case 'week': {
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          return activityDate >= oneWeekAgo;
        }
        default:
          return true;
      }
    });

  // Toggle details expansion
  const toggleExpand = (id: number) => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter(itemId => itemId !== id));
    } else {
      setExpanded([...expanded, id]);
    }
  };

  // Get icon based on activity type and importance
  const getActivityIcon = (type: string, importance: string) => {
    const iconSize = 16;
    switch (type) {
      case 'appointment':
        return importance === 'urgent' ? (
          <AlertCircle size={iconSize} className="text-red-500" />
        ) : (
          <Calendar size={iconSize} className="text-amber-500" />
        );
      case 'lab':
        return <FileText size={iconSize} className="text-blue-500" />;
      case 'prescription':
        return <Pill size={iconSize} className="text-purple-500" />;
      case 'record':
        return <Clipboard size={iconSize} className="text-indigo-500" />;
      case 'referral':
        return <Users size={iconSize} className="text-blue-500" />;
      case 'message':
        return <MessageSquare size={iconSize} className="text-blue-500" />;
      case 'treatment':
        return <FileText size={iconSize} className="text-green-500" />;
      case 'patient':
        return <User size={iconSize} className="text-blue-500" />;
      default:
        return <Activity size={iconSize} className="text-gray-500" />;
    }
  };

  // Get category badge for an activity
  const getCategoryBadge = (type: string) => {
    switch (type) {
      case 'appointment':
        return (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
            Appointment
          </span>
        );
      case 'lab':
        return (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Lab Result
          </span>
        );
      case 'prescription':
        return (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
            Prescription
          </span>
        );
      case 'record':
        return (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
            Medical Record
          </span>
        );
      case 'referral':
        return (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Referral
          </span>
        );
      case 'message':
        return (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Message
          </span>
        );
      case 'treatment':
        return (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Treatment
          </span>
        );
      case 'patient':
        return (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Patient
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {type}
          </span>
        );
    }
  };

  // Format timestamp to "time ago"
  const formatTimeAgo = (createdAt: string) => {
    const now = new Date();
    const activityDate = new Date(createdAt);
    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/doctor" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Activities</h1>
        </div>
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Activities</p>
              <p className="text-xl font-semibold mt-1">{todaysActivities.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-2">
              <Activity size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Appointments</p>
              <p className="text-xl font-semibold mt-1">{appointmentCount}</p>
            </div>
            <div className="bg-amber-100 rounded-full p-2">
              <Calendar size={20} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Prescriptions</p>
              <p className="text-xl font-semibold mt-1">{prescriptionCount}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-2">
              <Pill size={20} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Records Updated</p>
              <p className="text-xl font-semibold mt-1">{recordCount}</p>
            </div>
            <div className="bg-indigo-100 rounded-full p-2">
              <Clipboard size={20} className="text-indigo-600" />
            </div>
          </div>
        </div>
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
              placeholder="Search activities, patients, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1); // Reset page when changing category
                }}
              >
                <option value="all">All Activities</option>
                <option value="appointment">Appointments</option>
                <option value="lab">Lab Results</option>
                <option value="prescription">Prescriptions</option>
                <option value="record">Medical Records</option>
                <option value="referral">Referrals</option>
                <option value="message">Messages</option>
                <option value="treatment">Treatments</option>
                <option value="patient">Patients</option>
              </select>
            </div>

            <select
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedTimeframe}
              onChange={(e) => {
                setSelectedTimeframe(e.target.value);
                setPage(1); // Reset page when changing timeframe
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block mx-auto rounded-full bg-gray-100 p-4">
                <RefreshCw size={24} className="text-gray-400 animate-spin" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Loading activities...</h3>
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <div className="inline-block mx-auto rounded-full bg-gray-100 p-4">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Error loading activities</h3>
              <p className="mt-1 text-sm text-gray-500">Please try refreshing the page.</p>
            </div>
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map(activity => (
              <div
                key={activity.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => toggleExpand(activity.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
                    {getActivityIcon(activity.type, activity.importance)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <div className="flex items-center space-x-2">
                        {getCategoryBadge(activity.type)}
                        <ChevronDown
                          size={16}
                          className={`text-gray-500 transition-transform ${
                            expanded.includes(activity.id) ? 'transform rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span>{formatTimeAgo(activity.createdAt)}</span>
                      <span className="mx-1">•</span>
                      <span>
                        {activity.patient
                          ? `${activity.patient.firstName} ${activity.patient.lastName} (PT-${activity.patient.id})`
                          : 'N/A'}
                      </span>
                    </div>

                    {expanded.includes(activity.id) && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {activity.description}
                        {activity.patient && (
                          <div className="mt-2 flex justify-end">
                            <Link
                              to={`/doctor/patients/PT-${activity.patient.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Patient
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="inline-block mx-auto rounded-full bg-gray-100 p-4">
                <AlertCircle size={24} className="text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No activities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredActivities.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 rounded-lg shadow sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.lastPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
                </button>

                {Array.from({ length: pagination.lastPage }, (_, index) => index + 1).map(pageNumber => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      page === pageNumber
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.lastPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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

export default ActivitiesPage;