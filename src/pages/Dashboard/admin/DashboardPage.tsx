// src/pages/admin/DashboardPage.tsx
import React, { useState, useCallback } from 'react';
import { 
  Users, 
  Activity, 
  Calendar, 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Check,
  Clock,
  ArrowUpRight,
  Settings,
  X,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi} from '../../../store/api/dashboardApi';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [analyticsView, setAnalyticsView] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  
  // Fetch dashboard data
  const { data: dashboardStats, isLoading: statsLoading } = dashboardApi.useGetDashboardStatsQuery({ userType: 'admin' });
  const { data: activities, isLoading: activitiesLoading } = dashboardApi.useGetRecentActivitiesQuery({ limit: 4 });
  const { data: todayAppointments, isLoading: appointmentsLoading } = dashboardApi.useGetTodaysAppointmentsQuery({ userType: 'admin' });
  const { data: patientUpdates, isLoading: updatesLoading } = dashboardApi.useGetPatientUpdatesQuery({ limit: 3 });
  const { data: weeklySchedule, isLoading: scheduleLoading } = dashboardApi.useGetWeeklyScheduleQuery({ userType: 'admin' });
  const { data: pendingApprovals, isLoading: approvalsLoading } = dashboardApi.useGetPendingApprovalsQuery();
  const { data: systemStatus, isLoading: statusLoading } = dashboardApi.useGetSystemStatusQuery();
  const { data: analyticsSummary, isLoading: analyticsLoading } = dashboardApi.useGetAnalyticsSummaryQuery({ 
    period: analyticsView 
  });
  
  // Mutations
  const [updateApproval, { isLoading: isUpdatingApproval }] = dashboardApi.useUpdateApprovalStatusMutation();
  
  // Handlers
  const handleViewAllAppointments = useCallback(() => {
    navigate('/admin/appointments');
  }, [navigate]);

  const handleViewAllUpdates = useCallback(() => {
    navigate('/admin/updates');
  }, [navigate]);

  const handleViewFullCalendar = useCallback(() => {
    navigate('/admin/calendar');
  }, [navigate]);

  const handleViewAllActivities = useCallback(() => {
    navigate('/admin/activities');
  }, [navigate]);
  
  // Handle approval actions
  const handleApproval = useCallback(async (userId: number, status: 'approved' | 'rejected') => {
    try {
      await updateApproval({ userId, status }).unwrap();
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to update approval status:', error);
      // Could add error toast notification here
    }
  }, [updateApproval]);
  
  // Render loading state or placeholder if data is not available
  const renderLoading = (message: string = 'Loading...') => (
    <div className="flex items-center justify-center p-6">
      <Clock className="animate-spin mr-2" />
      <span>{message}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link 
          to="/"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Back to Homepage
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4 md:p-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : dashboardStats?.length ? (
          dashboardStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-xl md:text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
                <div className={`bg-${stat.color}-100 rounded-full p-2 md:p-3`}>
                  {stat.title.includes('User') ? <Users size={24} className={`text-${stat.color}-600`} /> : 
                   stat.title.includes('Appointment') ? <Calendar size={24} className={`text-${stat.color}-600`} /> :
                   stat.title.includes('Doctor') ? <Activity size={24} className={`text-${stat.color}-600`} /> :
                   <DollarSign size={24} className={`text-${stat.color}-600`} />}
                </div>
              </div>
              <div className="mt-3 md:mt-4 flex items-center">
                <span className={`text-${stat.trend === 'up' ? 'green' : 'red'}-500 text-xs md:text-sm font-medium flex items-center`}>
                  {stat.change} 
                  {stat.trend === 'up' ? <TrendingUp size={14} className="ml-1" /> : <TrendingDown size={14} className="ml-1" />}
                </span>
                <span className="text-gray-500 text-xs md:text-sm ml-2">from last month</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-4 bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No stats data available</p>
          </div>
        )}
      </div>
      
      {/* Today's Appointments and Recent Updates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Appointments</h2>
            <button 
              onClick={handleViewAllAppointments}
              className="flex items-center text-blue-600 text-sm font-medium hover:underline focus:outline-none"
              aria-label="View all appointments"
            >
              <span>View All</span>
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          
          {appointmentsLoading ? (
            renderLoading('Loading appointments...')
          ) : todayAppointments?.length ? (
            <div className="space-y-4">
              {todayAppointments.map(appointment => (
                <div key={appointment.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${appointment.bgColor || 'bg-blue-100'} rounded-full flex items-center justify-center mr-3`}>
                      <span className="font-medium text-sm">{appointment.avatarText || appointment.patientName.substring(0, 2)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patientName}</p>
                      <p className="text-xs text-gray-500">{appointment.time} • {appointment.type}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      appointment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          )}
        </div>
        
        {/* Recent Updates */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Updates</h2>
            <button 
              onClick={handleViewAllUpdates}
              className="flex items-center text-blue-600 text-sm font-medium hover:underline focus:outline-none"
              aria-label="View all updates"
            >
              <span>View All</span>
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          
          {updatesLoading ? (
            renderLoading('Loading updates...')
          ) : patientUpdates?.length ? (
            <div className="space-y-4">
              {patientUpdates.map(update => (
                <div key={update.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-10 h-10 ${update.bgColor || 'bg-blue-100'} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
                    <span className="font-medium text-sm">{update.avatarText || update.patientName.substring(0, 2)}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{update.patientName}</p>
                      <span className="text-xs text-gray-500">• {update.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{update.update}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <ClipboardList className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">No recent updates</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Weekly Schedule */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Weekly Schedule</h2>
          <button 
            onClick={handleViewFullCalendar}
            className="flex items-center text-blue-600 text-sm font-medium hover:underline focus:outline-none"
            aria-label="View full calendar"
          >
            <span>Full Calendar</span>
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        
        {scheduleLoading ? (
          renderLoading('Loading schedule...')
        ) : weeklySchedule?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto">
            {weeklySchedule.map((day, index) => (
              <div key={index} className="border rounded-lg p-3 min-w-[180px]">
                <div className="text-center border-b pb-2 mb-2">
                  <p className="font-medium">{day.day}</p>
                  <p className="text-xs text-gray-500">{day.date}</p>
                </div>
                
                {day.appointments.length > 0 ? (
                  <div className="space-y-2">
                    {day.appointments.map((apt, idx) => (
                      <div key={idx} className="text-sm p-2 bg-blue-50 rounded">
                        <p className="font-medium">{apt.time}</p>
                        <p className="text-xs text-gray-700">{apt.patientName}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-gray-500 py-4">No appointments</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">No schedule data available</p>
          </div>
        )}
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient/Doctor stats chart */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Usage Analytics</h2>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setAnalyticsView('weekly')}
                className={`px-3 py-1 text-sm ${analyticsView === 'weekly' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded-md`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setAnalyticsView('monthly')}
                className={`px-3 py-1 text-sm ${analyticsView === 'monthly' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded-md`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setAnalyticsView('yearly')}
                className={`px-3 py-1 text-sm ${analyticsView === 'yearly' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded-md`}
              >
                Yearly
              </button>
            </div>
          </div>
          
          {/* Chart would go here - using placeholder */}
          <div className="h-72 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Analytics Chart</p>
          </div>
          
          // Replace the analytics section with this safer version
{analyticsLoading ? (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
    {Array(3).fill(0).map((_, index) => (
      <div key={index} className="bg-gray-50 p-3 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2 w-20"></div>
        <div className="h-6 bg-gray-200 rounded mb-2 w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    ))}
  </div>
) : analyticsSummary ? (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
    <div className="bg-blue-50 p-3 rounded-lg">
      <p className="text-sm text-gray-500">Patients</p>
      <p className="text-lg font-semibold">{analyticsSummary?.patients?.count?.toLocaleString() || '0'}</p>
      <p className="text-xs text-blue-600">{analyticsSummary?.patients?.change || '+0%'} from last {analyticsView}</p>
    </div>
    <div className="bg-green-50 p-3 rounded-lg">
      <p className="text-sm text-gray-500">Appointments</p>
      <p className="text-lg font-semibold">{analyticsSummary?.appointments?.count?.toLocaleString() || '0'}</p>
      <p className="text-xs text-green-600">{analyticsSummary?.appointments?.change || '+0%'} from last {analyticsView}</p>
    </div>
    <div className="bg-amber-50 p-3 rounded-lg">
      <p className="text-sm text-gray-500">Operations</p>
      <p className="text-lg font-semibold">{analyticsSummary?.operations?.count?.toLocaleString() || '0'}</p>
      <p className="text-xs text-amber-600">{analyticsSummary?.operations?.change || '+0%'} from last {analyticsView}</p>
    </div>
  </div>
) : (
  <div className="text-center py-6 mt-4">
    <p className="text-gray-500">Analytics data not available</p>
  </div>
)}
        </div>
        
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
            <button 
              onClick={handleViewAllActivities}
              className="flex items-center text-blue-600 text-sm font-medium hover:underline focus:outline-none"
              aria-label="View all activities"
            >
              <span>View All</span>
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          
          {activitiesLoading ? (
            renderLoading('Loading activities...')
          ) : activities?.length ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="bg-gray-100 rounded-full p-2 mr-3 flex-shrink-0">
                    {activity.type === 'user' ? (
                      <Users size={16} className="text-blue-500" />
                    ) : activity.type === 'appointment' ? (
                      <Calendar size={16} className="text-green-500" />
                    ) : activity.type === 'alert' ? (
                      <AlertCircle size={16} className="text-red-500" />
                    ) : (
                      <Check size={16} className="text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Activity className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">No recent activities</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Additional information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>
          
          {approvalsLoading ? (
            renderLoading('Loading approvals...')
          ) : pendingApprovals?.length ? (
            <div className="space-y-4">
              {pendingApprovals.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{doctor.name}</p>
                    <p className="text-xs text-gray-500">{doctor.department}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleApproval(doctor.id, 'approved')} 
                      disabled={isUpdatingApproval}
                      className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 disabled:opacity-50" 
                      aria-label={`Approve ${doctor.name}`}
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      onClick={() => handleApproval(doctor.id, 'rejected')}
                      disabled={isUpdatingApproval}
                      className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50" 
                      aria-label={`Reject ${doctor.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No pending approvals</p>
          )}
        </div>
        
        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          
          {statusLoading ? (
            renderLoading('Loading system status...')
          ) : systemStatus?.length ? (
            <div className="space-y-4">
              {systemStatus.map((alert, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{alert.name}</p>
                    <span className={`text-xs font-medium rounded-full px-2 py-1 ${
                      alert.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {alert.type === 'error' ? 'Error' : 'Success'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">System status information not available</p>
            </div>
          )}
        </div>
        
        {/* Quick Access */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/admin/users')} 
              className="flex flex-col items-center justify-center p-3 md:p-4 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              <Users size={20} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium">Users</span>
            </button>
            <button 
              onClick={() => navigate('/admin/appointments')}
              className="flex flex-col items-center justify-center p-3 md:p-4 bg-green-50 rounded-lg hover:bg-green-100"
            >
              <Calendar size={20} className="text-green-600 mb-2" />
              <span className="text-sm font-medium">Schedule</span>
            </button>
            <button 
              onClick={() => navigate('/admin/reports')}
              className="flex flex-col items-center justify-center p-3 md:p-4 bg-purple-50 rounded-lg hover:bg-purple-100"
            >
              <ClipboardList size={20} className="text-purple-600 mb-2" />
              <span className="text-sm font-medium">Reports</span>
            </button>
            <button 
              onClick={() => navigate('/admin/settings')}
              className="flex flex-col items-center justify-center p-3 md:p-4 bg-amber-50 rounded-lg hover:bg-amber-100"
            >
              <Settings size={20} className="text-amber-600 mb-2" />
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>
          
          <div className="mt-4">
            <button 
              onClick={() => navigate('/admin/settings')}
              className="w-full flex items-center justify-between p-3 md:p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <span className="font-medium">Go to System Settings</span>
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
