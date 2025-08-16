import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const EmergencyScreen = () => {
  const navigation = useNavigation();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const locations = [
    'Colombo', 'Galle', 'Kandy', 'Jaffna', 'Anuradhapura', 'Polonnaruwa',
    'Trincomalee', 'Batticaloa', 'Ampara', 'Monaragala', 'Ratnapura',
    'Kegalle', 'Kurunegala', 'Puttalam', 'Vavuniya', 'Mullaitivu',
    'Kilinochchi', 'Mannar', 'Matale', 'Nuwara Eliya', 'Badulla',
    'Hambantota', 'Matara', 'Kalutara', 'Gampaha'
  ];

  const timeSlots = [
    '06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00',
    '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00',
    '22:00 - 00:00', '00:00 - 02:00', '02:00 - 04:00', '04:00 - 06:00'
  ];

  const handleLocationPress = (location: string) => {
    setSelectedLocation(location);
  };

  const handleTimePress = () => {
    navigation.navigate('EvacuationTime');
  };

  const handleRequestEvacuation = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    Alert.alert(
      'Emergency Request',
      `Emergency evacuation requested for ${selectedLocation} at ${selectedTime}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => navigation.goBack() }
      ]
    );
  };

  const LocationButton = ({ location, isSelected }: any) => (
    <TouchableOpacity
      style={[styles.locationButton, isSelected && styles.selectedButton]}
      onPress={() => handleLocationPress(location)}
    >
      <Text style={[styles.locationText, isSelected && styles.selectedText]}>
        {location}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Rescue</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Location Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Location</Text>
          <View style={styles.locationGrid}>
            {locations.map((location, index) => (
              <LocationButton
                key={index}
                location={location}
                isSelected={selectedLocation === location}
              />
            ))}
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <TouchableOpacity style={styles.timeButton} onPress={handleTimePress}>
            <Text style={styles.timeButtonText}>
              {selectedTime || 'Select Time Slot'}
            </Text>
            <Icon name="schedule" size={24} color="#1E3A8A" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestEvacuation}
          >
            <Text style={styles.requestButtonText}>Request Evacuation</Text>
          </TouchableOpacity>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  locationGrid: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  locationButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: '30%',
  },
  selectedButton: {
    backgroundColor: '#3B82F6',
  },
  locationText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedText: {
    fontWeight: '600',
  },
  timeButton: {
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
  },
  timeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    marginBottom: 30,
  },
  requestButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
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

export default EmergencyScreen;
