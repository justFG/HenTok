  import React from 'react';
  import { NavigationContainer } from '@react-navigation/native';
  import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
  import { Ionicons } from '@expo/vector-icons';
  import { AppProvider } from './AppContext';
  import VideoFeedScreen from './screens/VideoFeedScreen';
  import SettingsScreen from './screens/SettingsScreen';
  import FavoritesScreen from './screens/FavoritesScreen'; // 👈 nouveau

  const Tab = createBottomTabNavigator();

  export default function App() {
    return (
      <AppProvider>
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
              headerShown: false,
              tabBarStyle: {
              backgroundColor: '#0f0e13', // 👈 couleur sombre
              borderTopWidth: 0,          // 👈 optionnel, enlève la bordure blanche
                           },
            })}
          >
            <Tab.Screen name="HenTok" component={VideoFeedScreen} />
            <Tab.Screen name="Favoris" component={FavoritesScreen} />
            <Tab.Screen name="Paramètres" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </AppProvider>
    );
  }
