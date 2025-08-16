import React, { useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { mapAPI } from '../services/api';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LiveMap = ({ compact = false }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const { data: mapData, isLoading } = useQuery(
    'mapData',
    mapAPI.getMapData,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
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
    if (!mapInstanceRef.current || !mapData?.data) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each location
    mapData.data.forEach((location) => {
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
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                location.status === 'active' ? 'bg-green-100 text-green-800' :
                location.status === 'inactive' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }">
                ${location.status}
              </span>
            </div>
          </div>
        `);
    });

    // Fit bounds if there are markers
    if (mapData.data.length > 0) {
      const group = new L.featureGroup(mapData.data.map(location => 
        L.marker([location.latitude, location.longitude])
      ));
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [mapData]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className={`w-full ${compact ? 'h-96' : 'h-[600px]'} rounded-lg`}
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-xs text-gray-600">Emergency</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span className="text-xs text-gray-600">Relief</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs text-gray-600">Safe Area</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-xs text-gray-600">Rescue Team</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
