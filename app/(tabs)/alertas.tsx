import { StyleSheet, View, ScrollView, Pressable, SafeAreaView, ActivityIndicator } from 'react-native';
import { showAlert } from '@/lib/alert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Database } from '@/types/database';

type AlertRow = Database['public']['Tables']['alerts']['Row'];

const RANDOM_TYPES = [
  { type: 'Timbre de Puerta', severity: 'low', desc: 'Frecuencia rítmica detectada en la entrada.' },
  { type: 'Alarma de Incendio', severity: 'high', desc: 'Señal intermitente de alta frecuencia.' },
  { type: 'Claxon de vehículo', severity: 'medium', desc: 'Sonido vehicular cercano detectado.' },
  { type: 'Llanto de bebé', severity: 'medium', desc: 'Patrón vocal continuo identificado.' },
  { type: 'Sirena de Emergencia', severity: 'high', desc: 'Sonido de emergencia a alta intensidad.' },
] as const;

export default function AlertasScreen() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<'todos' | 'high' | 'medium' | 'low'>('todos');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('detected_at', { ascending: false });
    setAlerts(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`alerts:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setAlerts((prev) => [payload.new as AlertRow, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'alerts', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setAlerts((prev) => prev.filter((a) => a.id !== (payload.old as AlertRow).id));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const simulateAlert = async () => {
    if (!user) return;
    setCreating(true);
    const sample = RANDOM_TYPES[Math.floor(Math.random() * RANDOM_TYPES.length)];
    const { error } = await supabase.from('alerts').insert({
      user_id: user.id, type: sample.type, severity: sample.severity, description: sample.desc,
    });
    setCreating(false);
    if (error) showAlert('Error', 'No se pudo crear la alerta');
  };

  const deleteAlert = async (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    const { error } = await supabase.from('alerts').delete().eq('id', id);
    if (error) {
      showAlert('Error', 'No se pudo eliminar');
      load();
    }
  };

  const clearAll = () => {
    if (!user || alerts.length === 0) return;
    showAlert('Limpiar historial', '¿Eliminar todas las alertas?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setAlerts([]);
          const { error } = await supabase.from('alerts').delete().eq('user_id', user.id);
          if (error) { showAlert('Error', 'No se pudo limpiar'); load(); }
        },
      },
    ]);
  };

  const filtered = filter === 'todos' ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.headerTitle}>Alertas</ThemedText>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <ThemedText style={styles.liveText}>EN VIVO</ThemedText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={styles.iconBtn} onPress={clearAll}>
              <IconSymbol name="xmark" size={16} color="#666" />
            </Pressable>
            <Pressable
              style={[styles.simulateBtn, creating && { opacity: 0.6 }]}
              onPress={simulateAlert}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <IconSymbol name="bell.fill" size={16} color="#FFF" />
                  <ThemedText style={styles.simulateText}>Simular</ThemedText>
                </>
              )}
            </Pressable>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {(['todos', 'high', 'medium', 'low'] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
            >
              <ThemedText style={filter === f ? styles.filterTextActive : styles.filterText}>
                {f === 'todos' ? 'Todos' : f === 'high' ? 'Alta' : f === 'medium' ? 'Media' : 'Baja'}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color="#E14F4F" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <IconSymbol name="bell.fill" size={48} color="#E0E0E0" />
            <ThemedText style={styles.emptyText}>No hay alertas</ThemedText>
            <ThemedText style={styles.emptySub}>Pulsa "Simular" para crear una</ThemedText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {filtered.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInUp.delay(index * 50)}>
                <View style={styles.alertCard}>
                  <View style={[styles.typeIndicator, { backgroundColor: getSeverityColor(item.severity) }]} />
                  <View style={styles.alertContent}>
                    <View style={styles.alertTop}>
                      <ThemedText style={styles.alertTitle}>{item.type}</ThemedText>
                      <ThemedText style={styles.alertTime}>{formatTime(item.detected_at)}</ThemedText>
                    </View>
                    {item.description && (
                      <ThemedText style={styles.alertDesc} numberOfLines={2}>
                        {item.description}
                      </ThemedText>
                    )}
                  </View>
                  <Pressable onPress={() => deleteAlert(item.id)} style={styles.deleteBtn}>
                    <IconSymbol name="xmark" size={16} color="#999" />
                  </Pressable>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function getSeverityColor(severity: string | null) {
  switch (severity) {
    case 'high': return '#FF3B30';
    case 'medium': return '#FF9500';
    default: return '#34C759';
  }
}

function formatTime(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F8' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' },
  liveText: { fontSize: 10, fontWeight: 'bold', color: '#34C759', letterSpacing: 1 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0',
  },
  simulateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E14F4F', paddingHorizontal: 16, height: 40, borderRadius: 12,
  },
  simulateText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  filterScroll: { maxHeight: 44 },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0',
  },
  filterChipActive: { backgroundColor: '#E14F4F', borderColor: '#E14F4F' },
  filterText: { fontSize: 12, color: '#666' },
  filterTextActive: { fontSize: 12, color: '#FFF', fontWeight: 'bold' },
  scrollContent: { padding: 20, gap: 12 },
  alertCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 12,
  },
  typeIndicator: { width: 6, height: 40, borderRadius: 3 },
  alertContent: { flex: 1 },
  alertTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  alertTime: { fontSize: 12, color: '#E14F4F', fontWeight: '600' },
  alertDesc: { fontSize: 12, color: '#666', marginTop: 4 },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F8F8F8',
    justifyContent: 'center', alignItems: 'center',
  },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#BBB' },
});
