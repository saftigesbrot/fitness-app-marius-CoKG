import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSession } from '@/context/AuthContext';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function ProfileScreen() {
    const { signOut } = useSession();

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: () => signOut() }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
                    <View style={styles.headerText}>
                        <ThemedText type="title">Max Mustermann</ThemedText>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <ThemedText style={{ color: '#fff', fontSize: 12 }}>Logout</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Level Card */}
                <ThemedView style={styles.card}>
                    <View style={styles.levelRow}>
                        <ThemedText type="subtitle">Level 12</ThemedText>
                        <ThemedText style={styles.xpText}>1200 / 2000 XP</ThemedText>
                    </View>
                    <View style={{ marginVertical: 10 }}>
                        <ProgressBar progress={0.6} color="#4CD964" height={8} />
                    </View>
                    <ThemedText style={styles.scoreText}>Aktueller Trainingsscore: <ThemedText type="defaultSemiBold">1050</ThemedText></ThemedText>
                </ThemedView>

                {/* Personal Records */}
                <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle">Persönliche Rekorde</ThemedText>
                    <IconSymbol name="chevron.right" size={20} color="#aaa" />
                </View>
                <ThemedView style={styles.card}>
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

                {/* Class Membership */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Klassenzugehörigkeit</ThemedText>
                <ThemedView style={styles.card}>
                    <View style={styles.row}>
                        <IconSymbol name="person.fill" size={24} color="#aaa" />
                        <ThemedText style={{ marginLeft: 10 }}>Klasse A</ThemedText>
                    </View>
                </ThemedView>

                {/* Public Plans */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Öffentliche Trainingspläne</ThemedText>
                <View style={styles.planList}>
                    <TouchableOpacity style={styles.planItem}>
                        <IconSymbol name="dumbbell.fill" size={20} color="#fff" />
                        <ThemedText style={styles.planName}>Ganzkörper-Push (Öffentlich)</ThemedText>
                        <IconSymbol name="pencil" size={16} color="#aaa" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.planItem}>
                        <IconSymbol name="dumbbell.fill" size={20} color="#fff" />
                        <ThemedText style={styles.planName}>Beine & Core (Privat)</ThemedText>
                        <IconSymbol name="lock.fill" size={16} color="#aaa" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0a0a0a',
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
        backgroundColor: '#333',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    card: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#1c1c1e',
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
        color: '#fff',
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
        backgroundColor: '#1c1c1e',
        padding: 15,
        borderRadius: 12,
        justifyContent: 'space-between',
    },
    planName: {
        color: '#fff',
        flex: 1,
        marginLeft: 10,
    }
});
