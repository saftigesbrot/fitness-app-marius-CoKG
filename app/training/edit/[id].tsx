
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { exercisesService } from '@/services/exercises';
import { trainingsService } from '@/services/trainings';
import { API_URL } from '@/services/api';

export default function EditTrainingPlanScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Form State
    const [name, setName] = useState('');
    const [breakTime, setBreakTime] = useState('60');
    const [isPublic, setIsPublic] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    // Exercise Selection State
    const [allExercises, setAllExercises] = useState<any[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExercises, setSelectedExercises] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');

    useEffect(() => {
        loadData();
    }, [id]);

    useEffect(() => {
        filterExercises();
    }, [searchQuery, allExercises]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cats, exs, planData] = await Promise.all([
                trainingsService.getTrainingCategories(),
                exercisesService.searchExercises(''),
                trainingsService.getTrainingPlans(Number(id))
            ]);

            if (Array.isArray(cats)) setCategories(cats);
            if (Array.isArray(exs)) setAllExercises(exs);

            // Populate Form with Plan Data
            if (planData) {
                setName(planData.name);
                setBreakTime(String(planData.break_time || 60));
                setIsPublic(planData.public);
                setSelectedCategory(planData.category);

                // Set existing exercises
                // The serializer now returns 'exercises' which is a list of objects
                if (planData.exercises && Array.isArray(planData.exercises)) {
                    setSelectedExercises(planData.exercises);
                } else if (planData.order && Array.isArray(planData.order)) {
                    // Fallback if 'exercises' field is missing but we have IDs (shouldn't happen with new serializer)
                    // manual mapping if needed, but assuming serializer is good
                }
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load plan details');
        } finally {
            setLoading(false);
        }
    };

    const filterExercises = () => {
        if (!searchQuery) {
            setFilteredExercises(allExercises.slice(0, 20));
        } else {
            const lower = searchQuery.toLowerCase();
            const filtered = allExercises.filter(ex => ex.name.toLowerCase().includes(lower));
            setFilteredExercises(filtered);
        }
    };

    const toggleExercise = (exercise: any) => {
        // Append
        setSelectedExercises([...selectedExercises, exercise]);
    };

    const removeExercise = (indexToRemove: number) => {
        setSelectedExercises(selectedExercises.filter((_, index) => index !== indexToRemove));
    };

    const moveExercise = (index: number, direction: 'up' | 'down') => {
        const newExercises = [...selectedExercises];
        if (direction === 'up' && index > 0) {
            [newExercises[index], newExercises[index - 1]] = [newExercises[index - 1], newExercises[index]];
        } else if (direction === 'down' && index < newExercises.length - 1) {
            [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
        }
        setSelectedExercises(newExercises);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Validation', 'Please enter a plan name');
            return;
        }
        if (selectedExercises.length === 0) {
            Alert.alert('Validation', 'Please select at least one exercise');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Validation', 'Please select a category');
            return;
        }

        setSubmitting(true);
        try {
            const exerciseIds = selectedExercises.map(ex => ex.exercise_id);

            const payload = {
                plan_id: id,
                name,
                category: selectedCategory,
                public: isPublic,
                break_time: parseInt(breakTime) || 60,
                order: exerciseIds,
                // description is optional on backend, add if needed later
            };

            await trainingsService.editTrainingPlan(payload);
            // Redirect to Explore
            router.dismissAll();
            router.push('/(tabs)/explore');
        } catch (error) {
            console.error('Edit error:', error);
            Alert.alert('Error', 'Failed to save changes');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor }]}>
                <ActivityIndicator size="large" color={textColor} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen options={{ title: 'Plan Bearbeiten', headerTintColor: textColor, headerStyle: { backgroundColor } }} />

            <ScrollView contentContainerStyle={styles.content}>

                {/* General Info */}
                <ThemedText type="subtitle" style={styles.sectionHeader}>Details</ThemedText>
                <View style={[styles.inputGroup, { backgroundColor: cardColor }]}>
                    <TextInput
                        placeholder="Plan Name"
                        placeholderTextColor="#aaa"
                        style={[styles.input, { color: textColor }]}
                        value={name}
                        onChangeText={setName}
                    />
                    <View style={styles.separator} />
                    <View style={styles.row}>
                        <ThemedText>Pausenzeit (sek)</ThemedText>
                        <TextInput
                            placeholder="60"
                            placeholderTextColor="#aaa"
                            keyboardType="numeric"
                            style={[styles.inputSmall, { color: textColor }]}
                            value={breakTime}
                            onChangeText={setBreakTime}
                        />
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.row}>
                        <ThemedText>Öffentlich</ThemedText>
                        <Switch value={isPublic} onValueChange={setIsPublic} />
                    </View>
                </View>

                {/* Category Selection */}
                <ThemedText type="subtitle" style={styles.sectionHeader}>Kategorie</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                    {categories.map((cat) => {
                        const catId = cat.category_id || cat.id;
                        const isSelected = selectedCategory === catId;
                        return (
                            <TouchableOpacity
                                key={catId}
                                style={[styles.catChip, { backgroundColor: isSelected ? '#2D74DA' : cardColor }]}
                                onPress={() => setSelectedCategory(catId)}
                            >
                                <ThemedText style={{ color: isSelected ? '#fff' : textColor }}>{cat.name}</ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>


                {/* Selected Exercises (The Order) */}
                <ThemedText type="subtitle" style={styles.sectionHeader}>Ausgewählte Übungen ({selectedExercises.length})</ThemedText>
                <View style={styles.selectedList}>
                    {selectedExercises.map((ex, index) => (
                        <View key={`${ex.exercise_id}_${index}`} style={[styles.selectedItem, { backgroundColor: cardColor }]}>
                            <ThemedText style={styles.numberBadge}>{index + 1}</ThemedText>
                            <ThemedText style={{ flex: 1, marginLeft: 10 }}>{ex.name}</ThemedText>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <TouchableOpacity onPress={() => moveExercise(index, 'up')} disabled={index === 0}>
                                    <IconSymbol name="chevron.up" size={20} color={index === 0 ? '#555' : textColor} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => moveExercise(index, 'down')} disabled={index === selectedExercises.length - 1}>
                                    <IconSymbol name="chevron.down" size={20} color={index === selectedExercises.length - 1 ? '#555' : textColor} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => removeExercise(index)}>
                                    <IconSymbol name="trash.fill" size={20} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Add Exercise */}
                <ThemedText type="subtitle" style={styles.sectionHeader}>Übung hinzufügen</ThemedText>
                <View style={[styles.searchContainer, { backgroundColor: cardColor }]}>
                    <IconSymbol name="magnifyingglass" size={20} color="#aaa" />
                    <TextInput
                        placeholder="Übung suchen..."
                        placeholderTextColor="#aaa"
                        style={[styles.searchInput, { color: textColor }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.resultsList}>
                    {filteredExercises.map((ex) => (
                        <TouchableOpacity
                            key={ex.exercise_id}
                            style={[styles.resultItem, { borderBottomColor: cardColor }]}
                            onPress={() => toggleExercise(ex)}
                        >
                            <Image
                                source={{ uri: ex.image?.startsWith('http') ? ex.image : `${API_URL}${ex.image}` }}
                                style={styles.thumb}
                            />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <ThemedText type="defaultSemiBold">{ex.name}</ThemedText>
                                <ThemedText style={{ fontSize: 12, color: '#aaa' }}>{ex.category_detail?.name}</ThemedText>
                            </View>
                            <IconSymbol name="plus.circle.fill" size={24} color="#2D74DA" />
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>

            <View style={[styles.footer, { backgroundColor }]}>
                <TouchableOpacity
                    style={[styles.createBtn, { opacity: submitting ? 0.7 : 1 }]}
                    onPress={handleSave}
                    disabled={submitting}
                >
                    {submitting ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.createBtnText}>Änderungen Speichern</ThemedText>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20, paddingBottom: 100 },
    sectionHeader: { marginTop: 20, marginBottom: 10 },
    inputGroup: { borderRadius: 12, padding: 10 },
    input: { fontSize: 16, padding: 10 },
    inputSmall: { fontSize: 16, padding: 10, textAlign: 'right', width: 100 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
    separator: { height: 1, backgroundColor: '#333' },
    catScroll: { flexDirection: 'row', marginBottom: 10 },
    catChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10 },

    selectedList: { gap: 10 },
    selectedItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8 },
    numberBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#333', textAlign: 'center', lineHeight: 24, fontSize: 12, color: '#fff' },

    searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, marginBottom: 10 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
    resultsList: { gap: 5 },
    resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
    thumb: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#333' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1, borderTopColor: '#333' },
    createBtn: { backgroundColor: '#2D74DA', padding: 16, borderRadius: 12, alignItems: 'center' },
    createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
