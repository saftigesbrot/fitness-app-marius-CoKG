import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { API_URL } from '@/services/api';
import { useExercise } from '@/hooks/useExercises';
import { usersService } from '@/services/users';

export default function ExerciseDetailScreen() {
    const { id } = useLocalSearchParams();
    const [username, setUsername] = useState<string | null>(null);
    const { data: exerciseData, isLoading } = useExercise(Number(id));
    const [exercise, setExercise] = useState<any>(null);

    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');

    useEffect(() => {
        if (exerciseData) {
            let data = exerciseData;
            // Handle array response if the API returns a list
            if (Array.isArray(exerciseData) && exerciseData.length > 0) {
                data = exerciseData[0];
            } else if (Array.isArray(exerciseData)) {
                // Empty array
                data = null;
            }

            setExercise(data);

            if (data && typeof data.user === 'number') {
                fetchUsername(data.user);
            } else if (data && data.user) {
                setUsername(String(data.user));
            }
        }
    }, [exerciseData]);

    const fetchUsername = async (userId: number) => {
        try {
            const userData = await usersService.getUser(userId);
            if (userData && userData.username) {
                setUsername(userData.username);
            } else {
                setUsername(`User #${userId}`);
            }
        } catch (error) {
            console.log('Error fetching user:', error);
            setUsername(`User #${userId}`);
        }
    };

    if (isLoading && !exercise) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor }]}>
                <ActivityIndicator size="large" color={textColor} />
            </View>
        );
    }

    if (!exercise && !isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor }]}>
                <ThemedText>Exercise not found.</ThemedText>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen options={{ title: exercise.name, headerBackTitle: 'Explore', headerTintColor: textColor, headerStyle: { backgroundColor } }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Image Section */}
                <View style={styles.imageContainer}>
                    {exercise.image ? (
                        <Image
                            source={{ uri: exercise.image.startsWith('http') ? exercise.image : `${API_URL}${exercise.image}` }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.placeholderImage, { backgroundColor: cardColor }]}>
                            <IconSymbol name="dumbbell.fill" size={80} color={textColor} />
                        </View>
                    )}
                </View>

                {/* Content Section */}
                <View style={[styles.contentContainer, { backgroundColor }]}>
                    <ThemedText type="title" style={styles.title}>{exercise.name}</ThemedText>

                    <View style={styles.metaRow}>
                        <View style={[styles.badge, { backgroundColor: cardColor }]}>
                            <ThemedText style={styles.badgeText}>
                                {exercise.category_detail?.name || exercise.category_name || exercise.category || 'Allgemein'}
                            </ThemedText>
                        </View>

                        {/* Visibility Badge */}
                        <View style={[styles.badge, { backgroundColor: exercise.public ? '#2D74DA' : cardColor }]}>
                            <IconSymbol name={exercise.public ? "lock.open.fill" : "lock.fill"} size={12} color={exercise.public ? "#fff" : textColor} style={{ marginRight: 4 }} />
                            <ThemedText style={[styles.badgeText, exercise.public && { color: '#fff' }]}>
                                {exercise.public ? 'Öffentlich' : 'Privat'}
                            </ThemedText>
                        </View>

                        {/* Creator Badge (if public and not me, or just available) */}
                        {exercise.username && (
                            <View style={[styles.badge, { backgroundColor: cardColor }]}>
                                <IconSymbol name="person.fill" size={12} color={textColor} style={{ marginRight: 4 }} />
                                <ThemedText style={styles.badgeText}>
                                    {exercise.username}
                                </ThemedText>
                            </View>
                        )}
                    </View>

                    <ThemedText type="subtitle" style={styles.sectionHeader}>Beschreibung</ThemedText>
                    <ThemedText style={styles.description}>
                        {exercise.description || 'Keine Beschreibung verfügbar.'}
                    </ThemedText>

                </View>
            </ScrollView>
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
    scrollContent: {
        paddingBottom: 40,
    },
    imageContainer: {
        width: '100%',
        height: 300,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: 20,
        marginTop: -20,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        flex: 1
    },
    title: {
        fontSize: 28,
        marginBottom: 10,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        gap: 15
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    userText: {
        color: '#aaa',
        fontSize: 14,
    },
    sectionHeader: {
        marginBottom: 10,
    },
    description: {
        lineHeight: 24,
        color: '#ccc',
    },
});
