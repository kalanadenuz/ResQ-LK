import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { mapAPI } from '../services/api';
import { FiMapPin, FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';
import toast from 'react-hot-toast';
import L from 'leaflet';

const UpdateMap = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'emergency',
    address: '',
    latitude: '',
    longitude: '',
    capacity: '',
    contact_person: '',
    contact_phone: '',
    description: ''
  });
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  
  const queryClient = useQueryClient();

  const { data: locations, isLoading } = useQuery(
    'locations',
    mapAPI.getLocations,
    {
      refetchInterval: 30000,
    }
  );

  const addLocationMutation = useMutation(
    (location) => mapAPI.addLocation(location),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('locations');
        toast.success('Location added successfully');
        setShowAddModal(false);
        resetNewLocation();
      },
      onError: () => {
        toast.error('Failed to add location');
      },
    }
  );

  const updateLocationMutation = useMutation(
    ({ id, location }) => mapAPI.updateLocation(id, location),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('locations');
        toast.success('Location updated successfully');
        setShowEditModal(false);
        setSelectedLocation(null);
      },
      onError: () => {
        toast.error('Failed to update location');
      },
    }
  );

  const deleteLocationMutation = useMutation(
    (id) => mapAPI.deleteLocation(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('locations');
        toast.success('Location deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete location');
      },
    }
  );

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([7.8731, 80.7718], 8); // Sri Lanka center

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !locations?.data) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Add markers for each location
    locations.data.forEach((location) => {
      const markerColor = getMarkerColor(location.type);
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-lg">${location.name}</h3>
            <p class="text-sm text-gray-600">${location.type}</p>
            <p class="text-sm text-gray-500">${location.address}</p>
            <div class="mt-2">
              <button onclick="editLocation(${location.id})" class="text-blue-600 hover:text-blue-800">Edit</button>
              <button onclick="deleteLocation(${location.id})" class="text-red-600 hover:text-red-800 ml-2">Delete</button>
            </div>
          </div>
        `);

      marker.on('click', () => {
        setSelectedLocation(location);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if there are markers
    if (locations.data.length > 0) {
      const group = new L.featureGroup(locations.data.map(location => 
        L.marker([location.latitude, location.longitude])
      ));
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [locations]);

  const getMarkerColor = (type) => {
    switch (type) {
      case 'emergency':
        return '#EF4444'; // Red
      case 'relief':
        return '#F59E0B'; // Orange
      case 'safe':
        return '#10B981'; // Green
      case 'rescue':
        return '#3B82F6'; // Blue
      default:
        return '#6B7280'; // Gray
    }
  };

  const resetNewLocation = () => {
    setNewLocation({
      name: '',
      type: 'emergency',
      address: '',
      latitude: '',
      longitude: '',
      capacity: '',
      contact_person: '',
      contact_phone: '',
      description: ''
    });
  };

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.address || !newLocation.latitude || !newLocation.longitude) {
      toast.error('Please fill in all required fields');
      return;
    }

    addLocationMutation.mutate({
      ...newLocation,
      latitude: parseFloat(newLocation.latitude),
      longitude: parseFloat(newLocation.longitude),
      capacity: newLocation.capacity ? parseInt(newLocation.capacity) : null
    });
  };

  const handleUpdateLocation = () => {
    if (!selectedLocation) return;

    updateLocationMutation.mutate({
      id: selectedLocation.id,
      location: {
        ...selectedLocation,
        latitude: parseFloat(selectedLocation.latitude),
        longitude: parseFloat(selectedLocation.longitude),
        capacity: selectedLocation.capacity ? parseInt(selectedLocation.capacity) : null
      }
    });
  };

  const handleDeleteLocation = (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      deleteLocationMutation.mutate(id);
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
          <h1 className="text-2xl font-bold text-gray-900">Update Map</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage emergency locations and map data
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Location
        </button>
      </div>

      {/* Map */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Locations Map</h3>
          <div className="h-[600px] rounded-lg overflow-hidden">
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Locations List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">All Locations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations?.data?.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{location.name}</div>
                        <div className="text-sm text-gray-500">{location.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getMarkerColor(location.type)}`}>
                        {location.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {location.capacity || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        location.status === 'active' ? 'bg-green-100 text-green-800' :
                        location.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {location.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLocation(location);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(location.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Location</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type *</label>
                  <select
                    value={newLocation.type}
                    onChange={(e) => setNewLocation({...newLocation, type: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="emergency">Emergency</option>
                    <option value="relief">Relief</option>
                    <option value="safe">Safe Zone</option>
                    <option value="rescue">Rescue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <input
                    type="text"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={newLocation.latitude}
                      onChange={(e) => setNewLocation({...newLocation, latitude: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={newLocation.longitude}
                      onChange={(e) => setNewLocation({...newLocation, longitude: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    value={newLocation.capacity}
                    onChange={(e) => setNewLocation({...newLocation, capacity: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <input
                    type="text"
                    value={newLocation.contact_person}
                    onChange={(e) => setNewLocation({...newLocation, contact_person: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input
                    type="text"
                    value={newLocation.contact_phone}
                    onChange={(e) => setNewLocation({...newLocation, contact_phone: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newLocation.description}
                    onChange={(e) => setNewLocation({...newLocation, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetNewLocation();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {showEditModal && selectedLocation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Location</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={selectedLocation.name}
                    onChange={(e) => setSelectedLocation({...selectedLocation, name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type *</label>
                  <select
                    value={selectedLocation.type}
                    onChange={(e) => setSelectedLocation({...selectedLocation, type: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="emergency">Emergency</option>
                    <option value="relief">Relief</option>
                    <option value="safe">Safe Zone</option>
                    <option value="rescue">Rescue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <input
                    type="text"
                    value={selectedLocation.address}
                    onChange={(e) => setSelectedLocation({...selectedLocation, address: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={selectedLocation.latitude}
                      onChange={(e) => setSelectedLocation({...selectedLocation, latitude: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={selectedLocation.longitude}
                      onChange={(e) => setSelectedLocation({...selectedLocation, longitude: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    value={selectedLocation.capacity || ''}
                    onChange={(e) => setSelectedLocation({...selectedLocation, capacity: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <input
                    type="text"
                    value={selectedLocation.contact_person || ''}
                    onChange={(e) => setSelectedLocation({...selectedLocation, contact_person: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input
                    type="text"
                    value={selectedLocation.contact_phone || ''}
                    onChange={(e) => setSelectedLocation({...selectedLocation, contact_phone: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={selectedLocation.description || ''}
                    onChange={(e) => setSelectedLocation({...selectedLocation, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLocation(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateMap;
