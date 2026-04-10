import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Pressable, ScrollView, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

let CameraView: any = null;
let useCameraPermissions: any = null;
if (Platform.OS !== 'web') {
  const cam = require('expo-camera');
  CameraView = cam.CameraView;
  useCameraPermissions = cam.useCameraPermissions;
}

type Phrase = Database['public']['Tables']['sign_phrases']['Row'];

export default function TraductorScreen() {
  const camPerms = Platform.OS !== 'web' && useCameraPermissions ? useCameraPermissions() : [{ granted: false }, () => {}];
  const [permission, requestPermission] = camPerms;
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [detected, setDetected] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' && !permission) requestPermission();
  }, [permission, requestPermission]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('sign_phrases').select('*').order('category');
    setPhrases(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const simulateDetect = () => {
    if (phrases.length === 0) return;
    setIsDetecting(true);
    setDetected('');
    setTimeout(() => {
      const random = phrases[Math.floor(Math.random() * phrases.length)];
      setDetected(random.phrase);
      setIsDetecting(false);
    }, 1200);
  };

  const toggleCamera = () => setFacing((p) => (p === 'back' ? 'front' : 'back'));

  const renderCameraArea = () => {
    if (Platform.OS === 'web' || !CameraView) {
      return (
        <View style={[styles.cameraWrapper, { backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' }]}>
          <IconSymbol name="hand.raised.fill" size={60} color="#E14F4F" />
          <ThemedText style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginTop: 12 }}>Traductor de Señas</ThemedText>
          <ThemedText style={{ color: '#999', fontSize: 12, marginTop: 4 }}>Cámara disponible en la app móvil</ThemedText>
          {isDetecting && (
            <Animated.View entering={FadeIn} style={styles.detectingBadge}>
              <ThemedText style={styles.detectingText}>DETECTANDO SEÑAS...</ThemedText>
            </Animated.View>
          )}
        </View>
      );
    }

    if (!permission?.granted) {
      return (
        <View style={[styles.cameraWrapper, { backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
          <ThemedText style={{ textAlign: 'center', marginBottom: 20, color: '#FFF' }}>
            Necesitamos permiso para usar la cámara
          </ThemedText>
          <Pressable onPress={requestPermission} style={styles.permissionBtn}>
            <ThemedText style={styles.permissionBtnText}>Conceder Permiso</ThemedText>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.cameraWrapper}>
        <CameraView style={styles.camera} facing={facing}>
          <View style={styles.overlay}>
            {isDetecting && (
              <Animated.View entering={FadeIn} style={styles.detectingBadge}>
                <ThemedText style={styles.detectingText}>DETECTANDO SEÑAS...</ThemedText>
              </Animated.View>
            )}
            <View style={[styles.handBox, { top: '30%', left: '20%' }]}>
              <ThemedText style={styles.handLabel}>Hand (92%)</ThemedText>
            </View>
            <View style={styles.cameraControls}>
              <Pressable style={styles.circleBtn} onPress={toggleCamera}>
                <IconSymbol name="camera.fill" size={20} color="#FFF" />
              </Pressable>
            </View>
          </View>
        </CameraView>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {renderCameraArea()}

        <Animated.View entering={SlideInDown.duration(400)} style={styles.bottomSheet}>
          <View style={styles.transcriptArea}>
            <ThemedText style={styles.transcriptLabel}>Frase detectada:</ThemedText>
            <ThemedText style={styles.transcriptText}>
              {detected || 'Pulsa "Traducir" para detectar una seña'}
            </ThemedText>
          </View>

          <Pressable
            style={[styles.translateBtn, isDetecting && { opacity: 0.6 }]}
            onPress={simulateDetect}
            disabled={isDetecting}
          >
            <IconSymbol name="hand.raised.fill" size={20} color="#FFF" />
            <ThemedText style={styles.translateBtnText}>
              {isDetecting ? 'Detectando...' : 'Traducir'}
            </ThemedText>
          </Pressable>

          <ThemedText style={styles.libraryLabel}>Frases comunes</ThemedText>
          {loading ? (
            <ActivityIndicator color="#E14F4F" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
              {phrases.map((p) => (
                <Pressable
                  key={p.id}
                  style={styles.phraseChip}
                  onPress={() => setDetected(p.phrase)}
                >
                  <ThemedText style={styles.phraseText}>{p.phrase}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraWrapper: { flex: 0.55, overflow: 'hidden' },
  camera: { flex: 1 },
  overlay: { flex: 1, padding: 20, justifyContent: 'space-between' },
  cameraControls: { flexDirection: 'row', justifyContent: 'flex-end' },
  circleBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  detectingBadge: {
    position: 'absolute', bottom: 20, alignSelf: 'center',
    backgroundColor: '#E14F4F', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
  },
  detectingText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  handBox: { position: 'absolute', width: 120, height: 150, borderWidth: 2, borderColor: '#E14F4F', borderRadius: 16 },
  handLabel: {
    backgroundColor: '#E14F4F', color: '#FFF', fontSize: 10, paddingHorizontal: 4,
    alignSelf: 'flex-start', borderRadius: 4,
  },
  bottomSheet: {
    flex: 0.45, backgroundColor: '#FFF9F8', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 20, gap: 14,
  },
  transcriptArea: { paddingHorizontal: 8 },
  transcriptLabel: { fontSize: 11, color: '#A0A0A0', fontWeight: 'bold', letterSpacing: 1 },
  transcriptText: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginTop: 4 },
  translateBtn: {
    height: 52, borderRadius: 16, backgroundColor: '#E14F4F',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  translateBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  libraryLabel: { fontSize: 11, color: '#A0A0A0', fontWeight: 'bold', letterSpacing: 1, paddingHorizontal: 4 },
  phraseChip: {
    backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  phraseText: { fontSize: 13, color: '#1A1A1A' },
  permissionBtn: { backgroundColor: '#E14F4F', padding: 16, borderRadius: 12, alignSelf: 'center' },
  permissionBtnText: { color: '#FFF', fontWeight: 'bold' },
});
