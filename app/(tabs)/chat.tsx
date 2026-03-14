import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  time: string;
}

export default function ChatAsistenteScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '¡Hola Nick! Soy tu asistente de accesibilidad. ¿En qué puedo ayudarte hoy?', sender: 'ai', time: '10:00 AM' },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'He procesado tu solicitud. He ajustado los parámetros de detección ambiental para que seas notificado con mayor intensidad ante sonidos de emergencia.',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1500);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Asistente IA</ThemedText>
            <View style={styles.onlineStatus}>
                <View style={styles.dot} />
                <ThemedText style={styles.statusText}>En línea</ThemedText>
            </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <Animated.View 
              key={msg.id} 
              entering={msg.sender === 'ai' ? FadeIn.duration(400) : SlideInRight}
              style={[
                styles.messageBubble, 
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble
              ]}
            >
              <ThemedText style={[
                styles.messageText,
                msg.sender === 'user' ? styles.userText : styles.aiText
              ]}>
                {msg.text}
              </ThemedText>
              <ThemedText style={styles.messageTime}>{msg.time}</ThemedText>
            </Animated.View>
          ))}
        </ScrollView>

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
              />
              <Pressable style={styles.sendBtn} onPress={handleSend}>
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
  container: {
    flex: 1,
    backgroundColor: '#FFF9F8',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    color: '#666666',
  },
  chatContent: {
    padding: 20,
    gap: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
    marginBottom: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#E14F4F',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aiText: {
    color: '#1A1A1A',
  },
  userText: {
    color: '#FFF',
  },
  messageTime: {
    fontSize: 10,
    color: '#A0A0A0',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputArea: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    color: '#1A1A1A',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E14F4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
