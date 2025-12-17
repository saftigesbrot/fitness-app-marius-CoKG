import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ExploreScreen() {
  const categories = ['Brust', 'Rücken', 'Beine', 'Schultern', 'Arme', 'Core'];
  const exercises = [
    { name: 'Bankdrücken', icon: 'dumbbell.fill' },
    { name: 'Schrägbankdrücken', icon: 'dumbbell.fill' }, // using generic dumbbell if specific not avail
    { name: 'Fliegende', icon: 'figure.run' }
  ];
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
        <ThemedText type="title" style={styles.headerTitle}>Explore</ThemedText>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: cardColor }]}>
          <IconSymbol name="magnifyingglass" size={20} color="#aaa" style={styles.searchIcon} />
          <TextInput
            placeholder="Suche nach Plänen oder Übungen"
            placeholderTextColor="#aaa"
            style={[styles.searchInput, { color: textColor }]}
          />
        </View>

        {/* My Training Plans */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Meine Trainingspläne</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {/* Card 1 */}
          <View style={styles.planCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500' }} style={styles.planImage} />
            <View style={styles.planOverlay}>
              <ThemedText type="defaultSemiBold" style={styles.planTitle}>Aktueller Plan:</ThemedText>
              <ThemedText style={styles.planSubtitle}>Ganzkörper-Push</ThemedText>
              <ThemedText style={styles.linkText}>(Bearbeiten)</ThemedText>
            </View>
          </View>
          {/* Card 2 */}
          <View style={styles.planCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500' }} style={styles.planImage} />
            <View style={styles.planOverlay}>
              <ThemedText style={styles.planSubtitle}>Beine & Core</ThemedText>
              <ThemedText style={styles.planPrivate}>(Privat)</ThemedText>
              <IconSymbol name="lock.fill" size={16} color="#aaa" style={{ marginTop: 5 }} />
            </View>
          </View>
          {/* New Plan Card */}
          <View style={[styles.planCard, styles.newPlanCard, { backgroundColor: cardColor, borderColor: '#333' }]}>
            <View style={styles.plusCircle}>
              <IconSymbol name="plus" size={30} color="#fff" />
            </View>
            <ThemedText style={styles.newPlanText}>Neuer Plan erstellen</ThemedText>
          </View>
        </ScrollView>

        {/* Exercise Library */}
        <ThemedText type="subtitle" style={[styles.sectionTitle, { marginTop: 20 }]}>Übungsbibliothek</ThemedText>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat} style={styles.categoryButton}>
              <ThemedText style={styles.categoryText}>{cat}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseList}>
          {exercises.map((ex, index) => (
            <ThemedView key={index} style={styles.exerciseItem}>
              <View style={styles.exerciseIconBg}>
                <IconSymbol name="dumbbell.fill" size={20} color="#000" />
              </View>
              <ThemedText type="defaultSemiBold" style={{ flex: 1, marginLeft: 15 }}>{ex.name}</ThemedText>
              <IconSymbol name="chevron.right" size={20} color="#aaa" />
            </ThemedView>
          ))}
        </View>

        <TouchableOpacity style={styles.createButton}>
          <ThemedText style={styles.createButtonText}>Eigene Übung erstellen +</ThemedText>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    // backgroundColor handled by theme
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 25,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    color: '#fff',
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  horizontalScroll: {
    marginBottom: 10,
  },
  planCard: {
    width: 160,
    height: 100,
    borderRadius: 12,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: '#333',
    justifyContent: 'flex-end',
  },
  planImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  planOverlay: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  planTitle: {
    color: '#fff',
    fontSize: 12,
  },
  planSubtitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#3498db',
    fontSize: 10,
  },
  planPrivate: {
    color: '#aaa',
    fontSize: 10,
  },
  newPlanCard: {
    // backgroundColor handled by theme
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed', // Dashed doesn't work effectively with View without adjustments, but okay for now
  },
  plusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#397cc0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  newPlanText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#283042', // Using fixed dark color for now or could use theme, but let's stick to design
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  categoryText: {
    color: '#fff',
  },
  exerciseList: {
    gap: 10,
    marginBottom: 25,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#283042',
    borderRadius: 12,
  },
  exerciseIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#397cc0',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
