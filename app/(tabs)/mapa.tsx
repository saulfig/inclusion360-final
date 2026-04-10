import {
  StyleSheet, View, TextInput, ScrollView, Pressable, SafeAreaView,
  Modal, ActivityIndicator, Dimensions, Platform,
} from 'react-native';
import { showAlert } from '@/lib/alert';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import MapWebView from '@/components/MapWebView';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Database } from '@/types/database';

type Place = Database['public']['Tables']['places']['Row'];
type Report = Database['public']['Tables']['reports']['Row'];

const CATEGORY_ICONS: Record<string, any> = {
  restaurante: 'cup.and.saucer.fill',
  cultura: 'message.fill',
  parque: 'figure.roll',
  salud: 'cross.fill',
  comercio: 'bag.fill',
  plaza: 'map.fill',
};

const CATEGORY_COLORS: Record<string, string> = {
  restaurante: '#E14F4F',
  cultura: '#5B7CFA',
  parque: '#34C759',
  salud: '#FF3B30',
  comercio: '#FF9500',
  plaza: '#A0522D',
};

const CATEGORIES = ['todos', 'restaurante', 'cultura', 'parque', 'salud', 'comercio', 'plaza'];

const MAP_HEIGHT = Dimensions.get('window').height * 0.38;

function buildMapHtml(places: Place[], activeCategory: string): string {
  const filtered = activeCategory === 'todos'
    ? places
    : places.filter((p) => p.category === activeCategory);

  const markers = filtered.map((p) => {
    const color = CATEGORY_COLORS[p.category] ?? '#E14F4F';
    const tags = (p.accessibility_tags ?? []).slice(0, 2).join(', ').replace(/_/g, ' ');
    const verified = p.verified_count ?? 0;
    return `
      L.circleMarker([${p.lat}, ${p.lng}], {
        radius: ${Math.max(8, Math.min(16, 8 + verified))},
        fillColor: '${color}',
        color: '#FFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map)
        .bindPopup(\`<div style="font-family:-apple-system,sans-serif;min-width:140px">
          <strong style="font-size:13px">${p.name.replace(/'/g, "\\'")}</strong><br/>
          <span style="color:#666;font-size:11px">${p.category}</span>
          ${tags ? `<br/><span style="color:#34C759;font-size:10px">✓ ${tags}</span>` : ''}
          <br/><span style="color:#999;font-size:10px">${verified} verificaciones</span>
        </div>\`, { closeButton: false })
        .on('click', function() {
          (window.ReactNativeWebView || window.parent).postMessage(JSON.stringify({ type: 'select', id: '${p.id}' }), '*');
        });
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  *{margin:0;padding:0}
  html,body,#map{width:100%;height:100%}
  .leaflet-popup-content-wrapper{border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15)}
</style>
</head><body>
<div id="map"></div>
<script>
  var map = L.map('map', {
    center: [18.47, -69.93],
    zoom: 14,
    zoomControl: false,
    attributionControl: false
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  ${markers}
</script>
</body></html>`;
}

export default function MapaScreen() {
  const { user, refreshProfile } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [viewMode, setViewMode] = useState<'mapa' | 'lista'>('mapa');
  const webViewRef = useRef<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('places').select('*').order('verified_count', { ascending: false });
    setPlaces(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = places.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'todos' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const totalVerified = places.reduce((acc, p) => acc + (p.verified_count ?? 0), 0);

  const mapHtml = useMemo(() => buildMapHtml(places, activeCategory), [places, activeCategory]);

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'select') {
        const place = places.find((p) => p.id === data.id);
        if (place) setDetailPlace(place);
      }
    } catch { /* ignore */ }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText style={styles.title}>Mapa Inclusivo</ThemedText>
              <ThemedText style={styles.subtitle}>{places.length} lugares accesibles</ThemedText>
            </View>
            <View style={styles.viewToggle}>
              <Pressable
                style={[styles.toggleBtn, viewMode === 'mapa' && styles.toggleBtnActive]}
                onPress={() => setViewMode('mapa')}
              >
                <IconSymbol name="map.fill" size={16} color={viewMode === 'mapa' ? '#FFF' : '#666'} />
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, viewMode === 'lista' && styles.toggleBtnActive]}
                onPress={() => setViewMode('lista')}
              >
                <IconSymbol name="list.bullet" size={16} color={viewMode === 'lista' ? '#FFF' : '#666'} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <IconSymbol name="magnifyingglass" size={20} color="#A0A0A0" />
            <TextInput
              placeholder="Buscar por nombre..."
              style={styles.searchInput}
              placeholderTextColor="#A0A0A0"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setActiveCategory(c)}
              style={[styles.catChip, activeCategory === c && styles.catChipActive]}
            >
              <ThemedText style={activeCategory === c ? styles.catChipTextActive : styles.catChipText}>
                {c}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color="#E14F4F" style={{ marginTop: 40 }} />
        ) : viewMode === 'mapa' ? (
          <View style={{ flex: 1 }}>
            <View style={styles.mapContainer}>
              <MapWebView
                ref={webViewRef}
                html={mapHtml}
                style={styles.map}
                onMessage={handleMapMessage}
              />
              <View style={styles.mapLegend}>
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                  <View key={cat} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: color }]} />
                    <ThemedText style={styles.legendText}>{cat}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.statsRowSmall}>
              <StatCard num={filtered.length} label="Visibles" color="#E14F4F" />
              <StatCard num={new Set(places.map((p) => p.category)).size} label="Categorías" color="#FF9500" />
              <StatCard num={totalVerified} label="Verificados" color="#34C759" />
            </View>

            <ScrollView contentContainerStyle={styles.listCompact}>
              {filtered.slice(0, 5).map((p) => (
                <Pressable key={p.id} style={styles.placeCardCompact} onPress={() => setDetailPlace(p)}>
                  <View style={[styles.placeIconSmall, { backgroundColor: (CATEGORY_COLORS[p.category] ?? '#E14F4F') + '18' }]}>
                    <IconSymbol name={CATEGORY_ICONS[p.category] ?? 'map.fill'} size={18} color={CATEGORY_COLORS[p.category] ?? '#E14F4F'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.placeName}>{p.name}</ThemedText>
                    <ThemedText style={styles.placeCategory}>{p.category}</ThemedText>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <IconSymbol name="checkmark.circle.fill" size={16} color="#34C759" />
                    <ThemedText style={styles.verifiedNum}>{p.verified_count ?? 0}</ThemedText>
                  </View>
                </Pressable>
              ))}
              {filtered.length > 5 && (
                <Pressable style={styles.showMoreBtn} onPress={() => setViewMode('lista')}>
                  <ThemedText style={styles.showMoreText}>Ver todos ({filtered.length}) →</ThemedText>
                </Pressable>
              )}
            </ScrollView>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            <View style={styles.listHeader}>
              <ThemedText style={styles.listCount}>{filtered.length} lugares</ThemedText>
              <ThemedText style={styles.listSortLabel}>Mayor verificación</ThemedText>
            </View>
            {filtered.map((p, i) => {
              const catColor = CATEGORY_COLORS[p.category] ?? '#E14F4F';
              const verified = p.verified_count ?? 0;
              const tags = p.accessibility_tags ?? [];
              return (
                <Animated.View key={p.id} entering={FadeInUp.delay(Math.min(i, 8) * 40)}>
                  <Pressable style={styles.placeCard} onPress={() => setDetailPlace(p)}>
                    <View style={[styles.placeIcon, { backgroundColor: catColor + '14' }]}>
                      <IconSymbol name={CATEGORY_ICONS[p.category] ?? 'map.fill'} size={22} color={catColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.placeNameRow}>
                        <ThemedText style={styles.placeName} numberOfLines={1}>{p.name}</ThemedText>
                        <View style={[styles.categoryBadge, { backgroundColor: catColor + '18' }]}>
                          <ThemedText style={[styles.categoryBadgeText, { color: catColor }]}>{p.category}</ThemedText>
                        </View>
                      </View>
                      {p.description && <ThemedText style={styles.placeDesc} numberOfLines={2}>{p.description}</ThemedText>}
                      {tags.length > 0 && (
                        <View style={styles.tagsRow}>
                          {tags.slice(0, 3).map((tag) => (
                            <View key={tag} style={styles.tag}>
                              <IconSymbol name="checkmark.circle.fill" size={10} color="#34C759" />
                              <ThemedText style={styles.tagText}>{tag.replace(/_/g, ' ')}</ThemedText>
                            </View>
                          ))}
                          {tags.length > 3 && (
                            <View style={styles.tagMore}>
                              <ThemedText style={styles.tagMoreText}>+{tags.length - 3}</ThemedText>
                            </View>
                          )}
                        </View>
                      )}
                      <View style={styles.placeFooter}>
                        <View style={styles.scoreBar}>
                          <View style={[styles.scoreBarFill, { width: `${Math.min(100, verified * 5)}%` }]} />
                        </View>
                        <View style={styles.verifiedInline}>
                          <IconSymbol name="checkmark.circle.fill" size={14} color="#34C759" />
                          <ThemedText style={styles.verifiedNum}>{verified}</ThemedText>
                        </View>
                      </View>
                    </View>
                    <IconSymbol name="chevron.right" size={14} color="#C0C0C0" />
                  </Pressable>
                </Animated.View>
              );
            })}
            {filtered.length === 0 && (
              <View style={styles.empty}>
                <IconSymbol name="map.fill" size={48} color="#E0E0E0" />
                <ThemedText style={styles.emptyTitle}>No se encontraron lugares</ThemedText>
                <ThemedText style={styles.emptySub}>Prueba con otra categoría o busca algo diferente</ThemedText>
              </View>
            )}
          </ScrollView>
        )}

        <Pressable style={styles.fab} onPress={() => setModalOpen(true)}>
          <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#FFF" />
          <ThemedText style={styles.fabText}>Reportar</ThemedText>
        </Pressable>

        <ReportModal
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={async () => { await load(); await refreshProfile(); }}
          userId={user?.id ?? null}
        />

        <PlaceDetailModal
          place={detailPlace}
          onClose={() => setDetailPlace(null)}
          onChanged={async () => { await load(); await refreshProfile(); }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

function StatCard({ num, label, color }: { num: number; label: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <ThemedText style={[styles.statNum, { color }]}>{num}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

function ReportModal({
  visible, onClose, onCreated, userId,
}: { visible: boolean; onClose: () => void; onCreated: () => void; userId: string | null }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('restaurante');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!userId) return;
    if (name.trim().length < 3) return showAlert('Error', 'El nombre debe tener al menos 3 caracteres');
    setSaving(true);
    const { error } = await supabase.from('places').insert({
      name: name.trim(),
      description: description.trim() || null,
      category,
      accessibility_tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      lat: 18.47 + (Math.random() - 0.5) * 0.05,
      lng: -69.93 + (Math.random() - 0.5) * 0.05,
      created_by: userId,
    });
    if (!error) await supabase.rpc('award_points', { p_amount: 10 });
    setSaving(false);
    if (error) return showAlert('Error', 'No se pudo guardar el lugar');
    setName(''); setDescription(''); setTags('');
    showAlert('¡Gracias!', 'Lugar reportado. Ganaste 10 puntos.');
    onCreated(); onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Reportar lugar</ThemedText>
            <Pressable onPress={onClose}><IconSymbol name="xmark" size={20} color="#1A1A1A" /></Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <ThemedText style={styles.label}>Nombre *</ThemedText>
            <TextInput style={styles.modalInput} placeholder="Cafetería La Luz" value={name} onChangeText={setName} placeholderTextColor="#A0A0A0" />

            <ThemedText style={styles.label}>Descripción</ThemedText>
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              placeholder="Detalles del lugar"
              value={description}
              onChangeText={setDescription}
              multiline
              placeholderTextColor="#A0A0A0"
            />

            <ThemedText style={styles.label}>Categoría</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['restaurante', 'cultura', 'parque', 'salud', 'comercio', 'plaza'].map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.catChipModal, category === c && styles.catChipModalActive]}
                  >
                    <ThemedText style={category === c ? styles.catChipTextActive : styles.catChipText}>{c}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <ThemedText style={styles.label}>Tags (separados por coma)</ThemedText>
            <TextInput
              style={styles.modalInput}
              placeholder="rampa, baño_adaptado"
              value={tags}
              onChangeText={setTags}
              placeholderTextColor="#A0A0A0"
            />

            <Pressable style={[styles.submitBtn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.submitText}>GUARDAR (+10 pts)</ThemedText>}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function PlaceDetailModal({
  place, onClose, onChanged,
}: { place: Place | null; onClose: () => void; onChanged: () => void }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const loadReports = useCallback(async (placeId: string) => {
    setLoadingReports(true);
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('place_id', placeId)
      .order('created_at', { ascending: false });
    setReports(data ?? []);
    setLoadingReports(false);
  }, []);

  useEffect(() => {
    if (place) loadReports(place.id);
    else { setRating(5); setNote(''); setReports([]); }
  }, [place, loadReports]);

  if (!place) return null;

  const submitReport = async () => {
    if (note.trim().length < 3) return showAlert('Error', 'Escribe una reseña');
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setSubmitting(false);
    const { error } = await supabase.from('reports').insert({
      place_id: place.id, user_id: user.id, rating, note: note.trim(),
    });
    if (!error) await supabase.rpc('award_points', { p_amount: 3 });
    setSubmitting(false);
    if (error) return showAlert('Error', 'No se pudo guardar la reseña');
    setNote('');
    await loadReports(place.id);
    onChanged();
  };

  const verify = async () => {
    setVerifying(true);
    const { error } = await supabase.rpc('verify_place', { p_place_id: place.id });
    setVerifying(false);
    if (error) return showAlert('Error', 'No se pudo verificar');
    showAlert('¡Gracias!', 'Lugar verificado. Ganaste 5 puntos.');
    onChanged();
    onClose();
  };

  const avgRating = reports.length
    ? (reports.reduce((a, r) => a + (r.rating ?? 0), 0) / reports.length).toFixed(1)
    : '—';

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { maxHeight: '85%' }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle} numberOfLines={1}>{place.name}</ThemedText>
            <Pressable onPress={onClose}><IconSymbol name="xmark" size={20} color="#1A1A1A" /></Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {place.description && <ThemedText style={styles.detailDesc}>{place.description}</ThemedText>}

            <View style={styles.detailStats}>
              <View style={styles.detailStat}>
                <ThemedText style={[styles.detailStatNum, { color: '#34C759' }]}>{place.verified_count ?? 0}</ThemedText>
                <ThemedText style={styles.detailStatLabel}>Verificados</ThemedText>
              </View>
              <View style={styles.detailStat}>
                <ThemedText style={[styles.detailStatNum, { color: '#FF9500' }]}>{avgRating}</ThemedText>
                <ThemedText style={styles.detailStatLabel}>Rating</ThemedText>
              </View>
              <View style={styles.detailStat}>
                <ThemedText style={[styles.detailStatNum, { color: '#E14F4F' }]}>{reports.length}</ThemedText>
                <ThemedText style={styles.detailStatLabel}>Reseñas</ThemedText>
              </View>
            </View>

            {(place.accessibility_tags ?? []).length > 0 && (
              <>
                <ThemedText style={styles.label}>Accesibilidad</ThemedText>
                <View style={styles.tagsWrap}>
                  {(place.accessibility_tags ?? []).map((t) => (
                    <View key={t} style={styles.tagBig}>
                      <IconSymbol name="checkmark.circle.fill" size={14} color="#34C759" />
                      <ThemedText style={styles.tagBigText}>{t.replace(/_/g, ' ')}</ThemedText>
                    </View>
                  ))}
                </View>
              </>
            )}

            <Pressable style={[styles.verifyBtn, verifying && { opacity: 0.6 }]} onPress={verify} disabled={verifying}>
              {verifying ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <IconSymbol name="checkmark.circle.fill" size={18} color="#FFF" />
                  <ThemedText style={styles.verifyBtnText}>Verificar este lugar (+5 pts)</ThemedText>
                </>
              )}
            </Pressable>

            <ThemedText style={styles.label}>Dejar reseña</ThemedText>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setRating(n)}>
                  <ThemedText style={[styles.star, n <= rating && styles.starActive]}>★</ThemedText>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={[styles.modalInput, { height: 60 }]}
              placeholder="Tu opinión..."
              value={note}
              onChangeText={setNote}
              multiline
              placeholderTextColor="#A0A0A0"
            />
            <Pressable style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={submitReport} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#FFF" /> : <ThemedText style={styles.submitText}>ENVIAR RESEÑA (+3 pts)</ThemedText>}
            </Pressable>

            <ThemedText style={[styles.label, { marginTop: 20 }]}>Reseñas ({reports.length})</ThemedText>
            {loadingReports ? (
              <ActivityIndicator color="#E14F4F" />
            ) : reports.length === 0 ? (
              <ThemedText style={{ color: '#999', textAlign: 'center', padding: 12 }}>Sé el primero en opinar</ThemedText>
            ) : (
              reports.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <ThemedText style={styles.reviewStars}>{'★'.repeat(r.rating ?? 0)}{'☆'.repeat(5 - (r.rating ?? 0))}</ThemedText>
                  <ThemedText style={styles.reviewNote}>{r.note}</ThemedText>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F8' },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  viewToggle: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 10, padding: 3 },
  toggleBtn: { width: 36, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#E14F4F' },
  searchContainer: { paddingHorizontal: 20, marginTop: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 12, paddingHorizontal: 12, height: 44,
    borderWidth: 1, borderColor: '#F0F0F0', gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  catScroll: { marginTop: 10, maxHeight: 40 },
  catContent: { paddingHorizontal: 20, gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16,
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0',
  },
  catChipActive: { backgroundColor: '#E14F4F', borderColor: '#E14F4F' },
  catChipText: { fontSize: 12, color: '#666', textTransform: 'capitalize' },
  catChipTextActive: { fontSize: 12, color: '#FFF', fontWeight: 'bold', textTransform: 'capitalize' },
  mapContainer: { height: MAP_HEIGHT, marginTop: 10, marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F0F0F0' },
  map: { flex: 1, backgroundColor: 'transparent' },
  mapLegend: {
    position: 'absolute', bottom: 8, left: 8, right: 8,
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 10, padding: 6, paddingHorizontal: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 9, color: '#666', textTransform: 'capitalize' },
  statsRowSmall: { flexDirection: 'row', gap: 8, marginTop: 10, paddingHorizontal: 20 },
  statCard: {
    flex: 1, backgroundColor: '#FFF', padding: 10, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  statNum: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 10, color: '#666', marginTop: 1 },
  listCompact: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  placeCardCompact: {
    backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8,
    flexDirection: 'row', gap: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  placeIconSmall: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  placeCategory: { fontSize: 11, color: '#999', textTransform: 'capitalize', marginTop: 1 },
  showMoreBtn: { paddingVertical: 14, alignItems: 'center' },
  showMoreText: { fontSize: 13, color: '#E14F4F', fontWeight: '600' },
  list: { padding: 20, paddingBottom: 100, gap: 10 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  listCount: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  listSortLabel: { fontSize: 11, color: '#A0A0A0' },
  placeCard: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 14,
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  placeIcon: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  placeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  placeName: { fontSize: 14, fontWeight: 'bold', flex: 1 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  placeDesc: { fontSize: 12, color: '#666', marginTop: 3, lineHeight: 17 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F4FBF6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, color: '#2D8A4E', fontWeight: '500' },
  tagMore: { backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagMoreText: { fontSize: 10, color: '#999', fontWeight: '600' },
  placeFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  scoreBar: { flex: 1, height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, overflow: 'hidden' },
  scoreBarFill: { height: '100%', backgroundColor: '#34C759', borderRadius: 2 },
  verifiedInline: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedBadge: { alignItems: 'center', gap: 2 },
  verifiedNum: { fontWeight: 'bold', color: '#34C759', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, color: '#999', fontWeight: '600', marginTop: 8 },
  emptySub: { fontSize: 13, color: '#C0C0C0' },
  fab: {
    position: 'absolute', bottom: 90, right: 20,
    backgroundColor: '#E14F4F', paddingHorizontal: 16, height: 48,
    borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 8,
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8,
  },
  fabText: { color: '#FFF', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#FFF9F8', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 24, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6, marginTop: 12 },
  modalInput: {
    backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#F0F0F0', fontSize: 14, color: '#1A1A1A',
  },
  catChipModal: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0' },
  catChipModalActive: { backgroundColor: '#E14F4F', borderColor: '#E14F4F' },
  submitBtn: {
    backgroundColor: '#E14F4F', height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginTop: 16,
  },
  submitText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 1 },
  detailDesc: { fontSize: 14, color: '#666', lineHeight: 20 },
  detailStats: { flexDirection: 'row', gap: 10, marginTop: 16 },
  detailStat: {
    flex: 1, backgroundColor: '#FFF', padding: 14, borderRadius: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  detailStatNum: { fontSize: 22, fontWeight: '900' },
  detailStatLabel: { fontSize: 11, color: '#666', marginTop: 2 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBig: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8F8EE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
  },
  tagBigText: { fontSize: 12, color: '#1A6B33', fontWeight: '600' },
  verifyBtn: {
    backgroundColor: '#34C759', height: 50, borderRadius: 14, marginTop: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  verifyBtnText: { color: '#FFF', fontWeight: 'bold' },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  star: { fontSize: 32, color: '#E0E0E0' },
  starActive: { color: '#FFC107' },
  reviewCard: { backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  reviewStars: { color: '#FFC107', fontSize: 14 },
  reviewNote: { fontSize: 13, color: '#1A1A1A', marginTop: 4 },
});
