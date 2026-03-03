import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useState, useEffect } from 'react';
import { getCertificate } from '../services/api';
import { Certificate } from '../types/certificate';

type Route = RouteProp<RootStackParamList, 'Certificate'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'Certificate'>;

export default function CertificateScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = route.params?.certificateId;
    if (!id) {
      setError('No certificate ID provided');
      setLoading(false);
      return;
    }

    getCertificate(id)
      .then(data => {
        setCertificate(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [route.params?.certificateId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading certificate...</Text>
      </View>
    );
  }

  if (error || !certificate) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>❌ {error ?? 'Certificate not found'}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const verified = certificate.hash_verified;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Status badge */}
      <View style={[styles.badge, verified ? styles.badgeSuccess : styles.badgeFail]}>
        <Text style={styles.badgeText}>
          {verified ? '✅ CERTIFIED' : '❌ FAILED'}
        </Text>
      </View>

      <Text style={styles.fileName} numberOfLines={2}>
        {certificate.file_name}
      </Text>

      {/* Hash section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INTEGRITY</Text>
        <Row label="Device Hash" value={certificate.device_hash} mono />
        <Row label="Server Hash" value={certificate.server_hash ?? '-'} mono />
        <Row label="Match" value={verified ? '✅ Verified' : '❌ Mismatch'} />
      </View>

      {/* File info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FILE</Text>
        <Row label="Name" value={certificate.file_name} />
        <Row label="Size" value={`${(certificate.file_size / 1024).toFixed(1)} KB`} />
        <Row label="Type" value={certificate.mime_type} />
      </View>

      {/* Capture info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CAPTURE</Text>
        <Row label="Captured At" value={new Date(certificate.captured_at).toLocaleString()} />
        <Row label="Device" value={certificate.device_model} />
        <Row label="OS" value={certificate.os_version} />
        {certificate.gps_lat && (
          <Row
            label="GPS"
            value={`${certificate.gps_lat?.toFixed(5) ?? '?'}, ${certificate.gps_lon?.toFixed(5) ?? '?'}`}
          />
        )}
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>← Back to Home</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.mono]} numberOfLines={2}>
        {value ?? '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 24, paddingBottom: 48 },
  centered: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 24 },
  badge: { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  badgeSuccess: { backgroundColor: '#166534' },
  badgeFail: { backgroundColor: '#7f1d1d' },
  badgeText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  fileName: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 },
  section: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, marginBottom: 16 },
  sectionTitle: { color: '#555555', fontSize: 11, letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { color: '#888888', fontSize: 13, flex: 1 },
  rowValue: { color: '#ffffff', fontSize: 13, flex: 2, textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 11, color: '#60a5fa' },
  loadingText: { color: '#888888', marginTop: 12 },
  errorText: { color: '#ff4444', fontSize: 16, marginBottom: 24 },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});