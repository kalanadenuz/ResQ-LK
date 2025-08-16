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
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const VolunteerScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const shifts = ['Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Night (6PM-12AM)', 'Late Night (12AM-6AM)'];
  const tasks = [
    'First Aid', 'Search & Rescue', 'Food Distribution', 'Transportation',
    'Communication', 'Medical Support', 'Logistics', 'Security'
  ];

  const handleShiftPress = (shift: string) => {
    setSelectedShift(shift);
  };

  const handleTaskPress = (task: string) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter(t => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const handleSignUp = () => {
    if (!name || !idNumber || !mobileNumber || !selectedShift || selectedTasks.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and select at least one task');
      return;
    }

    Alert.alert(
      'Success',
      'Volunteer registration successful! Thank you for your service.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const ShiftButton = ({ shift, isSelected }: any) => (
    <TouchableOpacity
      style={[styles.shiftButton, isSelected && styles.selectedShift]}
      onPress={() => handleShiftPress(shift)}
    >
      <Text style={[styles.shiftText, isSelected && styles.selectedShiftText]}>
        {shift}
      </Text>
    </TouchableOpacity>
  );

  const TaskButton = ({ task, isSelected }: any) => (
    <TouchableOpacity
      style={[styles.taskButton, isSelected && styles.selectedTask]}
      onPress={() => handleTaskPress(task)}
    >
      <Text style={[styles.taskText, isSelected && styles.selectedTaskText]}>
        {task}
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
        <Text style={styles.headerTitle}>Volunteer Registration</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>ID Number</Text>
            <TextInput
              style={styles.textInput}
              value={idNumber}
              onChangeText={setIdNumber}
              placeholder="Enter your ID number"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              style={styles.textInput}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter your mobile number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Shift Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Shift (Choose One)</Text>
          <View style={styles.shiftsContainer}>
            {shifts.map((shift, index) => (
              <ShiftButton
                key={index}
                shift={shift}
                isSelected={selectedShift === shift}
              />
            ))}
          </View>
        </View>

        {/* Task Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Tasks (Choose Multiple)</Text>
          <View style={styles.tasksContainer}>
            {tasks.map((task, index) => (
              <TaskButton
                key={index}
                task={task}
                isSelected={selectedTasks.includes(task)}
              />
            ))}
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  shiftsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shiftButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
  },
  selectedShift: {
    backgroundColor: '#3B82F6',
  },
  shiftText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedShiftText: {
    color: 'white',
    fontWeight: '600',
  },
  tasksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  taskButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
  },
  selectedTask: {
    backgroundColor: '#7C3AED',
  },
  taskText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedTaskText: {
    color: 'white',
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  signUpButtonText: {
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

export default VolunteerScreen;
