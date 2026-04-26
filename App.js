import * as Sentry from '@sentry/react-native';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef, flushPendingNavigation } from './src/lib/navigationRef';
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
import { UserProfileProvider } from './src/context/UserProfileContext';
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
import AccountInfoScreen from './src/screens/AccountInfoScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
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
  // Cold-open: NavigationContainer mount edilmeden önce push'tan açılıp
  // açılmadığımıza karar vereceğiz; karar verilene kadar Splash sürer.
  const [initialPushChecked, setInitialPushChecked] = useState(false);
  const [initialPushTarget, setInitialPushTarget] = useState(null);
  const { theme, isDark } = useTheme();
  const { onboardingStatus, addNotification } = useNotifications();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remoteMessage = await messaging().getInitialNotification();
        if (!cancelled && remoteMessage) {
          await addNotification(remoteMessage, 'cold-open');
          setInitialPushTarget('Notifications');
        }
      } catch {
        // Sessizce geç — initial state default kalır.
      } finally {
        if (!cancelled) setInitialPushChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [addNotification]);

  if (!splashDone || !initialPushChecked) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  if (!onboardingDismissed && onboardingStatus === 'pending') {
    return <NotificationOnboardingScreen onFinish={() => setOnboardingDismissed(true)} />;
  }

  // Cold-open push varsa stack: [MainTabs, Notifications] — geri tuşu Home'a düşürür.
  const initialState = initialPushTarget === 'Notifications'
    ? { routes: [{ name: 'MainTabs' }, { name: 'Notifications' }] }
    : undefined;

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <NavigationContainer
        ref={navigationRef}
        onReady={flushPendingNavigation}
        initialState={initialState}
      >
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
          <RootStack.Screen name="AccountInfo" component={AccountInfoScreen} />
          <RootStack.Screen name="Notifications" component={NotificationsScreen} />
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
          <UserProfileProvider>
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
          </UserProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(App);
