import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY_NAME = '@certifai_user_name';
export const STORAGE_KEY_DNI  = '@certifai_user_dni';

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [name, setName]     = useState('');
  const [dni, setDni]       = useState('');
  const [saving, setSaving] = useState(false);

  const isValid = name.trim().length > 2 && dni.trim().length >= 7;

  async function handleSave() {
    if (!isValid) {
      Alert.alert('Missing information', 'Please enter your full name and DNI.');
      return;
    }
    setSaving(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_NAME, name.trim());
      await AsyncStorage.setItem(STORAGE_KEY_DNI,  dni.trim().toUpperCase());
      onComplete();
    } catch {
      Alert.alert('Error', 'Could not save your information. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>
          Certif<Text style={styles.accent}>AI</Text>
        </Text>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Enter your details once. They will be attached to every certified
          photo you submit so your insurer can identify your claim.
        </Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Juan García López"
          placeholderTextColor="#555"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Text style={styles.label}>DNI</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 12345678A"
          placeholderTextColor="#555"
          value={dni}
          onChangeText={setDni}
          autoCapitalize="characters"
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <Text style={styles.privacy}>
          🔒 Stored only on this device.
        </Text>

        <TouchableOpacity
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!isValid || saving}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Continue</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: '#222',
  },
  logo: {
    fontSize: 26, fontWeight: '700', color: '#e8e8f0',
    marginBottom: 20, textAlign: 'center', letterSpacing: -0.5,
  },
  accent:       { color: '#7c6aff' },
  title:        { fontSize: 20, fontWeight: '700', color: '#e8e8f0', marginBottom: 8 },
  subtitle:     { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 28 },
  label:        { fontSize: 12, color: '#888', marginBottom: 6, fontWeight: '600',
                  textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#222',
    borderRadius: 10, color: '#e8e8f0', fontSize: 15,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20,
  },
  privacy:      { fontSize: 12, color: '#444', marginBottom: 24 },
  button: {
    backgroundColor: '#7c6aff', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#2a2a40' },
  buttonText:     { color: '#fff', fontSize: 15, fontWeight: '700' },
});