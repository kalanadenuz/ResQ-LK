import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import EvacuationTimeScreen from '../screens/EvacuationTimeScreen';
import VolunteerScreen from '../screens/VolunteerScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReliefScreen from '../screens/ReliefScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Emergency: undefined;
  EvacuationTime: undefined;
  Volunteer: undefined;
  Map: undefined;
  Profile: undefined;
  Relief: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Emergency" component={EmergencyScreen} />
        <Stack.Screen name="EvacuationTime" component={EvacuationTimeScreen} />
        <Stack.Screen name="Volunteer" component={VolunteerScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Relief" component={ReliefScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
