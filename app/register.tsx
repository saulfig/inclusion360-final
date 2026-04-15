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
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
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
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Volver">
              <IconSymbol name="chevron.right" size={20} color="#1A1A1A" />
            </Pressable>

            <View style={styles.header}>
              <ThemedText style={styles.title}>Crear cuenta</ThemedText>
              <ThemedText style={styles.subtitle}>Únete a Inclusión Digital</ThemedText>
            </View>

            <View style={styles.formContainer}>
              {success ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <IconSymbol name="checkmark.circle.fill" size={60} color="#34C759" />
                  <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginTop: 16, textAlign: 'center' }}>¡Cuenta creada!</ThemedText>
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
                    <Pressable onPress={() => router.replace('/login')} style={{ padding: 4 }}>
                      <ThemedText style={styles.linkText}>Inicia sesión</ThemedText>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F8' },
  scroll: { padding: 24, paddingTop: 12 },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '180deg' }],
  },
  header: { marginTop: 20, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  formContainer: {
    backgroundColor: '#FFF', padding: 24, borderRadius: 32,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 20, elevation: 3,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8',
    borderRadius: 16, paddingHorizontal: 16, height: 56,
    borderWidth: 1, borderColor: '#F0F0F0', gap: 12,
  },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  errorText: { color: '#E14F4F', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn: {
    backgroundColor: '#E14F4F', height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 6,
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, color: '#E14F4F', fontWeight: 'bold' },
});
