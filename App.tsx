import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen        from './src/screens/HomeScreen';
import CameraScreen      from './src/screens/CameraScreen';
import CertificateScreen from './src/screens/CertificateScreen';
import OnboardingScreen, {
  STORAGE_KEY_NAME,
  STORAGE_KEY_DNI,
} from './src/screens/OnboardingScreen';

export type RootStackParamList = {
  Home:        undefined;
  Camera:      undefined;
  Certificate: { certificateId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [loading,   setLoading]   = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [name, dni] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_NAME),
          AsyncStorage.getItem(STORAGE_KEY_DNI),
        ]);
        setOnboarded(!!(name && dni));
      } catch {
        setOnboarded(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a',
                     justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#7c6aff" size="large" />
      </View>
    );
  }

  if (!onboarded) {
    return <OnboardingScreen onComplete={() => setOnboarded(true)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle:         { backgroundColor: '#0a0a0a' },
          headerTintColor:     '#ffffff',
          headerTitleStyle:    { fontWeight: 'bold' },
          contentStyle:        { backgroundColor: '#0a0a0a' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'CertifAI' }}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ title: 'Capture', headerShown: false }}
        />
        <Stack.Screen
          name="Certificate"
          component={CertificateScreen}
          options={{ title: 'Certificate' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}