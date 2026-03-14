import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeIn, SlideInDown, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

export default function TraductorScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTranscript('Escuchando...');
      setAiResponse('');
      
      setTimeout(() => setTranscript('¿Hola?'), 1000);
      setTimeout(() => setTranscript('¿Hola? ¿Podrías ayudarme con esto?'), 2500);

      setTimeout(() => {
        setIsListening(false);
        setAiResponse('¡Claro! Estoy detectando tus señas y traduciendo a voz en tiempo real.');
      }, 5000);
    }
  };

  const toggleCamera = () => {
    setFacing(prev => (prev === 'back' ? 'front' : 'back'));
  };

  if (!permission) return <ThemedView style={styles.container} />;
  
  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ textAlign: 'center', marginTop: 100 }}>Necesitamos permiso para usar la cámara</ThemedText>
        <Pressable onPress={requestPermission} style={styles.mainActionBtn}>
           <ThemedText style={styles.mainActionText}>Conceder Permiso</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.cameraWrapper}>
          <CameraView style={styles.camera} facing={facing}>
              <View style={styles.overlay}>
                  {isListening && (
                    <Animated.View entering={FadeIn} style={styles.detectingBadge}>
                        <ThemedText style={styles.detectingText}>DETECTANDO SEÑAS</ThemedText>
                    </Animated.View>
                  )}
                  
                  <View style={[styles.handBox, { top: '30%', left: '20%' }]}>
                      <ThemedText style={styles.handLabel}>L Hand (92%)</ThemedText>
                  </View>

                  <View style={styles.cameraControls}>
                      <Pressable style={styles.circleBtn} onPress={toggleCamera}>
                          <IconSymbol name="camera.fill" size={20} color="#FFF" />
                      </Pressable>
                      <Pressable style={styles.circleBtn}>
                          <IconSymbol name="viewfinder" size={20} color="#FFF" />
                      </Pressable>
                  </View>
              </View>
          </CameraView>
        </View>

        <Animated.View entering={SlideInDown.duration(400)} style={styles.bottomSheet}>
          <ScrollView style={styles.scrollArea}>
            <ThemedText style={styles.transcriptText}>
              {transcript || 'Pulsa el botón para empezar a traducir...'}
            </ThemedText>
            {aiResponse ? (
              <Animated.View entering={FadeIn} style={styles.aiResult}>
                <ThemedText style={styles.aiResponseText}>{aiResponse}</ThemedText>
              </Animated.View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable 
              style={[styles.listenBtn, isListening && styles.listeningActive]} 
              onPress={toggleListening}
            >
                <IconSymbol 
                  name={isListening ? "ear.fill" : "keyboard"} 
                  size={24} 
                  color="#FFF" 
                />
                <ThemedText style={styles.listenBtnText}>
                  {isListening ? "Escuchando..." : "Responder"}
                </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraWrapper: {
    flex: 0.65,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
    justifyContent: 'space-between',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectingBadge: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#E14F4F',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detectingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  handBox: {
    position: 'absolute',
    width: 120,
    height: 150,
    borderWidth: 2,
    borderColor: '#E14F4F',
    borderRadius: 16,
  },
  handLabel: {
    backgroundColor: '#E14F4F',
    color: '#FFF',
    fontSize: 10,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
    borderRadius: 4,
  },
  bottomSheet: {
    flex: 0.35,
    backgroundColor: '#FFF9F8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  scrollArea: {
    flex: 1,
  },
  transcriptText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  aiResult: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E14F4F',
  },
  aiResponseText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  actions: {
    marginTop: 16,
  },
  listenBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF7F7F',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  listeningActive: {
    backgroundColor: '#E14F4F',
  },
  listenBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mainActionBtn: {
    backgroundColor: '#E14F4F',
    padding: 16,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 20,
  },
  mainActionText: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});
