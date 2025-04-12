// src/pages/admin/ReportsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  DollarSign, 
  Users,
  ArrowUp, 
  Stethoscope,
  Building2,
  Loader
} from 'lucide-react';
import { reportsApi } from '../../../store/api/reportsApi';

// Define report types
type ReportType = 'financial' | 'patient' | 'appointment' | 'department' | 'doctor';
type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface ReportParams {
  period: 'daily' | 'monthly';
  startDate?: string;
  endDate?: string;
}

interface ReportConfig {
  type: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface AgeGroup {
  group: string;
  count: number;
}

const ReportsPage: React.FC = () => {
  // State for report filters
  const [selectedReport, setSelectedReport] = useState<ReportType>('financial');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [reportParams, setReportParams] = useState<ReportParams>({
    period: 'monthly'
  });
  
  // Update report parameters when filters change
  useEffect(() => {
    const params: ReportParams = { period: 'monthly' };
    
    switch(dateRange) {
      case 'today':
        params.startDate = new Date().toISOString().split('T')[0];
        params.endDate = new Date().toISOString().split('T')[0];
        params.period = 'daily';
        break;
      case 'week':
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        params.startDate = weekStart.toISOString().split('T')[0];
        params.period = 'daily';
        break;
      case 'month':
        const monthStart = new Date();
        monthStart.setDate(1);
        params.startDate = monthStart.toISOString().split('T')[0];
        params.period = 'daily';
        break;
      case 'quarter':
        const quarterStart = new Date();
        quarterStart.setMonth(Math.floor(quarterStart.getMonth() / 3) * 3);
        quarterStart.setDate(1);
        params.startDate = quarterStart.toISOString().split('T')[0];
        params.period = 'monthly';
        break;
      case 'year':
        const yearStart = new Date();
        yearStart.setMonth(0);
        yearStart.setDate(1);
        params.startDate = yearStart.toISOString().split('T')[0];
        params.period = 'monthly';
        break;
      case 'custom':
        if (customStartDate) params.startDate = customStartDate;
        if (customEndDate) params.endDate = customEndDate;
        params.period = 'daily';
        break;
    }
    
    setReportParams(params);
  }, [dateRange, customStartDate, customEndDate]);

  // API queries with skip option to only load the selected report type
  const [exportReport, { isLoading: isExporting }] = reportsApi.useLazyExportReportQuery();

  const { 
    data: revenueData, 
    isLoading: isRevenueLoading 
  } = reportsApi.useGetRevenueReportQuery(reportParams, { 
    skip: selectedReport !== 'financial' 
  });
  
  const { 
    data: patientData, 
    isLoading: isPatientLoading 
  } = reportsApi.useGetPatientStatisticsQuery(reportParams, { 
    skip: selectedReport !== 'patient' 
  });
  
  const { 
    data: appointmentData, 
    isLoading: isAppointmentLoading 
  } = reportsApi.useGetAppointmentStatisticsQuery(reportParams, { 
    skip: selectedReport !== 'appointment' 
  });
  
  const { 
    data: departmentData, 
    isLoading: isDepartmentLoading 
  } = reportsApi.useGetDepartmentPerformanceQuery(reportParams, { 
    skip: selectedReport !== 'department' 
  });
  
  const { 
    data: doctorData, 
    isLoading: isDoctorLoading 
  } = reportsApi.useGetDoctorPerformanceQuery(reportParams, { 
    skip: selectedReport !== 'doctor' 
  });
  
  // Define available reports
  const reportTypes: ReportConfig[] = [
    { 
      type: 'financial', 
      title: 'Financial Reports', 
      description: 'Revenue, expenses, and profit analysis',
      icon: <DollarSign size={20} />,
      color: 'bg-green-100 text-green-800'
    },
    { 
      type: 'patient', 
      title: 'Patient Reports', 
      description: 'Patient demographics and trends',
      icon: <Users size={20} />,
      color: 'bg-blue-100 text-blue-800'
    },
    { 
      type: 'appointment', 
      title: 'Appointment Reports', 
      description: 'Appointment statistics and utilization',
      icon: <Calendar size={20} />,
      color: 'bg-indigo-100 text-indigo-800'
    },
    { 
      type: 'department', 
      title: 'Department Reports', 
      description: 'Department performance metrics',
      icon: <Building2 size={20} />,
      color: 'bg-purple-100 text-purple-800'
    },
    { 
      type: 'doctor', 
      title: 'Doctor Reports', 
      description: 'Doctor performance and patient load',
      icon: <Stethoscope size={20} />,
      color: 'bg-amber-100 text-amber-800'
    }
  ];

  // Helper function to process revenue data from API
  const processRevenueData = () => {
    if (!revenueData) return {
      revenue: 0,
      expenses: 0,
      profit: 0,
      yoyGrowth: 0,
      revenueByDepartment: []
    };
    
    // Calculate totals from API data
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalExpenses = revenueData.reduce((sum, item) => sum + item.expenses, 0);
    const totalProfit = revenueData.reduce((sum, item) => sum + item.profit, 0);
    
    // Group by department (this would need to be enhanced based on actual API response)
    const departmentRevenue: {[key: string]: number} = {};
    revenueData.forEach(item => {
      // Assuming the API provides department info or you can derive it
      const dept = item.month.split('-')[0]; // Example: using month prefix as dept for demo
      departmentRevenue[dept] = (departmentRevenue[dept] || 0) + item.revenue;
    });
    
    const revenueByDepartment = Object.entries(departmentRevenue).map(([department, revenue]) => ({
      department,
      revenue
    }));
    
    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalProfit,
      revenueByDepartment
    };
  };

  // Helper function to process patient data from API
  const processPatientData = () => {
    if (!patientData) return {
      totalPatients: 0,
      newPatients: 0,
      returningPatients: 0,
      growthRate: 0,
      ageGroups: []
    };
    
    // Calculate totals from API data
    const totalPatients = patientData.reduce((sum, item) => sum + item.totalVisits, 0);
    const newPatients = patientData.reduce((sum, item) => sum + item.newPatients, 0);
    const returningPatients = patientData.reduce((sum, item) => sum + item.returningPatients, 0);
    
    // This would need to be enhanced based on actual API response
    return {
      totalPatients,
      newPatients,
      returningPatients,
      growthRate: 0,
      ageGroups: [] as AgeGroup[] // Type assertion to fix TypeScript error
    };
  };

  // Helper function to process appointment data from API
  const processAppointmentData = () => {
    if (!appointmentData) return {
      totalAppointments: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
      appointmentsByDay: []
    };
    
    // Calculate totals from API data
    const totalAppointments = appointmentData.reduce((sum, item) => 
      sum + item.scheduled, 0);
    const completed = appointmentData.reduce((sum, item) => 
      sum + item.completed, 0);
    const cancelled = appointmentData.reduce((sum, item) => 
      sum + item.cancelled, 0);
    const noShow = appointmentData.reduce((sum, item) => 
      sum + item.noShow, 0);
    
    // Group by day of week (this would need to be enhanced based on actual API response)
    const dayMap: {[key: string]: number} = {
      '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0
    };
    
    appointmentData.forEach(item => {
      // Assuming period contains a date we can extract day from
      const date = new Date(item.period);
      const day = date.getDay().toString();
      dayMap[day] = (dayMap[day] || 0) + item.scheduled;
    });
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const appointmentsByDay = Object.entries(dayMap).map(([dayIndex, count]) => ({
      day: days[parseInt(dayIndex)],
      count
    }));
    
    return {
      totalAppointments,
      completed,
      cancelled,
      noShow,
      appointmentsByDay
    };
  };


  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Loading indicator
  const renderLoading = () => (
    <div className="flex justify-center items-center h-64">
      <Loader className="animate-spin h-10 w-10 text-blue-500" />
      <span className="ml-3 text-blue-500">Loading report data...</span>
    </div>
  );

  // Render report content based on selected report type
  const renderReportContent = () => {
    switch(selectedReport) {
      case 'financial':
        if (isRevenueLoading) return renderLoading();
        
        const financialData = processRevenueData();
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold mt-1">{formatCurrency(financialData.revenue)}</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUp className="text-green-500 mr-1" size={16} />
                  <span className="text-green-500 font-medium">{financialData.yoyGrowth}%</span>
                  <span className="text-gray-500 ml-1">vs last year</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-2xl font-semibold mt-1">{formatCurrency(financialData.expenses)}</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUp className="text-red-500 mr-1" size={16} />
                  <span className="text-red-500 font-medium">4.2%</span>
                  <span className="text-gray-500 ml-1">vs last year</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">Net Profit</p>
                <p className="text-2xl font-semibold mt-1">{formatCurrency(financialData.profit)}</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUp className="text-green-500 mr-1" size={16} />
                  <span className="text-green-500 font-medium">12.5%</span>
                  <span className="text-gray-500 ml-1">vs last year</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Revenue by Department</h3>
              <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 mb-4 flex items-center justify-center">
                <p className="text-gray-500">Revenue Chart by Department</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {financialData.revenueByDepartment.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">{item.department}</p>
                      <p className="text-sm font-semibold">{formatCurrency(item.revenue)}</p>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(item.revenue / financialData.revenue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'patient':
        if (isPatientLoading) return renderLoading();
        
        const patientStats = processPatientData();
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-2xl font-semibold mt-1">{patientStats.totalPatients.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUp className="text-green-500 mr-1" size={16} />
                  <span className="text-green-500 font-medium">{patientStats.growthRate}%</span>
                  <span className="text-gray-500 ml-1">growth rate</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">New Patients</p>
                <p className="text-2xl font-semibold mt-1">{patientStats.newPatients.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-gray-500">
                    {Math.round((patientStats.newPatients / patientStats.totalPatients) * 100)}% of total
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">Returning Patients</p>
                <p className="text-2xl font-semibold mt-1">{patientStats.returningPatients.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-gray-500">
                    {Math.round((patientStats.returningPatients / patientStats.totalPatients) * 100)}% of total
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Patient Demographics</h3>
              <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 mb-4 flex items-center justify-center">
                <p className="text-gray-500">Patient Age Distribution Chart</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
  {patientStats.ageGroups.length > 0 ? (
    patientStats.ageGroups.map((item, index: number) => (
      <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
        <p className="text-sm font-medium">{item.group} years</p>
        <p className="text-lg font-semibold mt-1">{item.count}</p>
        <p className="text-xs text-gray-500">
          {Math.round((item.count / patientStats.totalPatients) * 100)}%
        </p>
      </div>
    ))
  ) : (
    <div className="col-span-5 text-center py-4 text-gray-500">
      No age group data available
    </div>
  )}
</div>
            </div>
          </div>
        );
      
      case 'appointment':
        if (isAppointmentLoading) return renderLoading();
        
        const apptData = processAppointmentData();
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">Total Appointments</p>
                <p className="text-2xl font-semibold mt-1">{apptData.totalAppointments.toLocaleString()}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold mt-1">{apptData.completed.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-green-500 font-medium">
                    {Math.round((apptData.completed / apptData.totalAppointments) * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <p className="text-2xl font-semibold mt-1">{apptData.cancelled.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-red-500 font-medium">
                    {Math.round((apptData.cancelled / apptData.totalAppointments) * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">No-Shows</p>
                <p className="text-2xl font-semibold mt-1">{apptData.noShow.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-amber-500 font-medium">
                    {Math.round((apptData.noShow / apptData.totalAppointments) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Appointments by Day of Week</h3>
              <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 mb-4 flex items-center justify-center">
                <p className="text-gray-500">Appointments by Day Chart</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {apptData.appointmentsByDay.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-sm font-medium">{item.day.substring(0, 3)}</p>
                    <p className="text-lg font-semibold mt-1">{item.count}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round((item.count / apptData.totalAppointments) * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'department':
        if (isDepartmentLoading) return renderLoading();
        
        return (
          <div className="space-y-6">
            {departmentData && departmentData.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patients Seen</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Wait Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {departmentData.map((dept, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.departmentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.appointmentsCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.patientsSeen}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.utilization}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.averageWaitTime} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
                <p className="text-gray-500">Department Performance Reports - Coming Soon</p>
              </div>
            )}
          </div>
        );
      
      case 'doctor':
        if (isDoctorLoading) return renderLoading();
        
        return (
          <div className="space-y-6">
            {doctorData && doctorData.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patients Served</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {doctorData.map((doctor, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.doctorName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.patientsServed}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.appointmentsCompleted}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="text-amber-500 mr-1">★</span>
                            {typeof doctor.averageRating === 'number' ? doctor.averageRating.toFixed(1) : '0.0'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
                <p className="text-gray-500">Doctor Performance Reports - Coming Soon</p>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
            <p className="text-gray-500">Select a report type to view details</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FileText className="mr-2" size={24} />
            Reports & Analytics
          </h2>
          <button 
  onClick={async () => {
    try {
      // Set export parameters
      const exportParams = {
        ...reportParams,
        format: 'csv' as 'pdf' | 'csv' | 'excel',
        reportType: selectedReport
      };
      
      // Request the report file
      const reportBlob = await exportReport(exportParams).unwrap();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(reportBlob);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport}_report.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
      alert('Could not generate the report. Please try again.');
    }
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
  disabled={isExporting}
>
  {isExporting ? (
    <>
      <Loader size={18} className="animate-spin mr-2" />
      Generating...
    </>
  ) : (
    <>
      <Download size={18} className="mr-2" />
      Export Report
    </>
  )}
</button>
        </div>

        {/* Report Type Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Report Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {reportTypes.map(report => (
              <button
                key={report.type}
                onClick={() => setSelectedReport(report.type)}
                className={`p-4 rounded-lg border ${
                  selectedReport === report.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${report.color} flex items-center justify-center mb-2 mx-auto`}>
                  {report.icon}
                </div>
                <p className="text-sm font-medium text-center">{report.title}</p>
                <p className="text-xs text-gray-500 text-center mt-1">{report.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex items-center">
            <Filter size={18} className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-700 mr-2">Time Period:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {dateRange === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default ReportsPage;