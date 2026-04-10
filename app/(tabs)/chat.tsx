import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, ScrollView, TextInput, Pressable,
  KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Database } from '@/types/database';

type Msg = Database['public']['Tables']['chat_messages']['Row'];

const CANNED_RESPONSES = [
  'He procesado tu solicitud. Puedo ayudarte con detección de sonidos, traducción de señas o ubicar lugares accesibles.',
  'Entendido. Te recomiendo activar las alertas en tu perfil para mayor seguridad.',
  'Claro, puedo orientarte. ¿Te gustaría explorar el mapa de lugares accesibles cerca?',
  'Recibido. Recuerda que puedes simular alertas desde la sección "Alertas" para probar el sistema.',
  'Perfecto. Estoy aquí para asistirte en cualquier momento que lo necesites.',
  'Comprendido. ¿Quieres que ajuste la sensibilidad de las alertas en tu perfil?',
];

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    setMessages(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !user || sending) return;
    setSending(true);
    const text = inputText.trim();
    setInputText('');

    const { data: userMsg } = await supabase
      .from('chat_messages')
      .insert({ user_id: user.id, role: 'user', content: text })
      .select()
      .single();
    if (userMsg) setMessages((prev) => [...prev, userMsg]);

    setTimeout(async () => {
      const reply = CANNED_RESPONSES[Math.floor(Math.random() * CANNED_RESPONSES.length)];
      const { data: aiMsg } = await supabase
        .from('chat_messages')
        .insert({ user_id: user.id, role: 'assistant', content: reply })
        .select()
        .single();
      if (aiMsg) setMessages((prev) => [...prev, aiMsg]);
      setSending(false);
    }, 800);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Asistente</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.onlineStatus}>
              <View style={styles.dot} />
              <ThemedText style={styles.statusText}>En línea</ThemedText>
            </View>
            <Pressable
              onPress={async () => {
                if (!user) return;
                await supabase.from('chat_messages').delete().eq('user_id', user.id);
                setMessages([]);
              }}
              style={{ padding: 6 }}
            >
              <IconSymbol name="xmark" size={16} color="#999" />
            </Pressable>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#E14F4F" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatContent}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && (
              <View style={styles.welcomeBubble}>
                <ThemedText style={styles.welcomeText}>
                  ¡Hola! Soy tu asistente de accesibilidad. ¿En qué puedo ayudarte hoy?
                </ThemedText>
              </View>
            )}
            {messages.map((msg) => (
              <Animated.View
                key={msg.id}
                entering={msg.role === 'assistant' ? FadeIn.duration(300) : SlideInRight}
                style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
              >
                <ThemedText style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.aiText]}>
                  {msg.content}
                </ThemedText>
              </Animated.View>
            ))}
          </ScrollView>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.inputArea}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#A0A0A0"
                value={inputText}
                onChangeText={setInputText}
                multiline
                editable={!sending}
              />
              <Pressable style={styles.sendBtn} onPress={handleSend} disabled={sending}>
                <IconSymbol name="paperplane.fill" size={20} color="#FFF" />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F8' },
  header: {
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  onlineStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  statusText: { fontSize: 12, color: '#666' },
  chatContent: { padding: 20, gap: 12, paddingBottom: 30 },
  welcomeBubble: {
    backgroundColor: '#FFF', padding: 16, borderRadius: 20, borderTopLeftRadius: 4,
    alignSelf: 'flex-start', maxWidth: '85%',
  },
  welcomeText: { fontSize: 15, lineHeight: 22, color: '#1A1A1A' },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
  aiBubble: {
    alignSelf: 'flex-start', backgroundColor: '#FFF', borderTopLeftRadius: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#E14F4F', borderTopRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  aiText: { color: '#1A1A1A' },
  userText: { color: '#FFF' },
  inputArea: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8',
    borderRadius: 28, paddingHorizontal: 16, paddingVertical: 8, gap: 12,
  },
  input: { flex: 1, fontSize: 15, maxHeight: 100, color: '#1A1A1A' },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#E14F4F',
    justifyContent: 'center', alignItems: 'center',
  },
});
