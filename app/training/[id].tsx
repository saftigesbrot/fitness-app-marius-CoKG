
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { trainingsService } from '@/services/trainings';
import { exercisesService } from '@/services/exercises';
import { API_URL } from '@/services/api';

export default function TrainingPlanDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [plan, setPlan] = useState<any>(null);
    const [exercises, setExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');

    useEffect(() => {
        if (id) {
            loadPlan(Number(id));
        }
    }, [id]);

    const loadPlan = async (planId: number) => {
        try {
            setLoading(true);
            const planData = await trainingsService.getTrainingPlans(planId);
            setPlan(planData);

            if (planData && planData.order && Array.isArray(planData.order)) {
                loadExercises(planData.order);
            }
        } catch (error) {
            console.error('Error loading plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadExercises = async (exerciseIds: number[]) => {
        try {
            // Fetch all exercises in parallel
            // Note: In a real app, a batch endpoint would be better
            const promises = exerciseIds.map(id => exercisesService.getExercise(id));
            const results = await Promise.all(promises);

            // Filter out any potential nulls/failures if needed
            // The service returns the exercise object directly or a list if checking exact ID match logic
            // Based on previous analysis, getExercise returns the object or list. 
            // Let's normalize just in case.
            const validExercises = results.map(res => {
                if (Array.isArray(res)) return res[0];
                return res;
            }).filter(Boolean); // remove any nulls

            setExercises(validExercises);
        } catch (error) {
            console.error('Error loading exercises for plan:', error);
        }
    };

    const handleStartTraining = async () => {
        if (!plan) return;
        try {
            // Call API to start training session
            const result = await trainingsService.startTraining(plan.plan_id);
            router.push(`/workout/${plan.plan_id}`);
        } catch (e) {
            console.error("Failed to start training", e);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor }]}>
                <ActivityIndicator size="large" color={textColor} />
            </View>
        );
    }

    if (!plan) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor }]}>
                <ThemedText>Plan not found.</ThemedText>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen options={{ title: plan.name, headerBackTitle: 'Explore', headerTintColor: textColor, headerStyle: { backgroundColor } }} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Header Image/Card */}
                <View style={[styles.headerCard]}>
                    <Image
                        source={{ uri: `https://source.unsplash.com/random/800x400?gym,${plan.plan_id}` }}
                        style={styles.headerImage}
                    />
                    <View style={styles.headerOverlay} />
                    <View style={styles.headerTextContainer}>
                        <ThemedText type="title" style={styles.planName}>{plan.name}</ThemedText>
                        <View style={styles.badgeRow}>
                            <View style={[styles.badge, { backgroundColor: '#2D74DA' }]}>
                                <ThemedText style={styles.badgeText}>{plan.category_detail?.name || 'Allgemein'}</ThemedText>
                            </View>
                            <View style={[styles.badge, { backgroundColor: cardColor }]}>
                                <ThemedText style={styles.badgeText}>{plan.category_detail?.difficulty_level || 'Normal'}</ThemedText>
                            </View>
                            {plan.public && plan.username && (
                                <View style={[styles.badge, { backgroundColor: cardColor }]}>
                                    <ThemedText style={styles.badgeText}>{plan.username}</ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.section}>
                    <View style={styles.infoRow}>
                        <IconSymbol name="clock.fill" size={20} color="#aaa" />
                        <ThemedText style={styles.infoText}>Pausenzeit: {plan.break_time} sek</ThemedText>
                    </View>
                    <View style={styles.infoRow}>
                        <IconSymbol name="lock.fill" size={20} color="#aaa" />
                        <ThemedText style={styles.infoText}>{plan.public ? 'Öffentlicher Plan' : 'Privater Plan'}</ThemedText>
                    </View>
                </View>

                {/* Exercises List */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Übungen</ThemedText>
                <View style={styles.exercisesList}>
                    {exercises.map((ex, index) => (
                        <TouchableOpacity
                            key={`${ex.exercise_id}-${index}`}
                            style={[styles.exerciseItem, { backgroundColor: cardColor }]}
                            onPress={() => router.push(`/exercise/${ex.exercise_id}`)}
                        >
                            <Image
                                source={{ uri: ex.image?.startsWith('http') ? ex.image : `${API_URL}${ex.image}` }}
                                style={styles.exerciseImage}
                            />
                            <View style={styles.exerciseInfo}>
                                <ThemedText type="defaultSemiBold">{ex.name}</ThemedText>
                                <ThemedText style={styles.exerciseCategory}>{ex.category_detail?.name}</ThemedText>
                            </View>
                            <IconSymbol name="chevron.right" size={20} color="#aaa" />
                        </TouchableOpacity>
                    ))}
                    {exercises.length === 0 && (
                        <ThemedText style={styles.emptyText}>Keine Übungen in diesem Plan.</ThemedText>
                    )}
                </View>

            </ScrollView>

            {/* Start Button Footer */}
            <View style={[styles.footer, { backgroundColor }]}>
                <TouchableOpacity style={styles.startButton} onPress={handleStartTraining}>
                    <ThemedText style={styles.startButtonText}>Training Starten</ThemedText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingBottom: 100,
    },
    headerCard: {
        height: 250,
        position: 'relative',
        marginBottom: 20,
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    headerTextContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    planName: {
        color: '#fff',
        fontSize: 32,
        marginBottom: 10,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 10,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoText: {
        color: '#ccc',
        fontSize: 16,
    },
    sectionTitle: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    exercisesList: {
        paddingHorizontal: 20,
        gap: 15,
    },
    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
        gap: 15,
    },
    exerciseImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseCategory: {
        color: '#aaa',
        fontSize: 12,
        marginTop: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#aaa',
        marginTop: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    startButton: {
        backgroundColor: '#2D74DA',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
