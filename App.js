// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from './AppContext';
import VideoFeedScreen from './screens/VideoFeedScreen';
import SettingsScreen from './screens/SettingsScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ color, size }) => {
                let iconName = 'settings';
                if (route.name === 'HenTok') iconName = 'play-circle';
                else if (route.name === 'Favoris') iconName = 'star';
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#6F130A',
              tabBarInactiveTintColor: '#ccc',
              tabBarStyle: {
                backgroundColor: '#0f0e13',
                borderTopWidth: 0,
              },
              headerShown: false,
            })}
          >
            <Tab.Screen name="HenTok" component={VideoFeedScreen} />
            <Tab.Screen name="Favoris" component={FavoritesScreen} />
            <Tab.Screen name="Paramètres" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AppProvider>
  );
}
