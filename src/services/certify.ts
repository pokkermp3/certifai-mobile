import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { registerCapture, uploadFile } from './api';
import { Certificate } from '../types/certificate';

// Generate a unique ID
function generateId(): string {
  return 'cert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Hash the file on device
async function hashFile(fileUri: string): Promise<string> {
  const fileContent = await FileSystem.readAsStringAsync(fileUri, {
    encoding: 'base64' as any,
  });
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    fileContent
  );
  return hash;
}

// Get GPS location
async function getLocation(): Promise<{
  lat: number | null;
  lon: number | null;
  accuracy: number | null;
}> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { lat: null, lon: null, accuracy: null };

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
  } catch {
    return { lat: null, lon: null, accuracy: null };
  }
}

// Main certification function
export async function certifyFile(
  fileUri: string,
  fileName: string,
  fileSize: number,
  mimeType: string
): Promise<Certificate> {
  const id = generateId();
  const capturedAt = new Date().toISOString();

  // 1. Hash the file on device
  const deviceHash = await hashFile(fileUri);

  // 2. Get GPS
  const { lat, lon, accuracy } = await getLocation();

  // 3. Get device info
  const deviceId = Device.osInternalBuildId ?? 'unknown';
  const deviceModel = `${Device.manufacturer} ${Device.modelName}`;
  const osVersion = `Android ${Device.osVersion}`;
  const appVersion = '1.0.0';

  // 4. Register capture with backend
  const { certificate_id } = await registerCapture({
    id,
    file_name: fileName,
    file_size: fileSize,
    mime_type: mimeType,
    device_hash: deviceHash,
    captured_at: capturedAt,
    gps_lat: lat,
    gps_lon: lon,
    gps_accuracy: accuracy,
    device_id: deviceId,
    device_model: deviceModel,
    os_version: osVersion,
    app_version: appVersion,
  });

  // 5. Upload the file
  const upload = await uploadFile(certificate_id, fileUri, fileName, mimeType);

  // 6. Return the certificate
  return {
    id: certificate_id,
    fileName,
    fileSize,
    mimeType,
    deviceHash,
    serverHash: upload.server_hash,
    hashVerified: upload.hash_verified,
    status: upload.hash_verified ? 'certified' : 'failed',
    capturedAt,
    gpsLat: lat,
    gpsLon: lon,
    pdfUrl: upload.pdf_url,
    fileUrl: upload.file_url,
    metadata: {
      deviceId,
      deviceModel,
      osVersion,
      appVersion,
      gpsLat: lat,
      gpsLon: lon,
      gpsAccuracy: accuracy,
      capturedAt,
    },
  };
}