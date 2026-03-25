import { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Alert, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTrainingHistory } from '@/hooks/useTrainingPlans';
import { trainingsService } from '@/services/trainings';
import { useSession } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { TRAINING_KEYS } from '@/hooks/useTrainingPlans';

export default function HistoryScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');

    const { isGuest } = useSession();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: apiHistory, isLoading: isLoadingApi, refetch } = useTrainingHistory();
    const [offlineHistory, setOfflineHistory] = useState<any[]>([]);
    const [isLoadingOffline, setIsLoadingOffline] = useState(false);

    useEffect(() => {
        if (isGuest) {
            setIsLoadingOffline(true);
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
        }
    }, [isGuest]);

    const history = isGuest ? offlineHistory : apiHistory;
    const isLoading = isGuest ? isLoadingOffline : isLoadingApi;

    const handleDelete = async (id: number) => {
        Alert.alert(
            "Training löschen",
            "Möchtest du dieses Training wirklich aus deiner Historie entfernen?",
            [
                { text: "Abbrechen", style: "cancel" },
                {
                    text: "Löschen", style: "destructive", onPress: async () => {
                        if (isGuest) {
                            const newHistory = offlineHistory.filter(item => item.created_at !== id && item.plan_exercise_id !== id);
                            setOfflineHistory(newHistory);
                            await AsyncStorage.setItem('offline_history', JSON.stringify(newHistory));
                        } else {
                            try {
                                await trainingsService.deleteTrainingHistory(id);
                                queryClient.invalidateQueries({ queryKey: TRAINING_KEYS.history });
                            } catch (e) {
                                Alert.alert("Fehler", "Konnte Training nicht löschen");
                            }
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const date = new Date(item.created_at).toLocaleDateString('de-DE', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return (
            <Pressable
                onPress={() => router.push(`/history/${item.plan_exercise_id || item.created_at}`)}
                style={({ pressed }) => [{ marginBottom: 15, opacity: pressed ? 0.8 : 1 }]}
            >
                <ThemedView style={[styles.card, { backgroundColor: cardColor, marginBottom: 0 }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconContainer}>
                            <IconSymbol name="figure.run" size={24} color={primaryColor} />
                        </View>
                        <View style={styles.cardTitleContainer}>
                            <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                                {item.plan_detail?.name || item.plan?.name || 'Unbekanntes Training'}
                            </ThemedText>
                            <ThemedText style={styles.dateText}>{date}</ThemedText>
                        </View>
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation(); // Verhindere, dass der Klick auf die Karte weitergeleitet wird
                                handleDelete(item.plan_exercise_id || item.created_at)
                            }}
                            style={({ pressed }) => [{ padding: 15, zIndex: 999, elevation: 10, opacity: pressed ? 0.5 : 1 }]}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        >
                            <IconSymbol name="trash.fill" size={20} color="#FF3B30" />
                        </Pressable>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <IconSymbol name="list.number" size={16} color="#aaa" />
                            <ThemedText style={styles.statText}>
                                {item.executions?.length || item.sets?.length || 0} Übungen
                            </ThemedText>
                        </View>
                        {item.scoring_plan_detail?.use_scoring && (
                            <View style={styles.stat}>
                                <IconSymbol name="star.fill" size={16} color="#FFD700" />
                                <ThemedText style={styles.statText}>+XP</ThemedText>
                            </View>
                        )}
                    </View>
                </ThemedView>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen options={{ title: 'Letzte Trainings', headerTintColor: textColor, headerStyle: { backgroundColor } }} />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            ) : (
                <FlatList
                    data={history || []}
                    keyExtractor={(item, index) => String(item.plan_exercise_id || item.created_at || index)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <IconSymbol name="clock.arrow.circlepath" size={64} color="#555" />
                            <ThemedText style={styles.emptyText}>Noch keine Trainings abgeschlossen.</ThemedText>
                        </View>
                    }
                />
            )}
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
    listContent: {
        padding: 20,
    },
    card: {
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(45, 116, 218, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardTitleContainer: {
        flex: 1,
    },
    dateText: {
        color: '#aaa',
        fontSize: 12,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 10,
        gap: 20,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        color: '#ccc',
        fontSize: 14,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 20,
        color: '#aaa',
        textAlign: 'center',
    },
});
