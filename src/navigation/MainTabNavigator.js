import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import MyProductsScreen from '../screens/MyProductsScreen';
import InfoScreen from '../screens/InfoScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CurvedTabBar from '../components/CurvedTabBar';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={(props) => <CurvedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
      />
      <Tab.Screen
        name="MyProductsTab"
        component={MyProductsScreen}
      />
      <Tab.Screen
        name="InfoTab"
        component={InfoScreen}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
