import React from 'react';
import { useQuery } from 'react-query';
import { adminAPI } from '../services/api';
import { 
  FiBarChart3, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers, 
  FiAlertTriangle,
  FiPackage,
  FiMapPin
} from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Statistics = () => {
  const { data: stats, isLoading } = useQuery(
    'statistics',
    adminAPI.getStatistics,
    {
      refetchInterval: 60000, // Refetch every minute
    }
  );

  const { data: systemStats } = useQuery(
    'systemStats',
    adminAPI.getSystemStats,
    {
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const data = stats?.data || {};
  const system = systemStats?.data || {};

  // Sample data for charts (replace with real data from API)
  const emergencyData = [
    { name: 'Jan', emergencies: 12, relief: 8, volunteers: 15 },
    { name: 'Feb', emergencies: 19, relief: 12, volunteers: 22 },
    { name: 'Mar', emergencies: 15, relief: 10, volunteers: 18 },
    { name: 'Apr', emergencies: 25, relief: 18, volunteers: 30 },
    { name: 'May', emergencies: 22, relief: 15, volunteers: 25 },
    { name: 'Jun', emergencies: 30, relief: 20, volunteers: 35 },
  ];

  const responseTimeData = [
    { name: 'Jan', avgTime: 25 },
    { name: 'Feb', avgTime: 22 },
    { name: 'Mar', avgTime: 28 },
    { name: 'Apr', avgTime: 20 },
    { name: 'May', avgTime: 18 },
    { name: 'Jun', avgTime: 15 },
  ];

  const locationTypeData = [
    { name: 'Emergency Centers', value: data.emergencyLocations || 5, color: '#EF4444' },
    { name: 'Relief Centers', value: data.reliefLocations || 8, color: '#F59E0B' },
    { name: 'Safe Zones', value: data.safeZones || 12, color: '#10B981' },
    { name: 'Rescue Bases', value: data.rescueBases || 3, color: '#3B82F6' },
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend > 0 ? (
                      <FiTrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                    ) : (
                      <FiTrendingDown className="self-center flex-shrink-0 h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {trend > 0 ? 'Increased' : 'Decreased'} by
                    </span>
                    {Math.abs(trend)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistics & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive overview of emergency response system performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Emergencies"
          value={data.totalEmergencies || 0}
          icon={FiAlertTriangle}
          color="red"
          trend={data.emergencyTrend || 0}
        />
        <StatCard
          title="Total Relief Requests"
          value={data.totalReliefRequests || 0}
          icon={FiPackage}
          color="orange"
          trend={data.reliefTrend || 0}
        />
        <StatCard
          title="Active Volunteers"
          value={data.activeVolunteers || 0}
          icon={FiUsers}
          color="green"
          trend={data.volunteerTrend || 0}
        />
        <StatCard
          title="Response Locations"
          value={data.totalLocations || 0}
          icon={FiMapPin}
          color="blue"
          trend={data.locationTrend || 0}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency vs Relief vs Volunteers Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Monthly Activity Overview
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emergencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="emergencies" fill="#EF4444" name="Emergencies" />
                  <Bar dataKey="relief" fill="#F59E0B" name="Relief Requests" />
                  <Bar dataKey="volunteers" fill="#10B981" name="Volunteers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Average Response Time (Minutes)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Response Time"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Location Types Pie Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Location Types Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {locationTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              System Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">System Uptime</span>
                <span className="text-sm font-semibold text-green-600">
                  {system.uptime || '99.9%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Active Sessions</span>
                <span className="text-sm font-semibold text-blue-600">
                  {system.activeSessions || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Database Connections</span>
                <span className="text-sm font-semibold text-purple-600">
                  {system.dbConnections || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">API Response Time</span>
                <span className="text-sm font-semibold text-orange-600">
                  {system.avgResponseTime || '150ms'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Error Rate</span>
                <span className="text-sm font-semibold text-red-600">
                  {system.errorRate || '0.1%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {data.recentActivity?.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                    activity.type === 'emergency' ? 'bg-red-500' : 
                    activity.type === 'relief' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.timeAgo}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Most Active Locations
            </h3>
            <div className="space-y-3">
              {data.topLocations?.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {location.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {location.type}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {location.activityCount} requests
                  </span>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No location data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Volunteer Performance */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top Volunteers
            </h3>
            <div className="space-y-3">
              {data.topVolunteers?.map((volunteer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {volunteer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {volunteer.shift} shift
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {volunteer.completedTasks} tasks
                  </span>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No volunteer data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
