import * as Sentry from '@sentry/react-native';
import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/ThemeContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { StatsProvider } from './src/context/StatsContext';
import { BadgesProvider } from './src/context/BadgesContext';
import { AudioProvider } from './src/context/AudioContext';
import { AuthProvider } from './src/context/AuthContext';
import { RemoteConfigProvider } from './src/context/RemoteConfigContext';
import { NotificationProvider, useNotifications } from './src/context/NotificationContext';
import BadgePopup from './src/components/BadgePopup';
import SplashScreen from './src/screens/SplashScreen';
import NotificationOnboardingScreen from './src/screens/NotificationOnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import ModScreen from './src/screens/ModScreen';
import CardScreen from './src/screens/CardScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import TabBar from './src/components/TabBar';

Sentry.init({
  dsn: 'https://d16a2e5547169720bfb1be9b6cb5dfd1@o4511281614487552.ingest.de.sentry.io/4511281616257104',
  tracesSampleRate: 1.0,
});

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppShell() {
  const [splashDone, setSplashDone] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const { theme, isDark } = useTheme();
  const { onboardingStatus } = useNotifications();

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  if (!onboardingDismissed && onboardingStatus === 'pending') {
    return <NotificationOnboardingScreen onFinish={() => setOnboardingDismissed(true)} />;
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen name="Category" component={CategoryScreen} />
          <RootStack.Screen name="Mod" component={ModScreen} />
          <RootStack.Screen
            name="Cards"
            component={CardScreen}
            options={{ gestureEnabled: false }}
          />
          <RootStack.Screen
            name="Login"
            component={LoginScreen}
            options={{ presentation: 'modal' }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
      <BadgePopup />
    </>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <RemoteConfigProvider>
            <NotificationProvider>
              <AudioProvider>
                <StatsProvider>
                  <FavoritesProvider>
                    <BadgesProvider>
                      <AppShell />
                    </BadgesProvider>
                  </FavoritesProvider>
                </StatsProvider>
              </AudioProvider>
            </NotificationProvider>
          </RemoteConfigProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(App);
