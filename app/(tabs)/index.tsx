import { StyleSheet, View, ScrollView, SafeAreaView, Pressable, ActivityIndicator, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type AlertRow = Database['public']['Tables']['alerts']['Row'];

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [recentAlerts, setRecentAlerts] = useState<AlertRow[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [placeCount, setPlaceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [alertsRes, placesRes] = await Promise.all([
      supabase.from('alerts').select('*', { count: 'exact' }).eq('user_id', user.id).order('detected_at', { ascending: false }).limit(3),
      supabase.from('places').select('*', { count: 'exact', head: true }),
    ]);
    setRecentAlerts(alertsRes.data ?? []);
    setAlertCount(alertsRes.count ?? 0);
    setPlaceCount(placesRes.count ?? 0);
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={{ width: 36, height: 36 }}
              resizeMode="contain"
            />
            <View>
              <ThemedText style={styles.greeting}>{greeting()},</ThemedText>
              <ThemedText style={styles.userName}>{profile?.full_name ?? 'Usuario'}</ThemedText>
            </View>
          </View>
          <Pressable style={styles.avatarBtn} onPress={() => router.push('/(tabs)/perfil')}>
            <IconSymbol name="person.crop.circle.fill" size={44} color="#E14F4F" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#FFE5E5' }]}>
              <IconSymbol name="bell.fill" size={20} color="#E14F4F" />
              <ThemedText style={styles.statNum}>{alertCount}</ThemedText>
              <ThemedText style={styles.statLabel}>Alertas</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#E8F8EE' }]}>
              <IconSymbol name="map.fill" size={20} color="#34C759" />
              <ThemedText style={styles.statNum}>{placeCount}</ThemedText>
              <ThemedText style={styles.statLabel}>Lugares</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FFF4E0' }]}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#FF9500" />
              <ThemedText style={styles.statNum}>{profile?.points ?? 0}</ThemedText>
              <ThemedText style={styles.statLabel}>Puntos</ThemedText>
            </View>
          </View>

          <View style={styles.accessibilityBanner}>
            <View style={styles.bannerIcon}>
              <IconSymbol name="figure.roll" size={24} color="#E14F4F" />
            </View>
            <View style={styles.bannerTextContainer}>
              <ThemedText style={styles.bannerLabel}>ESPACIOS</ThemedText>
              <ThemedText style={styles.bannerTitle}>100% Accesibles</ThemedText>
            </View>
          </View>

          <View style={styles.actionsGrid}>
            <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/mapa')}>
              <IconSymbol name="map.fill" size={28} color="#E14F4F" />
              <ThemedText style={styles.actionTitle}>Explorar lugares</ThemedText>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/traductor')}>
              <IconSymbol name="hand.raised.fill" size={28} color="#E14F4F" />
              <ThemedText style={styles.actionTitle}>Traducir señas</ThemedText>
            </Pressable>
          </View>

          <View style={styles.alertasSection}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="clock.arrow.circlepath" size={16} color="#666" />
              <ThemedText style={styles.sectionTitle}>Últimas alertas detectadas</ThemedText>
            </View>

            {loading ? (
              <ActivityIndicator color="#E14F4F" style={{ marginTop: 12 }} />
            ) : recentAlerts.length > 0 ? (
              <View style={{ gap: 8 }}>
                {recentAlerts.map((a) => (
                  <Pressable key={a.id} style={styles.lastAlertCard} onPress={() => router.push('/(tabs)/alertas')}>
                    <View style={[styles.alertDot, { backgroundColor: a.severity === 'high' ? '#FF3B30' : a.severity === 'medium' ? '#FF9500' : '#34C759' }]} />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.alertCardTitle}>{a.type}</ThemedText>
                      {a.description && (
                        <ThemedText style={styles.alertCardDesc} numberOfLines={2}>
                          {a.description}
                        </ThemedText>
                      )}
                    </View>
                    <IconSymbol name="chevron.right" size={16} color="#A0A0A0" />
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={styles.emptyAlert}>
                <ThemedText style={styles.emptyAlertText}>No hay alertas aún</ThemedText>
                <Pressable onPress={() => router.push('/(tabs)/alertas')}>
                  <ThemedText style={styles.emptyAlertLink}>Ir a alertas →</ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  greeting: { fontSize: 14, color: '#666' },
  userName: { fontSize: 22, fontWeight: 'bold' },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#666' },
  accessibilityBanner: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24,
    flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3,
  },
  bannerIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFF5F2', justifyContent: 'center', alignItems: 'center' },
  bannerTextContainer: { flex: 1 },
  bannerLabel: { fontSize: 10, fontWeight: 'bold', color: '#A0A0A0' },
  bannerTitle: { fontSize: 18, fontWeight: 'bold' },
  actionsGrid: { flexDirection: 'row', gap: 14, marginBottom: 28 },
  actionCard: {
    flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 20,
    alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 2,
  },
  actionTitle: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  alertasSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 14, color: '#666', fontWeight: '600' },
  lastAlertCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  alertDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E14F4F' },
  alertCardTitle: { fontSize: 15, fontWeight: 'bold' },
  alertCardDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  emptyAlert: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: '#F0F0F0', gap: 6,
  },
  emptyAlertText: { color: '#999' },
  emptyAlertLink: { color: '#E14F4F', fontWeight: 'bold' },
});
