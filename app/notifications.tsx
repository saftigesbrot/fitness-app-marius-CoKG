import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSession } from '@/context/AuthContext';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    icon: string;
}

export default function NotificationsScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const { username } = useSession();

    // Mock notifications - in production, fetch from backend
    const notifications: Notification[] = [
        {
            id: '1',
            title: `Willkommen, ${username || 'Gast'}! 🎉`,
            message: 'Schön, dass du da bist! Starte jetzt dein erstes Training und sammle XP, um dein Level zu steigern.',
            timestamp: 'Gerade eben',
            read: false,
            icon: 'hand.wave.fill'
        }
    ];

    return (
        <>
            <Stack.Screen options={{ title: 'Benachrichtigungen' }} />
            <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
                <View style={styles.container}>
                    {/* Notifications List */}
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {notifications.length === 0 ? (
                            <View style={styles.emptyState}>
                                <IconSymbol name="bell.slash" size={48} color="#666" />
                                <ThemedText style={styles.emptyText}>Keine Benachrichtigungen</ThemedText>
                            </View>
                        ) : (
                            notifications.map((notification) => (
                                <TouchableOpacity
                                    key={notification.id}
                                    style={[
                                        styles.notificationCard,
                                        { backgroundColor: cardColor },
                                        !notification.read && { borderLeftWidth: 4, borderLeftColor: primaryColor }
                                    ]}
                                >
                                    <View style={styles.notificationIcon}>
                                        <IconSymbol
                                            name={notification.icon as any}
                                            size={24}
                                            color={primaryColor}
                                        />
                                    </View>
                                    <View style={styles.notificationContent}>
                                        <ThemedText type="defaultSemiBold" style={styles.notificationTitle}>
                                            {notification.title}
                                        </ThemedText>
                                        <ThemedText style={styles.notificationMessage}>
                                            {notification.message}
                                        </ThemedText>
                                        <ThemedText style={styles.notificationTime}>
                                            {notification.timestamp}
                                        </ThemedText>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
    },
    notificationIcon: {
        marginRight: 15,
        justifyContent: 'flex-start',
        paddingTop: 2,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        marginBottom: 5,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#aaa',
        lineHeight: 20,
        marginBottom: 8,
    },
    notificationTime: {
        fontSize: 12,
        color: '#666',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        marginTop: 15,
        color: '#666',
        fontSize: 16,
    },
});
