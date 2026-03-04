import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { registerCapture, uploadFile } from './api';
import { Certificate } from '../types/certificate';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generate a unique ID
function generateId(): string {
  return 'cert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Hash the file on device
async function hashFile(fileUri: string): Promise<string> {
  const fileContent = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  // Decode base64 to binary string and hash that
  const binaryString = atob(fileContent);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const hashBuffer = await Crypto.digest(
    Crypto.CryptoDigestAlgorithm.SHA256,
    bytes
  );
  
  // Convert to hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
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

async function getPolicyholderInfo(): Promise<{ name: string; dni: string }> {
  const [name, dni] = await Promise.all([
    AsyncStorage.getItem('@certifai_user_name'),
    AsyncStorage.getItem('@certifai_user_dni'),
  ]);
  return { name: name ?? '', dni: dni ?? '' };
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

  // 1. Hash + GPS in parallel
  const [deviceHash, { lat, lon, accuracy }] = await Promise.all([
    hashFile(fileUri),
    getLocation(),
  ]);

  // 2. Get device info
  const deviceId = Device.osInternalBuildId ?? 'unknown';
  const deviceModel = `${Device.manufacturer} ${Device.modelName}`;
  const osVersion = `Android ${Device.osVersion}`;
  const appVersion = '1.0.0';

  // 3. Get policyholder identity
  const { name: policyholderName, dni: policyholderDni } = await getPolicyholderInfo();

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
    policyholder_name: policyholderName,
    policyholder_dni: policyholderDni,
  });

  // 5. Upload the file
  const upload = await uploadFile(certificate_id, fileUri, fileName, mimeType);

  // 6. Return the certificate
     return {
    id: certificate_id,
    case_id: '',
    file_name: fileName,
    file_size: fileSize,
    mime_type: mimeType,
    file_type: 'image',
    device_hash: deviceHash,
    server_hash: upload.server_hash,
    hash_verified: upload.hash_verified,
    status: upload.hash_verified ? 'certified' : 'failed',
    captured_at: capturedAt,
    certified_at: null,
    gps_lat: lat,
    gps_lon: lon,
    gps_accuracy: accuracy,
    gps_maps_url: lat && lon ? `https://maps.google.com/?q=${lat},${lon}` : null,
    device_model: deviceModel,
    os_version: osVersion,
    app_version: appVersion,
    pdf_url: upload.pdf_download_url,
    file_url: upload.file_download_url,
  };
}