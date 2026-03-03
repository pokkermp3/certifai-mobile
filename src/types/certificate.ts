export interface CaptureMetadata {
  device_id: string;
  device_model: string;
  os_version: string;
  app_version: string;
  gps_lat: number | null;
  gps_lon: number | null;
  gps_accuracy: number | null;
  captured_at: string;
}

export interface Certificate {
  id: string;
  case_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  file_type: string;
  device_hash: string;
  server_hash: string | null;
  hash_verified: boolean;
  status: 'pending' | 'certified' | 'hash_mismatch' | 'failed';
  captured_at: string;
  certified_at: string | null;
  gps_lat: number | null;
  gps_lon: number | null;
  gps_accuracy: number | null;
  gps_maps_url: string | null;
  device_model: string;
  os_version: string;
  app_version: string;
  pdf_url: string | null;
  file_url: string | null;
}

export interface CertifyResponse {
  certificate_id: string;
  upload_url: string;
}

export interface UploadResponse {
  certificate_id: string;
  hash_verified: boolean;
  server_hash: string;
  device_hash: string;
  status: string;
  pdf_download_url: string;
  file_download_url: string;
}