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

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Muttusami',
    age: '54',
    mobile: '0710833711',
    location: 'Nuwara Eliya',
  });

  const [editInfo, setEditInfo] = useState({ ...userInfo });

  const handleEditPress = () => {
    setIsEditMode(true);
    setEditInfo({ ...userInfo });
  };

  const handleSave = () => {
    if (!editInfo.name || !editInfo.age || !editInfo.mobile || !editInfo.location) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setUserInfo({ ...editInfo });
    setIsEditMode(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditInfo({ ...userInfo });
  };

  const ProfileView = () => (
    <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
      {/* Screen Title Bar */}
      <View style={styles.screenTitleBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.profileContent}>
        {/* Profile Picture */}
        <View style={styles.profilePicture}>
          <Icon name="person" size={60} color="#9CA3AF" />
        </View>

        {/* Profile Information */}
        <View style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{userInfo.name}</Text>
            <TouchableOpacity style={styles.editIcon}>
              <Icon name="add" size={20} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{userInfo.age}</Text>
            <TouchableOpacity style={styles.editIcon}>
              <Icon name="add" size={20} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{userInfo.mobile}</Text>
            <TouchableOpacity style={styles.editIcon}>
              <Icon name="add" size={20} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{userInfo.location}</Text>
            <TouchableOpacity style={styles.editIcon}>
              <Icon name="add" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditPress}>
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const ProfileEdit = () => (
    <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
      {/* Screen Title Bar */}
      <View style={styles.screenTitleBar}>
        <TouchableOpacity onPress={handleCancel}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Edit</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.profileContent}>
        {/* Profile Picture with Edit Icon */}
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePicture}>
            <Icon name="person" size={60} color="#9CA3AF" />
          </View>
          <TouchableOpacity style={styles.editPictureButton}>
            <Icon name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Editable Profile Information */}
        <View style={styles.editForm}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
              style={styles.textInput}
              value={editInfo.name}
              onChangeText={(text) => setEditInfo({ ...editInfo, name: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Age:</Text>
            <TextInput
              style={styles.textInput}
              value={editInfo.age}
              onChangeText={(text) => setEditInfo({ ...editInfo, age: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Number:</Text>
            <TextInput
              style={styles.textInput}
              value={editInfo.mobile}
              onChangeText={(text) => setEditInfo({ ...editInfo, mobile: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Location:</Text>
            <TextInput
              style={styles.textInput}
              value={editInfo.location}
              onChangeText={(text) => setEditInfo({ ...editInfo, location: text })}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="home" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ResQ-LK</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="settings" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      {isEditMode ? <ProfileEdit /> : <ProfileView />}

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
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  mainContent: {
    flex: 1,
    backgroundColor: 'white',
  },
  screenTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    marginLeft: 10,
  },
  profileContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  editPictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginBottom: 40,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  editIcon: {
    marginLeft: 10,
  },
  editProfileButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editForm: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    marginBottom: 8,
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 8,
    fontSize: 16,
    color: 'black',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
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

export default ProfileScreen;
