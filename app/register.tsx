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
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { width } = useWindowDimensions();

  const isWide = width > 600;

  const handleRegister = async () => {
    setError(null);
    if (fullName.trim().length < 2) return setError('Ingresa tu nombre completo');
    if (!EMAIL_RE.test(email)) return setError('Correo inválido');
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');

    setLoading(true);
    const { error: err } = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
  };

  const handleFullNameChange = (text: string) => { setFullName(text); if (error) setError(null); };
  const handleEmailChange = (text: string) => { setEmail(text); if (error) setError(null); };
  const handlePasswordChange = (text: string) => { setPassword(text); if (error) setError(null); };

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
              {/* Back button */}
              <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Volver">
                <IconSymbol name="chevron.right" size={20} color="#1A1A1A" />
              </Pressable>

              {/* Logo */}
              <View style={styles.brandingContainer}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <ThemedText style={styles.title}>Crear cuenta</ThemedText>
                <ThemedText style={styles.subtitle}>Únete a Inclusión 360</ThemedText>
              </View>

              <View style={[styles.formContainer, isWide && styles.formContainerWide]}>
                {success ? (
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <IconSymbol name="checkmark.circle.fill" size={60} color="#34C759" />
                    <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginTop: 16, textAlign: 'center', color: '#1A1A1A' }}>¡Cuenta creada!</ThemedText>
                    <ThemedText style={{ fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
                      Revisa tu correo electrónico y confirma tu cuenta para iniciar sesión.
                    </ThemedText>
                    <Pressable style={[styles.btn, { marginTop: 24, width: '100%' }]} onPress={() => router.replace('/login')}>
                      <ThemedText style={styles.btnText}>IR A INICIAR SESIÓN</ThemedText>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <View style={styles.inputGroup}>
                      <ThemedText style={styles.label}>Nombre completo</ThemedText>
                      <View style={styles.inputWrapper}>
                        <IconSymbol name="person.fill" size={20} color="#A0A0A0" />
                        <TextInput
                          style={styles.input}
                          placeholder="Tu nombre"
                          placeholderTextColor="#A0A0A0"
                          value={fullName}
                          onChangeText={handleFullNameChange}
                          editable={!loading}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <ThemedText style={styles.label}>Correo electrónico</ThemedText>
                      <View style={styles.inputWrapper}>
                        <IconSymbol name="message.fill" size={20} color="#A0A0A0" />
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
                          placeholder="Mínimo 6 caracteres"
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
                      style={[styles.btn, loading && { opacity: 0.6 }]}
                      onPress={handleRegister}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <ThemedText style={styles.btnText}>CREAR CUENTA</ThemedText>
                      )}
                    </Pressable>

                    <View style={styles.footer}>
                      <ThemedText style={styles.footerText}>¿Ya tienes cuenta? </ThemedText>
                      <Pressable onPress={() => router.replace('/login')} style={{ padding: 4 }} accessibilityRole="link">
                        <ThemedText style={styles.linkText}>Inicia sesión</ThemedText>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '900', color: '#1A1A1A', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4, textAlign: 'center' },
  formContainer: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  formContainerWide: {
    padding: 36,
  },
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
  btn: {
    backgroundColor: '#E14F4F',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, color: '#E14F4F', fontWeight: 'bold' },
});
