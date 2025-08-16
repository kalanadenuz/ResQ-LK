import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { reliefAPI } from '../services/api';
import { FiPackage, FiClock, FiCheck, FiX, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ReliefRequests = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery(
    ['relief-requests', selectedStatus],
    () => reliefAPI.getAll({ status: selectedStatus === 'all' ? undefined : selectedStatus }),
    {
      refetchInterval: 30000,
    }
  );

  const updateStatusMutation = useMutation(
    ({ id, status }) => reliefAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('relief-requests');
        toast.success('Relief request status updated successfully');
      },
      onError: () => {
        toast.error('Failed to update relief request status');
      },
    }
  );

  const handleStatusUpdate = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'food':
        return 'bg-orange-500';
      case 'water':
        return 'bg-blue-500';
      case 'shelter':
        return 'bg-green-500';
      case 'medical':
        return 'bg-red-500';
      case 'clothing':
        return 'bg-purple-500';
      case 'hygiene':
        return 'bg-pink-500';
      case 'transport':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relief Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and process relief supply requests
          </p>
        </div>
        
        {/* Status Filter */}
        <div className="flex space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests?.data?.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <FiPackage className="h-5 w-5 text-orange-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.user_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getTypeColor(request.request_type)}`}>
                      {request.request_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {(!requests?.data || requests.data.length === 0) && (
          <div className="text-center py-12">
            <FiClock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No relief requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus === 'all' ? 'No requests found' : `No ${selectedStatus} requests found`}
            </p>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Relief Request Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Requester</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.user_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.user_phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request Type</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getTypeColor(selectedRequest.request_type)}`}>
                    {selectedRequest.request_type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.quantity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.description || 'No description'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Time</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedRequest.preferred_time ? new Date(selectedRequest.preferred_time).toLocaleString() : 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedRequest.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReliefRequests;
