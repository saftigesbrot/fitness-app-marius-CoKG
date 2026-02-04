import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { exercisesService } from '@/services/exercises';
import { trainingsService } from '@/services/trainings';

export default function ExploreScreen() {
  const [plans, setPlans] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchResultsPlans, setSearchResultsPlans] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');

  useEffect(() => {

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedPlans, fetchedExercises, fetchedCategories] = await Promise.all([
        trainingsService.getTrainingPlans(),
        exercisesService.searchExercises(searchQuery, selectedCategory ? String(selectedCategory) : undefined),
        exercisesService.getCategories()
      ]);



      if (Array.isArray(fetchedPlans)) setPlans(fetchedPlans);
      if (Array.isArray(fetchedExercises)) setExercises(fetchedExercises);
      if (Array.isArray(fetchedCategories)) setCategories(fetchedCategories);
    } catch (error) {
      console.log('Error loading explore data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [searchQuery, selectedCategory]);

  const loadExercises = async () => {
    try {
      let categoryName = undefined;
      if (selectedCategory) {
        const cat = categories.find(c => (c.category_id || c.id) === selectedCategory);
        categoryName = cat ? cat.name : undefined;
      }



      const fetchedExercises = await exercisesService.searchExercises(searchQuery, categoryName);
      if (Array.isArray(fetchedExercises)) setExercises(fetchedExercises);

      if (searchQuery) {
        const foundPlans = await trainingsService.searchTrainingPlans(searchQuery);
        if (Array.isArray(foundPlans)) setSearchResultsPlans(foundPlans);
      } else {
        setSearchResultsPlans([]);
      }
    } catch (error) {
      console.error("Error loading exercises/plans", error);
    }
  }

  const filteredExercises = exercises;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
        <ThemedText type="title" style={styles.headerTitle}>Explore</ThemedText>

        <View style={[styles.searchContainer, { backgroundColor: cardColor }]}>
          <IconSymbol name="magnifyingglass" size={20} color="#aaa" style={styles.searchIcon} />
          <TextInput
            placeholder="Suche nach Plänen oder Übungen"
            placeholderTextColor="#aaa"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {searchQuery ? (
          <View style={{ marginBottom: 20 }}>
            {searchResultsPlans.length > 0 ? (
              <>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Gefundene Pläne</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {searchResultsPlans.map((plan) => (
                    <TouchableOpacity key={plan.plan_id} style={[styles.planCard, { backgroundColor: cardColor }]} onPress={() => router.push(`/training/${plan.plan_id || plan.id}`)}>
                      <Image source={{ uri: `https://source.unsplash.com/random/500x300?gym,${plan.id}` }} style={styles.planImage} />
                      <View style={styles.planOverlay}>
                        <ThemedText style={styles.planSubtitle} numberOfLines={1}>{plan.name}</ThemedText>
                        <ThemedText style={styles.planPrivate} numberOfLines={1}>von {plan.username || 'User ' + plan.user}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Keine Pläne gefunden</ThemedText>
                <TouchableOpacity
                  style={[styles.planCard, styles.newPlanCard, { backgroundColor: cardColor, borderColor: '#333' }]}
                  onPress={() => router.push('/training/create')}
                >
                  <View style={styles.plusCircle}>
                    <IconSymbol name="plus" size={30} color="#fff" />
                  </View>
                  <ThemedText style={styles.newPlanText}>Neuer Plan erstellen</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : null}

        {!searchQuery && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Meine Trainingspläne</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {plans.map((plan) => (
                <TouchableOpacity key={plan.plan_id} style={[styles.planCard, { backgroundColor: cardColor }]} onPress={() => router.push(`/training/${plan.plan_id || plan.id}`)}>
                  <Image source={{ uri: `https://source.unsplash.com/random/500x300?gym,${plan.id}` }} style={styles.planImage} />
                  <View style={styles.planOverlay}>
                    <ThemedText style={styles.planSubtitle} numberOfLines={1}>{plan.name}</ThemedText>
                    {!plan.public && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ThemedText style={styles.planPrivate}>(Privat)</ThemedText>
                        <IconSymbol name="lock.fill" size={12} color="#aaa" style={{ marginLeft: 4 }} />
                      </View>
                    )}
                    <TouchableOpacity onPress={() => router.push(`/training/edit/${plan.plan_id || plan.id}`)}>
                      <ThemedText style={styles.linkText}>(Bearbeiten)</ThemedText>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.planCard, styles.newPlanCard, { backgroundColor: cardColor, borderColor: '#333' }]}
                onPress={() => router.push('/training/create')}
              >
                <View style={styles.plusCircle}>
                  <IconSymbol name="plus" size={30} color="#fff" />
                </View>
                <ThemedText style={styles.newPlanText}>Neuer Plan erstellen</ThemedText>
              </TouchableOpacity>
            </ScrollView>

            <ThemedText type="subtitle" style={[styles.sectionTitle, { marginTop: 20 }]}>Übungskategorien</ThemedText>
            <View style={styles.categoryContainer}>
              {categories.map((cat, index) => {
                const catId = cat.id || index;
                return (
                  <TouchableOpacity
                    key={catId}
                    style={[
                      styles.categoryButton,
                      { backgroundColor: selectedCategory === (cat.category_id || cat.id) ? '#2D74DA' : cardColor }
                    ]}
                    onPress={() => setSelectedCategory(prev => prev === (cat.category_id || cat.id) ? null : (cat.category_id || cat.id))}
                  >
                    <ThemedText style={styles.categoryText}>{cat.name}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <ThemedText type="subtitle" style={[styles.sectionTitle, { marginTop: searchQuery ? 0 : 20 }]}>
          {searchQuery ? 'Gefundene Übungen' : 'Übungsbibliothek'}
        </ThemedText>

        <View style={styles.exerciseList}>
          {filteredExercises.slice(0, selectedCategory ? 10 : 5).map((ex, index) => (
            <TouchableOpacity key={ex.exercise_id} onPress={() => router.push(`/exercise/${ex.exercise_id}`)}>
              <ThemedView style={[styles.exerciseItem, { backgroundColor: cardColor }]}>
                <View style={styles.exerciseIconBg}>
                  <IconSymbol name="dumbbell.fill" size={20} color="#000" />
                </View>
                <ThemedText type="defaultSemiBold" style={{ flex: 1, marginLeft: 15 }}>{ex.name}</ThemedText>
                <IconSymbol name="chevron.right" size={20} color="#aaa" />
              </ThemedView>
            </TouchableOpacity>
          ))}
          {filteredExercises.length === 0 && !loading && (
            <ThemedText style={{ textAlign: 'center', color: '#aaa', marginTop: 10 }}>Keine Übungen gefunden</ThemedText>
          )}
        </View>

        {(!searchQuery || filteredExercises.length === 0) && (
          <TouchableOpacity style={styles.createButton} onPress={() => router.push('/exercise/create')}>
            <ThemedText style={styles.createButtonText}>Eigene Übung erstellen +</ThemedText>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  plusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D74DA',
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
    backgroundColor: '#2D74DA',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
