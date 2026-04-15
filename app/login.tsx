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
  ScrollView,
  Image,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
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
  const { width, height } = useWindowDimensions();

  const isWide = width > 600;

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
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isWide && styles.scrollContentWide,
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.inner, isWide && styles.innerWide]}>
              {/* Logo and Branding */}
              <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.brandingContainer}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                <ThemedText style={styles.appName}>INCLUSIÓN 360</ThemedText>
                <ThemedText style={styles.tagline}>Tecnología para todos, sin barreras.</ThemedText>
              </Animated.View>

              {/* Form */}
              <Animated.View entering={FadeInUp.delay(300).duration(800)} style={[styles.formContainer, isWide && styles.formContainerWide]}>
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F8' },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  scrollContentWide: {
    alignItems: 'center',
  },
  inner: {
    width: '100%',
  },
  innerWide: {
    maxWidth: 440,
  },
  brandingContainer: { alignItems: 'center', marginBottom: 32 },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E14F4F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  appName: { fontSize: 26, fontWeight: '900', color: '#E14F4F', letterSpacing: 3, textAlign: 'center' },
  tagline: { fontSize: 14, color: '#888', marginTop: 6, textAlign: 'center' },
  formContainer: {
    backgroundColor: '#FFF',
    padding: 28,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 5,
  },
  formContainerWide: {
    padding: 36,
  },
  welcomeText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1A1A1A' },
  instructionText: { fontSize: 14, color: '#A0A0A0', textAlign: 'center', marginBottom: 24, marginTop: 4 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 12,
  },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A', outlineStyle: 'none' as any },
  errorText: { color: '#E14F4F', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  loginBtn: {
    backgroundColor: '#E14F4F',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, color: '#E14F4F', fontWeight: 'bold' },
});
