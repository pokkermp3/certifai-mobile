import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';

export function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  async function takePicture(): Promise<{
    uri: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  } | null> {
    if (!cameraRef.current) return null;

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1, // max quality — important for integrity
        exif: true, // include EXIF metadata
        skipProcessing: true, // don't alter the file
        shutterSound: false,
      });

      if (!photo) return null;

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(photo.uri);
const fileSize = fileInfo.exists ? (fileInfo as any).size ?? 0 : 0;
      const fileName = `certifai_${Date.now()}.jpg`;

      return {
        uri: photo.uri,
        fileName,
        fileSize,
        mimeType: 'image/jpeg',
      };
    } finally {
      setIsCapturing(false);
    }
  }

  return {
    permission,
    requestPermission,
    cameraRef,
    isCapturing,
    takePicture,
  };
}