import React from 'react';
import { useQuery } from 'react-query';
import { adminAPI } from '../services/api';
import { 
  FiAlertTriangle, 
  FiPackage, 
  FiUsers, 
  FiMapPin,
  FiTrendingUp,
  FiTrendingDown,
  FiClock
} from 'react-icons/fi';
import LiveMap from './LiveMap';

const Dashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard',
    adminAPI.getDashboard,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const { data: statsData } = useQuery(
    'statistics',
    adminAPI.getStatistics,
    {
      refetchInterval: 60000, // Refetch every minute
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">Failed to load dashboard data</div>
      </div>
    );
  }

  const stats = statsData?.data || {};
  const recentRequests = dashboardData?.data?.recentRequests || [];

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Emergency response system overview and real-time monitoring
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Emergencies"
          value={stats.activeEmergencies || 0}
          icon={FiAlertTriangle}
          color="red"
          trend={stats.emergencyTrend || 0}
        />
        <StatCard
          title="Pending Relief"
          value={stats.pendingRelief || 0}
          icon={FiPackage}
          color="orange"
          trend={stats.reliefTrend || 0}
        />
        <StatCard
          title="Available Volunteers"
          value={stats.availableVolunteers || 0}
          icon={FiUsers}
          color="green"
          trend={stats.volunteerTrend || 0}
        />
        <StatCard
          title="Active Locations"
          value={stats.activeLocations || 0}
          icon={FiMapPin}
          color="blue"
          trend={stats.locationTrend || 0}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Map */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Live Emergency Map
            </h3>
            <div className="h-96">
              <LiveMap compact={true} />
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Requests
            </h3>
            <div className="space-y-4">
              {recentRequests.length > 0 ? (
                recentRequests.map((request, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                      request.type === 'emergency' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {request.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.location} • {request.timeAgo}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiClock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent requests</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    New requests will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <FiAlertTriangle className="mr-2 h-4 w-4" />
              View Emergencies
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              <FiPackage className="mr-2 h-4 w-4" />
              Manage Relief
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <FiUsers className="mr-2 h-4 w-4" />
              Assign Volunteers
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <FiMapPin className="mr-2 h-4 w-4" />
              Update Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
