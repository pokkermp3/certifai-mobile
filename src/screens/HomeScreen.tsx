import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { listCertificates } from '../services/api';
import { Certificate } from '../types/certificate';
import { useState, useCallback, useRef } from 'react';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const CACHE_TTL_MS = 30_000; // re-fetch only if 30 seconds have passed

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const lastFetchedAt = useRef<number>(0);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const stale = now - lastFetchedAt.current > CACHE_TTL_MS;
      if (!stale) return; // skip fetch if cache is still fresh

      setLoading(true);
      listCertificates()
        .then(data => {
          setCertificates(data.certificates ?? []);
          lastFetchedAt.current = Date.now();
        })
        .catch(() => setCertificates([]))
        .finally(() => setLoading(false));
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🔒</Text>
        <Text style={styles.title}>CertifAI</Text>
        <Text style={styles.subtitle}>
          Certify files with cryptographic proof
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.buttonText}>📷  Capture & Certify</Text>
      </TouchableOpacity>

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Recent Certificates</Text>

        {loading ? (
          <ActivityIndicator
            size="small"
            color="#2563eb"
            style={styles.loader}
          />
        ) : certificates.length === 0 ? (
          <Text style={styles.emptyText}>No certificates yet</Text>
        ) : (
          <FlatList
            data={certificates.slice(0, 10)}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() =>
                  navigation.navigate('Certificate', { certificateId: item.id })
                }
              >
                <Text style={styles.listItemName} numberOfLines={1}>
                  {item.file_name}
                </Text>
                <Text style={styles.listItemStatus}>
                  {item.hash_verified ? '✅ Certified' : '❌ Failed'}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 24 },
  hero: { alignItems: 'center', marginTop: 60, marginBottom: 48 },
  logo: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888888', textAlign: 'center' },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  listSection: { marginTop: 40 },
  listTitle: {
    color: '#888888',
    fontSize: 13,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loader: { marginTop: 24 },
  emptyText: { color: '#555555', fontSize: 14, textAlign: 'center', marginTop: 24 },
  listItem: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemName: { color: '#ffffff', fontSize: 14, flex: 1, marginRight: 8 },
  listItemStatus: { color: '#888888', fontSize: 12 },
});