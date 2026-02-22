
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { trainingsService } from '@/services/trainings';
import { API_URL } from '@/services/api';
import { useOfflineMutation } from '@/context/OfflineMutationContext';

const { width } = Dimensions.get('window');

interface SetLog {
    weight: string;
    reps: string;
    completed: boolean;
}

export default function TrainingSessionScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = '#2D74DA';
    const textColor = useThemeColor({}, 'text');

    const [plan, setPlan] = useState<any>(null);
    const [exercises, setExercises] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // State for Sets
    // Map exerciseIndex -> Array of Sets
    const [setsLog, setSetsLog] = useState<{ [key: number]: SetLog[] }>({});

    // Current Input State
    const [currentWeight, setCurrentWeight] = useState('');
    const [currentReps, setCurrentReps] = useState('');
    const [isAddingSet, setIsAddingSet] = useState(true); // Default to true for the first set

    // Timer State
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | number | null>(null);

    useEffect(() => {
        loadSession();
    }, [id]);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } else if (!isActive && intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive]);

    const loadSession = async () => {
        try {
            setLoading(true);
            const planData = await trainingsService.getTrainingPlans(Number(id));
            setPlan(planData);

            if (planData && Array.isArray(planData.exercises)) {
                setExercises(planData.exercises);
            } else if (planData && Array.isArray(planData.order)) {
                // Fallback if exercises array is missing but order IDs present, 
                // ideally backend provides full objects now.
                // For safety, let's assume exercises are populated or needed to be fetched.
                // Given previous tasks, we know `exercises` field exists.
            }
            setIsActive(true); // Start timer automatically
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load training session');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleNextExercise = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(prev => prev + 1);
            // Reset inputs for next exercise
            setCurrentWeight('');
            setCurrentReps('');
            setSeconds(0); // Reset timer
            setIsAddingSet(true); // Auto-show input for first set of next exercise
        } else {
            // Finish Training - Log and call directly to debug/fix "nothing happens"
            console.log("Finish Training triggered");
            finishTraining();
        }
    };

    const handlePrevExercise = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setCurrentWeight('');
            setCurrentReps('');
            setSeconds(0);
            setIsAddingSet(true);
        }
    };

    const { isOnline, addToQueue } = useOfflineMutation();

    const finishTraining = async () => {
        try {
            setLoading(true);

            // Construct Execution Data
            const exercisesOrder = exercises.map(ex => ex.exercise_id);
            const setsData: { exercise_id: any; weight: string; reps: string; duration: number; }[] = [];

            // Iterate through setsLog
            // setsLog is { [exerciseIndex]: [ { weight, reps, completed } ] }
            Object.keys(setsLog).forEach(indexKey => {
                const index = Number(indexKey);
                const exercise = exercises[index];
                if (!exercise) return;

                const sets = setsLog[index];
                sets.forEach(set => {
                    if (set.completed) {
                        setsData.push({
                            exercise_id: exercise.exercise_id,
                            weight: set.weight,
                            reps: set.reps,
                            duration: 0 // Duration tracking not implemented yet per set
                        });
                    }
                });
            });

            const payload = {
                plan_id: Number(id),
                exercises_order: exercisesOrder,
                sets: setsData
            };
            console.log("Sending payload:", JSON.stringify(payload, null, 2));

            if (!isOnline) {
                addToQueue('SAVE_TRAINING_SESSION', payload);
                router.replace({
                    pathname: '/workout/finished',
                    params: { xp: 0, offline: 'true' }
                });
                return;
            }

            const result = await trainingsService.saveTrainingSession(payload);
            console.log("Save result:", result);

            if (result.success) {
                // Navigate to Finished Screen
                router.replace({
                    pathname: '/workout/finished',
                    params: { xp: result.xp_earned }
                });
            } else {
                Alert.alert('Fehler', 'Training konnte nicht gespeichert werden.');
            }

        } catch (error) {
            console.error("finishTraining error:", error);
            Alert.alert('Error', 'Failed to save training session');
        } finally {
            console.log("finishTraining finally block");
            setLoading(false);
        }
    };

    const logSet = () => {
        if (!currentWeight || !currentReps) return;

        const newSet: SetLog = {
            weight: currentWeight,
            reps: currentReps,
            completed: true
        };

        setSetsLog(prev => {
            const currentSets = prev[currentIndex] || [];
            return {
                ...prev,
                [currentIndex]: [...currentSets, newSet]
            };
        });

        // Reset inputs and timer, hide input row
        // setCurrentReps(''); 
        setSeconds(0);
        setIsAddingSet(false);
    };

    const startAddingSet = () => {
        setIsAddingSet(true);
    };

    const currentExercise = exercises[currentIndex];
    const currentSets = setsLog[currentIndex] || [];
    const progress = (currentIndex + 1) / (exercises.length || 1);

    if (loading || !plan) {
        return (
            <View style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
                <ThemedText>Lade Training...</ThemedText>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <ThemedText style={styles.headerTitle}>Aktuelles Training:</ThemedText>
                    <ThemedText type="subtitle" style={styles.headerPlanName}>{plan.name}</ThemedText>
                </View>
                <ThemedText style={styles.headerProgress}>Übung {currentIndex + 1} von {exercises.length}</ThemedText>
            </View>

            {/* Progress Bar Segmented */}
            <View style={styles.progressBarContainer}>
                {exercises.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.progressBarSegment,
                            { backgroundColor: index <= currentIndex ? '#2D74DA' : '#333' }
                        ]}
                    />
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Exercise Visuals */}
                <View style={styles.imageContainer}>
                    {currentExercise?.image && (
                        <Image
                            source={{ uri: currentExercise.image.startsWith('http') ? currentExercise.image : `${API_URL}${currentExercise.image}` }}
                            style={styles.exerciseImage}
                            resizeMode="cover"
                        />
                    )}
                    {!currentExercise?.image && (
                        <View style={[styles.exerciseImage, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                            <IconSymbol name="dumbbell.fill" size={50} color="#555" />
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                    <ThemedText type="title" style={{ marginBottom: 5 }}>{currentExercise?.name}</ThemedText>
                    <ThemedText style={{ color: '#aaa', fontSize: 14 }}>
                        {currentExercise?.description || 'Keine Beschreibung verfügbar.'}
                    </ThemedText>
                </View>

                {/* Sets Header */}
                <View style={[styles.row, { marginTop: 20, marginBottom: 10 }]}>
                    <ThemedText style={{ width: 40, color: '#aaa', fontSize: 12 }}>Satz</ThemedText>
                    <ThemedText style={{ width: 100, color: '#aaa', fontSize: 12, textAlign: 'center' }}>Gewicht (kg)</ThemedText>
                    <ThemedText style={{ width: 100, color: '#aaa', fontSize: 12, textAlign: 'center' }}>Wiederholungen</ThemedText>
                </View>

                {/* Logged Sets List */}
                {currentSets.map((set, idx) => (
                    <View key={idx} style={[styles.setRow, { opacity: 0.6 }]}>
                        <ThemedText style={styles.setLabel}>Satz {idx + 1}</ThemedText>
                        <View style={[styles.inputDisplay, { backgroundColor: cardColor }]}>
                            <ThemedText>{set.weight}</ThemedText>
                        </View>
                        <View style={[styles.inputDisplay, { backgroundColor: cardColor }]}>
                            <ThemedText>{set.reps}</ThemedText>
                        </View>
                        <View style={[styles.setButton, { backgroundColor: '#333', opacity: 0.5 }]}>
                            <IconSymbol name="checkmark" size={24} color="#aaa" />
                        </View>
                    </View>
                ))}

                {/* Input Row or Add Button */}
                {isAddingSet ? (
                    <View style={styles.setRow}>
                        <ThemedText style={styles.setLabel}>Satz {currentSets.length + 1}</ThemedText>

                        <TextInput
                            style={[styles.input, { backgroundColor: cardColor, color: textColor }]}
                            keyboardType="numeric"
                            placeholder="80"
                            placeholderTextColor="#555"
                            value={currentWeight}
                            onChangeText={setCurrentWeight}
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: cardColor, color: textColor }]}
                            keyboardType="numeric"
                            placeholder="10"
                            placeholderTextColor="#555"
                            value={currentReps}
                            onChangeText={setCurrentReps}
                        />

                        <TouchableOpacity style={[styles.setButton, { backgroundColor: '#333' }]} onPress={logSet}>
                            <IconSymbol name="checkmark" size={24} color="#4CD964" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={[styles.addSetButton, { backgroundColor: cardColor }]} onPress={startAddingSet}>
                        <IconSymbol name="plus" size={20} color={primaryColor} />
                        <ThemedText style={{ color: primaryColor, fontWeight: 'bold' }}>Satz hinzufügen</ThemedText>
                    </TouchableOpacity>
                )}

                {/* Navigation Primary */}
                <TouchableOpacity style={[styles.navButton, { backgroundColor: primaryColor, marginTop: 30 }]} onPress={handleNextExercise}>
                    <ThemedText style={styles.navButtonText}>
                        {currentIndex < exercises.length - 1 ? 'Nächste Übung' : 'Training Beenden'}
                    </ThemedText>
                </TouchableOpacity>

            </ScrollView>

            {/* Footer / Controls */}
            <View style={[styles.footer, { backgroundColor: cardColor }]}>
                <View style={styles.timerContainer}>
                    <ThemedText style={styles.timerText}>{formatTime(seconds)} Pause</ThemedText>
                    <TouchableOpacity onPress={() => setIsActive(!isActive)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconSymbol name={isActive ? "pause.fill" : "play.fill"} size={16} color={primaryColor} />
                        <ThemedText style={{ color: primaryColor, marginLeft: 5, fontWeight: 'bold' }}>
                            {isActive ? 'Stoppen' : 'Starten'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.prevButton, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
                    onPress={handlePrevExercise}
                    disabled={currentIndex === 0}
                >
                    <ThemedText style={{ color: '#aaa' }}>Vorherige Übung</ThemedText>
                    <IconSymbol name="pause.fill" size={16} color="#aaa" style={{ transform: [{ rotate: '90deg' }] }} />
                    {/* Using pause rotated as a visual placeholder for 'step backward' or generic icon */}
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 16, color: '#fff', fontWeight: '600' },
    headerPlanName: { fontSize: 24, fontWeight: 'bold' },
    headerProgress: { color: '#aaa', marginTop: 5, textAlign: 'center', fontSize: 12 },

    progressBarContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, height: 6 },
    progressBarSegment: { flex: 1, borderRadius: 3, marginRight: 4 },

    content: { paddingBottom: 120 },

    imageContainer: { marginHorizontal: 20, borderRadius: 12, overflow: 'hidden', marginBottom: 20, height: 250 },
    exerciseImage: { width: '100%', height: '100%' },

    infoSection: { paddingHorizontal: 20, marginBottom: 10 },

    row: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, alignItems: 'center' },

    setRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, alignItems: 'center', marginBottom: 15 },
    setLabel: { width: 40, fontWeight: 'bold' },
    input: { width: 100, height: 50, borderRadius: 10, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
    inputDisplay: { width: 100, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    setButton: { width: 50, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' },
    setButtonText: { color: '#4CD964', fontWeight: 'bold', fontSize: 12 },
    checkIcon: { width: 50, alignItems: 'center' },

    addSetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, marginHorizontal: 20, borderRadius: 10, gap: 10 },

    navButton: { marginHorizontal: 20, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    navButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

    footer: {
        position: 'absolute', bottom: 20, left: 20, right: 20,
        height: 70, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20
    },
    timerContainer: {},
    timerText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 2 },

    prevButton: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 10, backgroundColor: '#222', borderRadius: 8 },
});
