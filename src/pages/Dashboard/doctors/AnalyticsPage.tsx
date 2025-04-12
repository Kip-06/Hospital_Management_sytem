import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Filter,
  Download,
  RefreshCw,
  Loader,
  AlertCircle,
} from 'lucide-react';
import { analyticsApi, AnalyticsFilters } from '../../../store/api/analyticsApi';

const renderIcon = (iconName: string, size: number = 20, className: string = '') => {
  const icons = {
    Users,
    Calendar,
    Clock,
    Activity,
    RefreshCw,
    Layers,
    TrendingUp,
    TrendingDown,
  };

  const Icon = icons[iconName as keyof typeof icons] || Users;
  return <Icon size={size} className={className} />;
};

const AnalyticsPage: React.FC = () => {
  // State for filters
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: 'month',
    comparison: 'previous',
    doctorId: undefined,
  });

  // Fetch analytics data using RTK Query
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = analyticsApi.useGetAnalyticsQuery(filters);

  // Export report mutation
  const [exportReport, { isLoading: isExporting }] = analyticsApi.useExportAnalyticsReportMutation();

  // Handle filter changes
  const handleDateRangeChange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  const handleComparisonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      comparison: e.target.value as 'previous' | 'last-year' | 'avg',
    }));
  };

  // Handle export
  const handleExportReport = async () => {
    try {
      const blob = await exportReport(filters).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${filters.dateRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading analytics data...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600 mb-4">There was a problem loading your analytics data.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Fallback in case data is missing
  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600 mb-4">
          No analytics data is currently available for the selected filters.
        </p>
        <button
          onClick={() => setFilters({ dateRange: 'month', comparison: 'previous' })}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  // Compute max values for scaling bar charts
  const maxPatientStats = Math.max(
    ...analytics.patientStats.map(stat => parseInt(stat.value) || 0),
    ...analytics.patientStats.map(stat => parseInt(stat.prevValue) || 0),
    1
  );

  const maxAppointmentStats = Math.max(
    ...analytics.appointmentStats.map(stat => parseInt(stat.value) || 0),
    ...analytics.appointmentStats.map(stat => parseInt(stat.prevValue) || 0),
    1
  );

  return (
    <div className="space-y-6">
      {/* Header with Export and Refresh Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/doctor" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
            onClick={handleExportReport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} className="mr-2" />
                Export Report
              </>
            )}
          </button>
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            onClick={() => refetch()}
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Filter size={18} className="text-gray-400" />
            <div className="flex rounded-md overflow-hidden">
              {(['week', 'month', 'quarter', 'year'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  className={`px-4 py-2 text-sm font-medium ${
                    filters.dateRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Compare to:</span>
            <select
              value={filters.comparison}
              onChange={handleComparisonChange}
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="previous">Previous Period</option>
              <option value="last-year">Same Period Last Year</option>
              <option value="avg">Historical Average</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {analytics.patientStats.slice(0, 2).map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-xl font-semibold mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.trend === 'up' ? (
                    <span className="text-green-500 flex items-center">
                      <TrendingUp size={14} className="mr-1" />
                      {stat.change} vs {stat.prevValue}
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <TrendingDown size={14} className="mr-1" />
                      {stat.change} vs {stat.prevValue}
                    </span>
                  )}
                </p>
              </div>
              <div className={`rounded-full p-2`} style={{ backgroundColor: stat.color.replace('text-', 'bg-') + '20' }}>
                {renderIcon(stat.icon, 20, stat.color)}
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(parseInt(stat.value) / maxPatientStats) * 100}%`,
                    backgroundColor: stat.color.replace('text-', ''),
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {analytics.appointmentStats.slice(0, 2).map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-xl font-semibold mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.trend === 'up' ? (
                    <span className="text-green-500 flex items-center">
                      <TrendingUp size={14} className="mr-1" />
                      {stat.change} vs {stat.prevValue}
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <TrendingDown size={14} className="mr-1" />
                      {stat.change} vs {stat.prevValue}
                    </span>
                  )}
                </p>
              </div>
              <div className={`rounded-full p-2`} style={{ backgroundColor: stat.color.replace('text-', 'bg-') + '20' }}>
                {renderIcon(stat.icon, 20, stat.color)}
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(parseInt(stat.value) / maxAppointmentStats) * 100}%`,
                    backgroundColor: stat.color.replace('text-', ''),
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Appointment Trends */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Trends</h3>
          <div className="space-y-2">
            {analytics.appointmentData.map((data, index) => {
              const maxCount = Math.max(...analytics.appointmentData.map(d => d.count), 1);
              return (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-24">{`Day ${data.day}`}</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full">
                    <div
                      className="h-4 bg-blue-500 rounded-full"
                      style={{ width: `${(data.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{data.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Procedure Types */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Procedure Types</h3>
          <div className="space-y-2">
            {analytics.procedureTypes.map((procedure, index) => {
              const maxValue = Math.max(...analytics.procedureTypes.map(p => p.value), 1);
              return (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-32">{procedure.name}</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full">
                    <div
                      className="h-4 rounded-full"
                      style={{
                        width: `${(procedure.value / maxValue) * 100}%`,
                        backgroundColor: procedure.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{procedure.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
        <ul className="space-y-3">
          {analytics.keyInsights.map((insight, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className={`rounded-full p-2`} style={{ backgroundColor: insight.color.replace('text-', 'bg-') + '20' }}>
                {renderIcon(insight.icon, 16, insight.color)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsPage;