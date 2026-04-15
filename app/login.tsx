import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (text: string) => { setEmail(text); if (error) setError(null); };
  const handlePasswordChange = (text: string) => { setPassword(text); if (error) setError(null); };

  const handleLogin = async () => {
    setError(null);
    if (!EMAIL_RE.test(email)) return setError('Correo inválido');
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');

    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.brandingContainer}>
            <View style={styles.logoContainer}>
              <IconSymbol name="accessible" size={60} color="#FFF" />
            </View>
            <ThemedText style={styles.appName}>INCLUSIÓN DIGITAL</ThemedText>
            <ThemedText style={styles.tagline}>Tecnología para todos, sin barreras.</ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.formContainer}>
            <ThemedText style={styles.welcomeText}>¡Bienvenido de nuevo!</ThemedText>
            <ThemedText style={styles.instructionText}>Inicia sesión para continuar</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Correo Electrónico</ThemedText>
              <View style={styles.inputWrapper}>
                <IconSymbol name="person.fill" size={20} color="#A0A0A0" />
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#A0A0A0"
                  value={email}
                  onChangeText={handleEmailChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Contraseña</ThemedText>
              <View style={styles.inputWrapper}>
                <IconSymbol name="keyboard" size={20} color="#A0A0A0" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#A0A0A0"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  editable={!loading}
                />
              </View>
            </View>

            {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

            <Pressable
              style={[styles.loginBtn, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <ThemedText style={styles.loginBtnText}>INICIAR SESIÓN</ThemedText>
              )}
            </Pressable>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>¿No tienes cuenta? </ThemedText>
              <Pressable onPress={() => router.push('/register' as any)} style={{ padding: 4 }} accessibilityRole="link">
                <ThemedText style={styles.linkText}>Regístrate</ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F8' },
  keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  brandingContainer: { alignItems: 'center', marginBottom: 40 },
  logoContainer: {
    width: 100, height: 100, borderRadius: 30, backgroundColor: '#E14F4F',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#E14F4F', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10, marginBottom: 20,
  },
  appName: { fontSize: 24, fontWeight: '900', color: '#E14F4F', letterSpacing: 2, textAlign: 'center' },
  tagline: { fontSize: 14, color: '#666', marginTop: 8 },
  formContainer: {
    backgroundColor: '#FFF', padding: 30, borderRadius: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05, shadowRadius: 30, elevation: 5,
  },
  welcomeText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  instructionText: { fontSize: 14, color: '#A0A0A0', textAlign: 'center', marginBottom: 24, marginTop: 4 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8',
    borderRadius: 16, paddingHorizontal: 16, height: 56,
    borderWidth: 1, borderColor: '#F0F0F0', gap: 12,
  },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  errorText: { color: '#E14F4F', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  loginBtn: {
    backgroundColor: '#E14F4F', height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 6,
  },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, color: '#E14F4F', fontWeight: 'bold' },
});
