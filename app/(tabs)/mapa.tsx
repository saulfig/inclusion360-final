import { StyleSheet, View, TextInput, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function MapaScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
        <ThemedText style={styles.title}>Mapa inclusivo</ThemedText>
        <ThemedText style={styles.subtitle}>Explora y valida espacios accesibles cerca de ti</ThemedText>
        
        <View style={styles.toggleContainer}>
           <View style={[styles.toggleBtn, styles.toggleActive]}>
              <ThemedText style={styles.toggleTextActive}>Mapa</ThemedText>
           </View>
           <View style={styles.toggleBtn}>
              <ThemedText style={styles.toggleText}>AR</ThemedText>
           </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
           <IconSymbol name="magnifyingglass" size={20} color="#A0A0A0" />
           <TextInput 
              placeholder="Buscar cafeterías, restaurantes, hos..." 
              style={styles.searchInput}
              placeholderTextColor="#A0A0A0"
           />
           <IconSymbol name="slider.horizontal.3" size={20} color="#A0A0A0" />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
         <View style={[styles.filterChip, { backgroundColor: '#E14F4F' }]}>
            <View style={styles.dot} />
            <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Baños adaptados</ThemedText>
         </View>
         <View style={styles.filterChip}>
            <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
            <ThemedText>Rampas</ThemedText>
         </View>
         <View style={styles.filterChip}>
            <View style={[styles.dot, { backgroundColor: '#FFC107' }]} />
            <ThemedText>Personal que sepa señas</ThemedText>
         </View>
      </ScrollView>

      <View style={styles.mapMock}>
          <View style={[styles.scannerHint, { top: 20 }]}>
             <IconSymbol name="viewfinder" size={20} color="#FFF" />
             <View>
                <ThemedText style={styles.hintTitle}>Modo escáner activo</ThemedText>
                <ThemedText style={styles.hintSub}>Levanta el móvil: se mostrarán tarjetas sobre los locales de la calle.</ThemedText>
                <View style={styles.hintBadges}>
                    <View style={styles.badge}>
                        <IconSymbol name="speaker.slash.fill" size={12} color="#FFF" />
                        <ThemedText style={styles.badgeText}>Ambiente ruidoso</ThemedText>
                    </View>
                    <View style={styles.badge}>
                        <IconSymbol name="figure.roll" size={12} color="#FFF" />
                        <ThemedText style={styles.badgeText}>Rampa verificada</ThemedText>
                    </View>
                </View>
             </View>
          </View>

          <View style={[styles.pin, { top: '50%', left: '40%' }]}>
             <ThemedText style={styles.pinLabel}>Cafetería Luz</ThemedText>
             <View style={styles.pinIcon}>
                <IconSymbol name="cup.and.saucer.fill" size={14} color="#FFF" />
             </View>
          </View>
      </View>

      <Animated.View entering={FadeInUp} style={styles.validationCard}>
          <View style={styles.cardHeader}>
             <IconSymbol name="figure.roll" size={20} color="#E14F4F" />
             <View>
                <ThemedText style={styles.cardTitle}>¿Este lugar tiene rampa?</ThemedText>
                <ThemedText style={styles.cardSub}>Valídalo y gana 50 puntos por ayudar a otros</ThemedText>
             </View>
             <Pressable style={styles.validarBtn}>
                <ThemedText style={styles.validarText}>Validar ahora</ThemedText>
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
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 2,
    alignSelf: 'flex-end',
    marginTop: -30,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: '#FF7F7F',
  },
  toggleText: {
    fontSize: 14,
    color: '#666666',
  },
  toggleTextActive: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterScroll: {
    marginTop: 15,
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E14F4F',
  },
  mapMock: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    marginTop: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  scannerHint: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30, 30, 45, 0.9)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  hintTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  hintSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  hintBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinLabel: {
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 10,
    elevation: 2,
    marginBottom: 4,
  },
  pinIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  validationCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardSub: {
    fontSize: 11,
    color: '#666666',
  },
  validarBtn: {
    backgroundColor: '#FF7F7F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  validarText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  }
});
