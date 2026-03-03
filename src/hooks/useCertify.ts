import { useState } from 'react';
import { certifyFile } from '../services/certify';
import { Certificate } from '../types/certificate';

type Status = 'idle' | 'hashing' | 'registering' | 'uploading' | 'done' | 'error';

export function useCertify() {
  const [status, setStatus] = useState<Status>('idle');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function certify(
    fileUri: string,
    fileName: string,
    fileSize: number,
    mimeType: string
  ) {
    try {
      setError(null);
      setStatus('hashing');
      await new Promise(r => setTimeout(r, 100));

      setStatus('registering');
      const result = await certifyFile(fileUri, fileName, fileSize, mimeType);

      setStatus('uploading');
      await new Promise(r => setTimeout(r, 100));

      setCertificate(result);
      setStatus('done');
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
      setStatus('error');
    }
  }

  function reset() {
    setStatus('idle');
    setCertificate(null);
    setError(null);
  }

  const statusMessage: Record<Status, string> = {
    idle: '',
    hashing: 'Hashing file on device...',
    registering: 'Registering with server...',
    uploading: 'Uploading file...',
    done: 'Certified ✓',
    error: 'Certification failed',
  };

  return {
    status,
    statusMessage: statusMessage[status],
    certificate,
    error,
    certify,
    reset,
  };
}