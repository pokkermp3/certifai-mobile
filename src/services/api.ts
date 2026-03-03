const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.88.233.1:8080/api/v1';

// Step 1 — Register the capture
export async function registerCapture(data: {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  device_hash: string;
  captured_at: string;
  gps_lat: number | null;
  gps_lon: number | null;
  gps_accuracy: number | null;
  device_id: string;
  device_model: string;
  os_version: string;
  app_version: string;
}): Promise<{ certificate_id: string; upload_url: string }> {
  const response = await fetch(`${BASE_URL}/certificates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to register capture');
  }

  return response.json();
}

// Step 2 — Upload the file
export async function uploadFile(
  certificateId: string,
  fileUri: string,
  fileName: string,
  mimeType: string
): Promise<{
  certificate_id: string;
  hash_verified: boolean;
  server_hash: string;
  device_hash: string;
  status: string;
  pdf_url: string;
  file_url: string;
}> {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as any);

  const response = await fetch(`${BASE_URL}/certificates/${certificateId}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to upload file');
  }

  return response.json();
}

// Get a certificate by ID
export async function getCertificate(id: string) {
  const response = await fetch(`${BASE_URL}/certificates/${id}`);
  if (!response.ok) throw new Error('Certificate not found');
  const data = await response.json();
  // Backend wraps it in { verified, message, certificate }
  return data.certificate ?? data;
}

// List all certificates
export async function listCertificates() {
  const response = await fetch(`${BASE_URL}/certificates`);
  if (!response.ok) throw new Error('Failed to fetch certificates');
  return response.json();
}