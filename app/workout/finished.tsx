import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LevelUpModal } from '@/components/ui/LevelUpModal';
import { scoringsService } from '@/services/scorings';

export default function FinishedScreen() {
    const { xp, oldLevel } = useLocalSearchParams();
    const backgroundColor = useThemeColor({}, 'background');
    const primaryColor = '#2D74DA';
    
    const [showLevelUpModal, setShowLevelUpModal] = useState(false);
    const [newLevel, setNewLevel] = useState(0);

    useEffect(() => {
        // Check if level up occurred
        const checkLevelUp = async () => {
            try {
                const levelData = await scoringsService.getLevel();
                if (levelData && oldLevel) {
                    const previousLevel = parseInt(oldLevel as string);
                    if (levelData.level > previousLevel) {
                        setNewLevel(levelData.level);
                        // Delay modal to let user see XP first
                        setTimeout(() => {
                            setShowLevelUpModal(true);
                        }, 1500);
                    }
                }
            } catch (error) {
                console.log('Error checking level up:', error);
            }
        };

        checkLevelUp();
    }, [oldLevel]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.content}>
                <IconSymbol name="trophy.fill" size={100} color="#FFD700" style={{ marginBottom: 20 }} />

                <ThemedText type="title" style={styles.title}>Training Beendet!</ThemedText>

                <ThemedText style={styles.subtitle}>
                    Du hast großartige Arbeit geleistet.
                </ThemedText>

                <View style={styles.xpContainer}>
                    <ThemedText style={styles.xpLabel}>Erhaltene XP</ThemedText>
                    <ThemedText type="title" style={styles.xpValue}>+{xp || 0}</ThemedText>
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: primaryColor }]}
                    onPress={() => router.dismissTo('/')}
                >
                    <ThemedText style={styles.buttonText}>Zurück zum Home</ThemedText>
                </TouchableOpacity>
            </View>
            
            {/* Level Up Modal */}
            <LevelUpModal
                visible={showLevelUpModal}
                level={newLevel}
                onClose={() => {
                    setShowLevelUpModal(false);
                    router.dismissTo('/');
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 40 },

    xpContainer: {
        backgroundColor: '#333',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 50,
        width: '80%'
    },
    xpLabel: { color: '#aaa', fontSize: 14, marginBottom: 5, textTransform: 'uppercase' },
    xpValue: { fontSize: 48, color: '#FFD700', fontWeight: 'bold' },

    button: {
        width: '100%',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
