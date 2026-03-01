
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { exercisesService } from '@/services/exercises';
import { useExerciseCategories, EXERCISE_KEYS } from '@/hooks/useExercises';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/context/AuthContext';

export default function CreateExerciseScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isGuest } = useSession();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isPublic, setIsPublic] = useState(false);
    const [trackingType, setTrackingType] = useState('reps');

    const [categories, setCategories] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');

    const { data: categoriesData, isLoading: isLoadingCats } = useExerciseCategories();

    useEffect(() => {
        if (categoriesData && Array.isArray(categoriesData)) {
            setCategories(categoriesData);
        }
    }, [categoriesData]);

    const loading = isLoadingCats;

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!name || !categoryId) {
            Alert.alert('Fehler', 'Name und Kategorie sind erforderlich.');
            return;
        }

        const payload = {
            name,
            description,
            category: categoryId,
            public: isPublic,
            imageUri // We pass the URI, the sync function will parse it
        };

        try {
            setSubmitting(true);

            if (isGuest) {
                const newExId = Date.now();
                const newEx = {
                    id: newExId,
                    exercise_id: newExId,
                    name,
                    description,
                    category: categoryId,
                    category_detail: categories.find(c => (c.category_id || c.id) === categoryId),
                    public: isPublic,
                    tracking_type: trackingType,
                    image: imageUri,
                    creator: 'Guest',
                };

                queryClient.setQueryData(
                    EXERCISE_KEYS.list(JSON.stringify({ search: '', category: '' })),
                    (oldData: any) => {
                        const data = Array.isArray(oldData) ? oldData : [];
                        return [newEx, ...data];
                    }
                );

                router.replace('/(tabs)/explore');
                return;
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('category', String(categoryId));
            formData.append('public', String(isPublic));
            formData.append('tracking_type', trackingType);

            if (imageUri) {
                const filename = imageUri.split('/').pop() || 'upload.jpg';
                const match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : 'image/jpeg';

                // Fix common mimetype issues
                if (type === 'image/jpg') {
                    type = 'image/jpeg';
                }

                // @ts-ignore
                formData.append('image', { uri: imageUri, name: filename, type });
            }

            await exercisesService.createExercise(formData);

            // Invalidate cache
            await queryClient.invalidateQueries({ queryKey: EXERCISE_KEYS.all });

            router.replace('/(tabs)/explore');
        } catch (error: any) {
            console.error('Error creating exercise:', error);

            if ((error.isAxiosError || error.name === 'AxiosError' || error.message === 'Network Error') && !error.response) {
                Alert.alert('Keine Verbindung', 'Übung konnte nicht erstellt werden, da keine Verbindung besteht.');
                return;
            }

            let errorMessage = 'Übung konnte nicht erstellt werden.';
            if (error.response && error.response.data) {
                // Format the error message details
                const detail = JSON.stringify(error.response.data);
                errorMessage += `\n${detail}`;
            }
            Alert.alert('Fehler', errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="title" style={styles.header}>Neue Übung</ThemedText>

                {/* Name Input */}
                <ThemedText style={styles.label}>Name der Übung *</ThemedText>
                <TextInput
                    style={[styles.input, { backgroundColor: cardColor, color: textColor }]}
                    placeholder="z.B. Bankdrücken"
                    placeholderTextColor="#aaa"
                    value={name}
                    onChangeText={setName}
                />

                {/* Category Selection */}
                <ThemedText style={styles.label}>Kategorie *</ThemedText>
                <ScrollView horizontal style={styles.categoryScroll} showsHorizontalScrollIndicator={false}>
                    {categories.map((cat, index) => {
                        const catId = cat.category_id || cat.id || index;
                        return (
                            <TouchableOpacity
                                key={catId}
                                style={[
                                    styles.categoryChip,
                                    { backgroundColor: categoryId === (cat.category_id || cat.id) ? '#2D74DA' : cardColor }
                                ]}
                                onPress={() => setCategoryId(cat.category_id || cat.id)}
                            >
                                <ThemedText style={styles.categoryChipText}>{cat.name}</ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Description Input */}
                <ThemedText style={styles.label}>Beschreibung</ThemedText>
                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: cardColor, color: textColor }]}
                    placeholder="Beschreibe die Ausführung..."
                    placeholderTextColor="#aaa"
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                />

                {/* Tracking Type Switch */}
                <View style={styles.switchContainer}>
                    <View>
                        <ThemedText style={styles.label}>Art der Aufzeichnung</ThemedText>
                        <ThemedText style={styles.subtext}>
                            {trackingType === 'time' ? 'Nach Zeit (Min / Sek)' : 'Nach Wiederholungen & Gewicht'}
                        </ThemedText>
                    </View>
                    <Switch
                        value={trackingType === 'time'}
                        onValueChange={(val) => setTrackingType(val ? 'time' : 'reps')}
                        trackColor={{ false: "#767577", true: "#2D74DA" }}
                        thumbColor={trackingType === 'time' ? "#fff" : "#f4f3f4"}
                    />
                </View>

                {/* Public Switch */}
                <View style={styles.switchContainer}>
                    <View>
                        <ThemedText style={styles.label}>Öffentliche Übung</ThemedText>
                        <ThemedText style={styles.subtext}>Für andere sichtbar</ThemedText>
                    </View>
                    <Switch
                        value={isPublic}
                        onValueChange={setIsPublic}
                        trackColor={{ false: "#767577", true: "#2D74DA" }}
                        thumbColor={isPublic ? "#fff" : "#f4f3f4"}
                    />
                </View>

                {/* Image Picker */}
                <ThemedText style={styles.label}>Bild</ThemedText>
                <TouchableOpacity style={[styles.imagePicker, { backgroundColor: cardColor }]} onPress={pickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <IconSymbol name="camera.fill" size={30} color="#aaa" />
                            <ThemedText style={styles.imagePlaceholderText}>Bild auswählen</ThemedText>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, { opacity: submitting ? 0.7 : 1 }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.submitButtonText}>Erstellen</ThemedText>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 30,
        textAlign: 'center',
    },
    label: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    input: {
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    categoryScroll: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    subtext: {
        fontSize: 12,
        color: '#aaa',
        marginTop: -5,
    },
    categoryChip: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    categoryChipText: {
        color: '#fff',
    },
    imagePicker: {
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        marginBottom: 30,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    imagePlaceholderText: {
        color: '#aaa',
        marginTop: 10,
    },
    submitButton: {
        backgroundColor: '#2D74DA',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
