import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';

const MapScreen = () => {
  const navigation = useNavigation();
  const [searchLocation, setSearchLocation] = useState('');

  const locationMarkers = [
    { id: 1, name: 'Colombo Hospital', type: 'hospital', x: 150, y: 200 },
    { id: 2, name: 'Galle Relief Center', type: 'relief', x: 120, y: 280 },
    { id: 3, name: 'Kandy Emergency', type: 'emergency', x: 180, y: 150 },
    { id: 4, name: 'Jaffna Shelter', type: 'shelter', x: 80, y: 100 },
  ];

  const legendItems = [
    { type: 'hospital', color: '#DC2626', label: 'Hospital' },
    { type: 'relief', color: '#059669', label: 'Relief Center' },
    { type: 'emergency', color: '#DC2626', label: 'Emergency' },
    { type: 'shelter', color: '#7C3AED', label: 'Shelter' },
  ];

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'hospital':
        return '#DC2626';
      case 'relief':
        return '#059669';
      case 'emergency':
        return '#DC2626';
      case 'shelter':
        return '#7C3AED';
      default:
        return '#6B7280';
    }
  };

  const LocationMarker = ({ marker }: any) => (
    <View style={[styles.marker, { left: marker.x, top: marker.y }]}>
      <Circle
        cx="8"
        cy="8"
        r="6"
        fill={getMarkerColor(marker.type)}
        stroke="white"
        strokeWidth="2"
      />
      <Text style={styles.markerLabel}>{marker.name}</Text>
    </View>
  );

  const LegendItem = ({ item }: any) => (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
      <Text style={styles.legendText}>{item.label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Screen Title */}
        <View style={styles.screenTitle}>
          <Text style={styles.screenTitleText}>Sri Lanka Emergency Map</Text>
        </View>

        {/* Location Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchLocation}
            onChangeText={setSearchLocation}
            placeholder="Search location..."
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.searchButton}>
            <Icon name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <Svg width="300" height="400" style={styles.mapSvg}>
            {/* Simplified Sri Lanka outline */}
            <Path
              d="M50 100 L100 80 L150 90 L200 120 L220 180 L200 250 L150 280 L100 300 L50 280 L30 200 Z"
              fill="#E5E7EB"
              stroke="#374151"
              strokeWidth="2"
            />
            
            {/* Location markers */}
            {locationMarkers.map((marker) => (
              <LocationMarker key={marker.id} marker={marker} />
            ))}
          </Svg>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendGrid}>
            {legendItems.map((item, index) => (
              <LegendItem key={index} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="local-hospital" size={24} color="white" />
          <Text style={styles.navText}>Medical</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="volunteer-activism" size={24} color="white" />
          <Text style={styles.navText}>Volunteer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="emergency" size={24} color="white" />
          <Text style={styles.navText}>Rescue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="map" size={24} color="white" />
          <Text style={styles.navText}>Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  screenTitle: {
    alignItems: 'center',
    marginBottom: 20,
  },
  screenTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapSvg: {
    backgroundColor: '#F9FAFB',
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerLabel: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 60,
  },
  legendContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '48%',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
  bottomNav: {
    backgroundColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});

export default MapScreen;
