import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { volunteerAPI } from '../services/api';
import { FiUsers, FiClock, FiCheck, FiX, FiEye, FiUserCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VolunteerManagement = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');
  
  const queryClient = useQueryClient();

  const { data: volunteers, isLoading } = useQuery(
    ['volunteers', selectedStatus],
    () => volunteerAPI.getAll({ status: selectedStatus === 'all' ? undefined : selectedStatus }),
    {
      refetchInterval: 30000,
    }
  );

  const updateStatusMutation = useMutation(
    ({ id, status, notes }) => volunteerAPI.updateStatus(id, status, notes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('volunteers');
        toast.success('Volunteer status updated successfully');
        setUpdateNotes('');
      },
      onError: () => {
        toast.error('Failed to update volunteer status');
      },
    }
  );

  const handleStatusUpdate = (id, status) => {
    updateStatusMutation.mutate({ id, status, notes: updateNotes });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftColor = (shift) => {
    switch (shift) {
      case 'morning':
        return 'bg-yellow-500';
      case 'afternoon':
        return 'bg-orange-500';
      case 'evening':
        return 'bg-purple-500';
      case 'night':
        return 'bg-indigo-500';
      case 'flexible':
        return 'bg-green-500';
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
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage volunteer registrations and assignments
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Volunteers Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volunteer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasks
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
              {volunteers?.data?.map((volunteer) => (
                <tr key={volunteer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FiUsers className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {volunteer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {volunteer.mobile}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getShiftColor(volunteer.shift)}`}>
                      {volunteer.shift}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {volunteer.tasks.split(',').slice(0, 2).join(', ')}
                      {volunteer.tasks.split(',').length > 2 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(volunteer.status)}`}>
                      {volunteer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(volunteer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedVolunteer(volunteer);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      
                      {volunteer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(volunteer.id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(volunteer.id, 'suspended')}
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
        
        {(!volunteers?.data || volunteers.data.length === 0) && (
          <div className="text-center py-12">
            <FiClock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No volunteers</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus === 'all' ? 'No volunteers found' : `No ${selectedStatus} volunteers found`}
            </p>
          </div>
        )}
      </div>

      {/* Volunteer Details Modal */}
      {showModal && selectedVolunteer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Volunteer Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">National ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.national_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.mobile}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shift</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getShiftColor(selectedVolunteer.shift)}`}>
                    {selectedVolunteer.shift}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tasks</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedVolunteer.tasks.split(',').map((task, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {task.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Skills</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.skills || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.availability || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedVolunteer.status)}`}>
                    {selectedVolunteer.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedVolunteer.created_at).toLocaleString()}
                  </p>
                </div>
                
                {selectedVolunteer.status === 'pending' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                    <textarea
                      value={updateNotes}
                      onChange={(e) => setUpdateNotes(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      rows={3}
                      placeholder="Add notes for status update..."
                    />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setUpdateNotes('');
                  }}
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

export default VolunteerManagement;
