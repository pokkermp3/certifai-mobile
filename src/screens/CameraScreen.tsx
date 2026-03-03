import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useCamera } from '../hooks/useCamera';
import { useCertify } from '../hooks/useCertify';
import { useEffect } from 'react';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

export default function CameraScreen() {
  const navigation = useNavigation<Nav>();
  const { permission, requestPermission, cameraRef, isCapturing, takePicture } = useCamera();
  const { status, statusMessage, certificate, certify, error } = useCertify();

  const isProcessing = status !== 'idle' && status !== 'done' && status !== 'error';

  useEffect(() => {
    if (status === 'done' && certificate) {
      navigation.replace('Certificate', { certificateId: certificate.id });
    }
  }, [status, certificate]);

  async function handleCapture() {
    const photo = await takePicture();
    if (!photo) return;
    await certify(photo.uri, photo.fileName, photo.fileSize, photo.mimeType);
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        <View style={styles.overlay}>

          {isProcessing && (
            <View style={styles.processingBox}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.processingText}>{statusMessage}</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>❌ {error}</Text>
            </View>
          )}

          {!isProcessing && (
            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
              onPress={handleCapture}
              disabled={isCapturing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          )}

        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 48,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  captureButtonDisabled: { opacity: 0.5 },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
  processingBox: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  processingText: { color: '#ffffff', marginTop: 12, fontSize: 16 },
  errorBox: {
    backgroundColor: 'rgba(220,38,38,0.9)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  errorText: { color: '#ffffff', fontSize: 14 },
  message: { color: '#ffffff', fontSize: 16, textAlign: 'center', marginBottom: 24, padding: 24 },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 24,
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});