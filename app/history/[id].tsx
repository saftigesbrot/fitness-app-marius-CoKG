import { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTrainingHistory } from '@/hooks/useTrainingPlans';
import { useExercises } from '@/hooks/useExercises';
import { useSession } from '@/context/AuthContext';

export default function HistoryDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter(); // Using from next/router in typical Next setup, but Expo uses expo-router.
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');

    const { isGuest } = useSession();
    const { data: apiHistory, isLoading: isLoadingApi } = useTrainingHistory();
    const { data: allExercises } = useExercises('', '');
    const [offlineHistory, setOfflineHistory] = useState<any[]>([]);
    const [isLoadingOffline, setIsLoadingOffline] = useState(true);

    useEffect(() => {
        if (isGuest) {
            const loadOffline = async () => {
                try {
                    const stored = await AsyncStorage.getItem('offline_history');
                    if (stored) {
                        setOfflineHistory(JSON.parse(stored));
                    }
                } catch (e) {
                    console.error("Failed to load offline history", e);
                } finally {
                    setIsLoadingOffline(false);
                }
            };
            loadOffline();
        } else {
            setIsLoadingOffline(false);
        }
    }, [isGuest]);

    const history = isGuest ? offlineHistory : apiHistory;
    const isLoading = isGuest ? isLoadingOffline : isLoadingApi;

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.center, { backgroundColor }]}>
                <ActivityIndicator size="large" color={primaryColor} />
            </SafeAreaView>
        );
    }

    console.log("History Detail ID:", id);
    console.log("History Data:", history?.map((h: any) => ({ pid: h.plan_exercise_id, created: h.created_at })));

    const session = Array.isArray(history) ? history.find(h => {
        const matchId = String(h.plan_exercise_id) === String(id);
        const matchDateStr = String(h.created_at) === String(id);

        let matchDateObj = false;
        if (h.created_at && id && h.created_at !== 'undefined' && id !== 'undefined') {
            matchDateObj = new Date(h.created_at).getTime() === new Date(String(id)).getTime();
        }

        return matchId || matchDateStr || matchDateObj;
    }) : null;

    if (!session) {
        return (
            <SafeAreaView style={[styles.center, { backgroundColor }]}>
                <Stack.Screen options={{ title: 'Training nicht gefunden' }} />
                <ThemedText>Das Training konnte nicht gefunden werden.</ThemedText>
            </SafeAreaView>
        );
    }

    const { name } = session.plan_detail || session.plan || { name: 'Unbekanntes Training' };
    const dateStr = session.created_at;
    const dateObj = new Date(dateStr);
    const date = dateObj.toLocaleDateString('de-DE');

    // Fallbacks if start_time/end_time are missing
    let durationMins = 0;
    if (session.start_time && session.end_time) {
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        durationMins = Math.round((end.getTime() - start.getTime()) / 60000);
    } else {
        // Fallback: Estimate duration based on executions or just missing
        durationMins = session.executions ? Math.round((session.executions.length * 2) + 2) : 15; // Rough guess if missing
    }

    const startTimeFormatted = session.start_time ? new Date(session.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const endTimeFormatted = session.end_time ? new Date(session.end_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '?';

    // Group executions by exercise
    const executions = session.executions || session.sets || [];
    const exerciseGroups: { [key: number]: any } = {};

    executions.forEach((exe: any) => {
        const exId = exe.exercise || exe.exercise_id || 0;
        if (!exerciseGroups[exId]) {
            exerciseGroups[exId] = [];
        }
        exerciseGroups[exId].push(exe);
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen options={{ title: date, headerTintColor: textColor, headerStyle: { backgroundColor } }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Card */}
                <ThemedView style={[styles.headerCard, { backgroundColor: cardColor }]}>
                    <View style={styles.headerRow}>
                        <View style={styles.iconContainer}>
                            <IconSymbol name="figure.run" size={32} color={primaryColor} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="title">{name}</ThemedText>
                            <ThemedText style={{ color: '#aaa', marginTop: 4 }}>
                                {startTimeFormatted} - {endTimeFormatted} Uhr ({durationMins} Min)
                            </ThemedText>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <ThemedText type="subtitle">{executions.length}</ThemedText>
                            <ThemedText style={styles.statLabel}>Sätze</ThemedText>
                        </View>
                        <View style={styles.statBox}>
                            <ThemedText type="subtitle">{Object.keys(exerciseGroups).length}</ThemedText>
                            <ThemedText style={styles.statLabel}>Übungen</ThemedText>
                        </View>
                        {session.scoring_plan_detail?.use_scoring && (
                            <View style={[styles.statBox, { borderRightWidth: 0 }]}>
                                <ThemedText type="subtitle" style={{ color: '#FFD700' }}>+XP</ThemedText>
                                <ThemedText style={styles.statLabel}>Bonus</ThemedText>
                            </View>
                        )}
                    </View>
                </ThemedView>

                {/* Exerise List */}
                <ThemedText type="subtitle" style={{ marginTop: 25, marginBottom: 15, paddingHorizontal: 5 }}>
                    Übungsablauf
                </ThemedText>

                {Object.keys(exerciseGroups).map((exIdStr, idx) => {
                    const exId = parseInt(exIdStr);
                    const group = exerciseGroups[exId];

                    // Find actual exercise name
                    const exerciseInfo = allExercises?.find((e: any) => e.exercise_id === exId || e.id === exId);
                    const exerciseName = exerciseInfo ? exerciseInfo.name : `Übung ${idx + 1}`;

                    return (
                        <ThemedView key={exIdStr} style={[styles.exerciseCard, { backgroundColor: cardColor }]}>
                            <ThemedText type="defaultSemiBold" style={styles.exerciseTitle}>
                                {exerciseName}
                            </ThemedText>

                            <View style={styles.setsHeader}>
                                <ThemedText style={styles.columnSet}>Satz</ThemedText>
                                <ThemedText style={styles.columnReps}>WH / Zeit</ThemedText>
                                <ThemedText style={styles.columnWeight}>Gewicht</ThemedText>
                            </View>

                            {group.map((exe: any, setIdx: number) => {
                                const isTimeBased = exe.duration > 0 && exe.repetitions === 0;
                                return (
                                    <View key={exe.execution_id || setIdx} style={styles.setRow}>
                                        <ThemedText style={styles.columnSet}>{setIdx + 1}</ThemedText>
                                        <ThemedText style={styles.columnReps}>
                                            {isTimeBased ? `${exe.duration}s` : exe.repetitions}
                                        </ThemedText>
                                        <ThemedText style={styles.columnWeight}>
                                            {isTimeBased ? '-' : `${exe.weight} kg`}
                                        </ThemedText>
                                    </View>
                                )
                            })}
                        </ThemedView>
                    );
                })}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    headerCard: {
        borderRadius: 16,
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(45, 116, 218, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    statsRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 15,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#aaa',
        marginTop: 4,
    },
    exerciseCard: {
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    exerciseTitle: {
        fontSize: 16,
        marginBottom: 15,
        color: '#fff',
    },
    setsHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 8,
        marginBottom: 8,
    },
    setRow: {
        flexDirection: 'row',
        paddingVertical: 8,
    },
    columnSet: {
        flex: 1,
        color: '#aaa',
        fontSize: 14,
    },
    columnReps: {
        flex: 2,
        textAlign: 'center',
        color: '#fff',
        fontSize: 14,
    },
    columnWeight: {
        flex: 2,
        textAlign: 'right',
        color: '#fff',
        fontSize: 14,
    }
});
