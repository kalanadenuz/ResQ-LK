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

const EvacuationTimeScreen = () => {
  const navigation = useNavigation();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const timeSlots = [
    '06:00 - 08:00', '08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00',
    '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00',
    '22:00 - 00:00', '00:00 - 02:00', '02:00 - 04:00', '04:00 - 06:00'
  ];

  const handleTimeSlotPress = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleBackPress = () => {
    if (selectedTimeSlot) {
      // Pass the selected time back to the previous screen
      navigation.goBack();
    } else {
      Alert.alert('No Selection', 'Please select a time slot or go back');
    }
  };

  const handleNearbyLocations = () => {
    Alert.alert(
      'Nearby Locations',
      'This will show evacuation centers near your location',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Show', onPress: () => navigation.navigate('Map') }
      ]
    );
  };

  const TimeSlotButton = ({ timeSlot, isSelected }: any) => (
    <TouchableOpacity
      style={[styles.timeSlotButton, isSelected && styles.selectedTimeSlot]}
      onPress={() => handleTimeSlotPress(timeSlot)}
    >
      <Text style={[styles.timeSlotText, isSelected && styles.selectedTimeSlotText]}>
        {timeSlot}
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
        <Text style={styles.headerTitle}>Select Time Slot</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.instructionText}>
          Select your preferred evacuation time slot
        </Text>

        {/* Time Slots Grid */}
        <View style={styles.timeSlotsGrid}>
          {timeSlots.map((timeSlot, index) => (
            <TimeSlotButton
              key={index}
              timeSlot={timeSlot}
              isSelected={selectedTimeSlot === timeSlot}
            />
          ))}
        </View>

        {/* Nearby Locations Link */}
        <TouchableOpacity style={styles.nearbyLink} onPress={handleNearbyLocations}>
          <Text style={styles.nearbyLinkText}>
            If no time slots available, select nearby evacuation location
          </Text>
          <Icon name="arrow-forward" size={16} color="#3B82F6" />
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
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
  instructionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  timeSlotButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#3B82F6',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedTimeSlotText: {
    color: 'white',
    fontWeight: '600',
  },
  nearbyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginBottom: 30,
  },
  nearbyLinkText: {
    color: '#3B82F6',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginRight: 8,
  },
  backButton: {
    backgroundColor: '#374151',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
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

export default EvacuationTimeScreen;
