import {
  StyleSheet, View, ScrollView, Pressable, SafeAreaView, Switch,
  ActivityIndicator, Modal, TextInput,
} from 'react-native';
import { showAlert } from '@/lib/alert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { getLevel, getNextLevel, getProgress } from '@/lib/levels';

type Settings = { alerts_enabled: boolean; sensitivity: number; ar_enabled: boolean };

const DEFAULT_SETTINGS: Settings = { alerts_enabled: true, sensitivity: 2, ar_enabled: false };

export default function PerfilScreen() {
  const { user, profile, signOut, refreshProfile, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [leaderboard, setLeaderboard] = useState<{ id: string; full_name: string | null; points: number | null }[]>([]);

  const points = profile?.points ?? 0;
  const level = getLevel(points);
  const nextLevel = getNextLevel(points);
  const progress = getProgress(points);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, points')
      .order('points', { ascending: false })
      .limit(5)
      .then(({ data }) => setLeaderboard(data ?? []));
  }, [profile?.points]);

  const settings: Settings = { ...DEFAULT_SETTINGS, ...((profile?.settings as any) ?? {}) };

  const updateSettings = async (patch: Partial<Settings>) => {
    if (!user) return;
    setSaving(true);
    const next = { ...settings, ...patch };
    const { error } = await supabase.from('profiles').update({ settings: next }).eq('id', user.id);
    setSaving(false);
    if (error) showAlert('Error', 'No se pudieron guardar los ajustes');
    else await refreshProfile();
  };

  const saveName = async () => {
    if (!user || editName.trim().length < 2) return;
    const { error } = await supabase.from('profiles').update({ full_name: editName.trim() }).eq('id', user.id);
    if (error) return showAlert('Error', 'No se pudo actualizar');
    await refreshProfile();
    setEditOpen(false);
  };

  const handleLogout = () => {
    showAlert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
    ]);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#E14F4F" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <IconSymbol name="person.crop.circle.fill" size={80} color="#E14F4F" />
            </View>
            <ThemedText style={styles.userName}>{profile?.full_name ?? 'Usuario'}</ThemedText>
            <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
            <Pressable style={styles.editBtn} onPress={() => { setEditName(profile?.full_name ?? ''); setEditOpen(true); }}>
              <ThemedText style={styles.editBtnText}>Editar perfil</ThemedText>
            </Pressable>
          </View>

          <View style={[styles.levelCard, { backgroundColor: level.bg }]}>
            <View style={styles.levelTop}>
              <ThemedText style={styles.levelIcon}>{level.icon}</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.levelLabel}>NIVEL ACTUAL</ThemedText>
                <ThemedText style={[styles.levelName, { color: level.color }]}>{level.name}</ThemedText>
              </View>
              <View style={styles.pointsBox}>
                <ThemedText style={[styles.pointsBoxNum, { color: level.color }]}>{points}</ThemedText>
                <ThemedText style={styles.pointsBoxLabel}>puntos</ThemedText>
              </View>
            </View>
            {nextLevel ? (
              <>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: level.color }]} />
                </View>
                <ThemedText style={styles.progressText}>
                  {nextLevel.min - points} pts para llegar a {nextLevel.name} {nextLevel.icon}
                </ThemedText>
              </>
            ) : (
              <ThemedText style={[styles.progressText, { color: level.color, fontWeight: 'bold' }]}>
                ¡Nivel máximo alcanzado!
              </ThemedText>
            )}
            <View style={styles.perksRow}>
              {level.perks.map((p) => (
                <View key={p} style={styles.perkChip}>
                  <ThemedText style={styles.perkText}>✓ {p}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>CÓMO GANAR PUNTOS</ThemedText>
            <View style={styles.howRow}>
              <ThemedText style={styles.howText}>Reportar un lugar nuevo</ThemedText>
              <ThemedText style={styles.howPts}>+10</ThemedText>
            </View>
            <View style={styles.howRow}>
              <ThemedText style={styles.howText}>Verificar un lugar</ThemedText>
              <ThemedText style={styles.howPts}>+5</ThemedText>
            </View>
            <View style={styles.howRow}>
              <ThemedText style={styles.howText}>Dejar una reseña</ThemedText>
              <ThemedText style={styles.howPts}>+3</ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>TOP CONTRIBUIDORES</ThemedText>
            {leaderboard.map((u, i) => {
              const isMe = u.id === user?.id;
              return (
                <View key={u.id} style={styles.leaderRow}>
                  <ThemedText style={[styles.leaderRank, i < 3 && { color: '#E14F4F' }]}>#{i + 1}</ThemedText>
                  <ThemedText style={[styles.leaderName, isMe && { fontWeight: 'bold', color: '#E14F4F' }]}>
                    {u.full_name ?? 'Usuario'} {isMe && '(tú)'}
                  </ThemedText>
                  <ThemedText style={styles.leaderPts}>{u.points ?? 0} pts</ThemedText>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>AJUSTES DE ACCESIBILIDAD</ThemedText>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIcon}><IconSymbol name="bell.fill" size={20} color="#666" /></View>
                <ThemedText style={styles.rowTitle}>Alertas activadas</ThemedText>
              </View>
              <Switch
                value={settings.alerts_enabled}
                onValueChange={(v) => updateSettings({ alerts_enabled: v })}
                disabled={saving}
                trackColor={{ true: '#E14F4F', false: '#E0E0E0' }}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIcon}><IconSymbol name="ear.fill" size={20} color="#666" /></View>
                <ThemedText style={styles.rowTitle}>Sensibilidad: nivel {settings.sensitivity}</ThemedText>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[1, 2, 3].map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => updateSettings({ sensitivity: n })}
                    style={[styles.levelBtn, settings.sensitivity === n && styles.levelBtnActive]}
                  >
                    <ThemedText style={settings.sensitivity === n ? styles.levelTextActive : styles.levelText}>{n}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.rowIcon}><IconSymbol name="figure.roll" size={20} color="#666" /></View>
                <ThemedText style={styles.rowTitle}>Modo AR</ThemedText>
              </View>
              <Switch
                value={settings.ar_enabled}
                onValueChange={(v) => updateSettings({ ar_enabled: v })}
                disabled={saving}
                trackColor={{ true: '#E14F4F', false: '#E0E0E0' }}
              />
            </View>
          </View>

          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <ThemedText style={styles.logoutText}>Cerrar Sesión</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={editOpen} animationType="slide" transparent onRequestClose={() => setEditOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Editar perfil</ThemedText>
              <Pressable onPress={() => setEditOpen(false)}>
                <IconSymbol name="xmark" size={20} color="#1A1A1A" />
              </Pressable>
            </View>
            <ThemedText style={styles.label}>Nombre</ThemedText>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Tu nombre"
              placeholderTextColor="#A0A0A0"
            />
            <Pressable style={styles.saveBtn} onPress={saveName}>
              <ThemedText style={styles.saveBtnText}>GUARDAR</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F8' },
  content: { padding: 20, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', paddingVertical: 24 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  userName: { fontSize: 22, fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 4 },
  levelCard: { borderRadius: 20, padding: 18, marginBottom: 16 },
  levelTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  levelIcon: { fontSize: 36 },
  levelLabel: { fontSize: 10, fontWeight: 'bold', color: '#666', letterSpacing: 1 },
  levelName: { fontSize: 22, fontWeight: '900' },
  pointsBox: { alignItems: 'flex-end' },
  pointsBoxNum: { fontSize: 26, fontWeight: '900' },
  pointsBoxLabel: { fontSize: 11, color: '#666' },
  progressBar: { height: 8, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#666', marginTop: 8, textAlign: 'center' },
  perksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  perkChip: { backgroundColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  perkText: { fontSize: 11, color: '#1A1A1A', fontWeight: '600' },
  howRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  howText: { fontSize: 14, color: '#1A1A1A' },
  howPts: { fontSize: 14, color: '#34C759', fontWeight: 'bold' },
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  leaderRank: { fontSize: 14, fontWeight: 'bold', color: '#999', width: 28 },
  leaderName: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  leaderPts: { fontSize: 13, color: '#666', fontWeight: '600' },
  editBtn: {
    marginTop: 16, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 20, backgroundColor: '#FFF',
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  editBtnText: { fontSize: 13, fontWeight: '600' },
  section: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginBottom: 20 },
  sectionLabel: { fontSize: 10, fontWeight: 'bold', color: '#A0A0A0', marginBottom: 12, marginLeft: 4, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8F8F8', justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  levelBtn: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center',
  },
  levelBtnActive: { backgroundColor: '#E14F4F' },
  levelText: { color: '#666', fontWeight: 'bold' },
  levelTextActive: { color: '#FFF', fontWeight: 'bold' },
  logoutBtn: {
    marginTop: 10, height: 56, borderRadius: 16, backgroundColor: '#FFF',
    borderWidth: 1, borderColor: '#FFE5E5', justifyContent: 'center', alignItems: 'center',
  },
  logoutText: { color: '#E14F4F', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF9F8', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: '#F0F0F0', fontSize: 15, color: '#1A1A1A',
  },
  saveBtn: {
    backgroundColor: '#E14F4F', height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 1 },
});
