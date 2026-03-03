import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import CertificateScreen from './src/screens/CertificateScreen';

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Certificate: { certificateId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0a0a' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#0a0a0a' },
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