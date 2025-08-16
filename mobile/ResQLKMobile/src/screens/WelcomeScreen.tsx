import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const handleActionPress = (action: string) => {
    switch (action) {
      case 'rescue':
        navigation.navigate('Emergency');
        break;
      case 'relief':
        navigation.navigate('Relief');
        break;
      case 'volunteer':
        navigation.navigate('Volunteer');
        break;
      case 'map':
        navigation.navigate('Map');
        break;
    }
  };

  const ActionButton = ({ title, icon, onPress, color }: any) => (
    <TouchableOpacity style={[styles.actionButton, { backgroundColor: color }]} onPress={onPress}>
      <Icon name={icon} size={32} color="white" />
      <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.languageContainer}>
              <Text style={styles.languageText}>{selectedLanguage}</Text>
              <Icon name="keyboard-arrow-down" size={20} color="white" />
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="notifications" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="settings" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.welcomeText}>WELCOME</Text>
          <Text style={styles.appName}>ResQ-LK</Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        <View style={styles.actionGrid}>
          <View style={styles.actionRow}>
            <ActionButton
              title="Request Rescue"
              icon="emergency"
              color="#DC2626"
              onPress={() => handleActionPress('rescue')}
            />
            <ActionButton
              title="Book Relief"
              icon="local-hospital"
              color="#059669"
              onPress={() => handleActionPress('relief')}
            />
          </View>
          <View style={styles.actionRow}>
            <ActionButton
              title="Volunteer"
              icon="volunteer-activism"
              color="#7C3AED"
              onPress={() => handleActionPress('volunteer')}
            />
            <ActionButton
              title="Live Map"
              icon="map"
              color="#2563EB"
              onPress={() => handleActionPress('map')}
            />
          </View>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.infoText}>
            Emergency Response System for Sri Lanka
          </Text>
          <Text style={styles.infoSubtext}>
            Get help when you need it most
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  languageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appName: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  actionGrid: {
    marginBottom: 40,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomInfo: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
