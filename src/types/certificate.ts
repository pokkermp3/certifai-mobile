export interface CaptureMetadata {
  deviceId: string;
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  gpsLat: number | null;
  gpsLon: number | null;
  gpsAccuracy: number | null;
  capturedAt: string; // ISO string
}

export interface Certificate {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  deviceHash: string;
  serverHash: string | null;
  hashVerified: boolean;
  status: 'pending' | 'certified' | 'failed';
  capturedAt: string;
  gpsLat: number | null;
  gpsLon: number | null;
  pdfUrl: string | null;
  fileUrl: string | null;
  metadata: CaptureMetadata;
}

export interface CertifyResponse {
  certificateId: string;
  uploadUrl: string;
}

export interface UploadResponse {
  certificateId: string;
  hashVerified: boolean;
  serverHash: string;
  deviceHash: string;
  status: string;
  pdfUrl: string;
  fileUrl: string;
}