import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSession } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { scoringsService } from '@/services/scorings';
import { trainingsService } from '@/services/trainings';

export default function ProfileScreen() {
    const { signOut, username } = useSession();
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');

    const [levelData, setLevelData] = useState<{ level: number; xp: number } | null>(null);
    const [currentScore, setCurrentScore] = useState<number>(0);
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            const [level, score, fetchedPlans] = await Promise.all([
                scoringsService.getLevel(),
                scoringsService.getScorings('current'),
                trainingsService.getTrainingPlans()
            ]);

            if (level) setLevelData(level);
            if (score && score.value !== undefined) setCurrentScore(score.value);
            if (Array.isArray(fetchedPlans)) setPlans(fetchedPlans);
        } catch (error) {
            console.error("Failed to load profile data:", error);
        }
    };

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            if (window.confirm("Möchtest du dich wirklich abmelden?")) {
                signOut();
            }
        } else {
            Alert.alert("Abmelden", "Möchtest du dich wirklich abmelden?", [
                { text: "Abbrechen", style: "cancel" },
                {
                    text: "Abmelden",
                    style: "destructive",
                    onPress: () => {
                        signOut();
                    }
                }
            ]);
        }
    };

    // Derived level cap (example logic)
    const maxXP = 2000;
    const currentXP = levelData?.xp || 0;
    const progress = Math.min(currentXP / maxXP, 1);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
                    <View style={styles.headerText}>
                        <ThemedText type="title">{username || 'Gast'}</ThemedText>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={[styles.logoutButton, { backgroundColor: cardColor }]}>
                        <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={textColor} />
                    </TouchableOpacity>
                </View>

                {/* Level Card */}
                <ThemedView style={[styles.card, { backgroundColor: cardColor }]}>
                    <View style={styles.levelRow}>
                        <ThemedText type="subtitle">Level {levelData?.level || 1}</ThemedText>
                        <ThemedText style={styles.xpText}>{currentXP} / {maxXP} XP</ThemedText>
                    </View>
                    <View style={{ marginVertical: 10 }}>
                        <ProgressBar progress={progress} color="#4CD964" height={8} />
                    </View>
                    <ThemedText style={styles.scoreText}>Aktueller Trainingsscore: <ThemedText type="defaultSemiBold">{currentScore}</ThemedText></ThemedText>
                </ThemedView>

                {/* Personal Records (Static for now) */}
                <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle">Persönliche Rekorde</ThemedText>
                    <IconSymbol name="chevron.right" size={20} color={Colors.dark.icon} />
                </View>
                <ThemedView style={[styles.card, { backgroundColor: cardColor }]}>
                    <View style={styles.recordItem}>
                        <IconSymbol name="trophy.fill" size={16} color="#FFD700" style={styles.recordIcon} />
                        <ThemedText style={styles.recordText}>Bankdrücken: 100 kg</ThemedText>
                    </View>
                    <View style={styles.recordItem}>
                        <IconSymbol name="trophy.fill" size={16} color="#FFD700" style={styles.recordIcon} />
                        <ThemedText style={styles.recordText}>Kniebeugen: 140 kg</ThemedText>
                    </View>
                    <View style={styles.recordItem}>
                        <IconSymbol name="trophy.fill" size={16} color="#FFD700" style={styles.recordIcon} />
                        <ThemedText style={styles.recordText}>Kreuzheben: 180 kg</ThemedText>
                    </View>
                </ThemedView>

                {/* Class Membership (Static for now) */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Klassenzugehörigkeit</ThemedText>
                <ThemedView style={[styles.card, { backgroundColor: cardColor }]}>
                    <View style={styles.row}>
                        <IconSymbol name="person.fill" size={24} color="#aaa" />
                        <ThemedText style={{ marginLeft: 10 }}>Klasse A</ThemedText>
                    </View>
                </ThemedView>

                {/* Public Plans (Dynamic) */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Deine Trainingspläne</ThemedText>
                <View style={styles.planList}>
                    {plans.map((plan, index) => (
                        <TouchableOpacity key={plan.id || index} style={[styles.planItem, { backgroundColor: cardColor }]}>
                            <IconSymbol name="dumbbell.fill" size={20} color={textColor} />
                            <ThemedText style={styles.planName}>{plan.name}</ThemedText>
                            {plan.public ? (
                                <IconSymbol name="pencil" size={16} color="#aaa" />
                            ) : (
                                <IconSymbol name="lock.fill" size={16} color="#aaa" />
                            )}
                        </TouchableOpacity>
                    ))}
                    {plans.length === 0 && (
                        <ThemedText style={{ color: '#aaa', fontStyle: 'italic' }}>Keine Pläne gefunden.</ThemedText>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    headerText: {
        flex: 1,
    },
    logoutButton: {
        padding: 10,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
    },
    levelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    xpText: {
        color: '#aaa',
        fontSize: 12,
    },
    scoreText: {
        color: '#aaa',
        marginTop: 5,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    recordItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    recordIcon: {
        marginRight: 10,
    },
    recordText: {
        // color: '#fff', // Handled by ThemedText
    },
    sectionTitle: {
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planList: {
        gap: 10,
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        justifyContent: 'space-between',
    },
    planName: {
        flex: 1,
        marginLeft: 10,
    }
});
