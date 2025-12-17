import { useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

type TimeFilter = 'Täglich' | 'Wöchentlich' | 'Monatlich';

const USERS = [
    { rank: 1, name: 'Anna_Fit', points: 1100, class: 'Klasse A', avatar: 'https://i.pravatar.cc/150?img=5', gold: true },
    { rank: 2, name: 'Tom_Strong', points: 1080, class: 'Klasse A', avatar: 'https://i.pravatar.cc/150?img=11', silver: true },
    { rank: 3, name: 'Lisa_Lift', points: 1060, class: 'Klasse B', avatar: 'https://i.pravatar.cc/150?img=9', bronze: true },
    { rank: 4, name: 'Max Mustermann', points: 1050, class: 'Klasse A', avatar: 'https://i.pravatar.cc/150?img=12', isMe: true },
    { rank: 5, name: 'Ben_Power', points: 1020, class: 'Klasse A', avatar: 'https://i.pravatar.cc/150?img=3' },
    { rank: 6, name: 'Sarah_Run', points: 980, class: 'Klasse B', avatar: 'https://i.pravatar.cc/150?img=1' },
];

export default function LeaderboardScreen() {
    const [filter, setFilter] = useState<TimeFilter>('Täglich');
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');

    const renderItem = ({ item }: { item: typeof USERS[0] }) => (
        <View style={[styles.userRow, { backgroundColor: cardColor }, item.isMe && styles.myRow]}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <ThemedText type="defaultSemiBold" style={item.isMe ? styles.myText : [styles.userName, { color: textColor }]}>
                    {item.rank}. {item.name}
                </ThemedText>
                <ThemedText style={item.isMe ? styles.mySubText : styles.userSubText}>
                    ({item.class}) - {item.points} Pkt
                </ThemedText>
            </View>
            {item.gold && <IconSymbol name="trophy.fill" size={24} color="#FFD700" />}
            {item.silver && <IconSymbol name="trophy.fill" size={24} color="#C0C0C0" />}
            {item.bronze && <IconSymbol name="trophy.fill" size={24} color="#CD7F32" />}
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
            <View style={[styles.container, { backgroundColor }]}>
                <ThemedText type="title" style={styles.headerTitle}>Leaderboard</ThemedText>

                {/* Filter Tabs */}
                <View style={[styles.filterContainer, { backgroundColor: cardColor }]}>
                    {(['Täglich', 'Wöchentlich', 'Monatlich'] as TimeFilter[]).map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
                            onPress={() => setFilter(f)}>
                            <ThemedText style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                {f}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* My Rank Summary */}
                <View style={styles.summaryContainer}>
                    <ThemedText style={styles.summaryText}>
                        Mein Rang: <ThemedText style={{ color: '#4CD964', fontWeight: 'bold' }}>4. (1050 Pkt.)</ThemedText>
                    </ThemedText>
                </View>

                {/* List */}
                <FlatList
                    data={USERS}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.name}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        // backgroundColor handled by theme
    },
    container: {
        flex: 1,
        padding: 20,
        paddingBottom: 0,
    },
    headerTitle: {
        textAlign: 'center',
        marginBottom: 20,
    },
    filterContainer: {
        flexDirection: 'row',
        // backgroundColor handled by theme
        borderRadius: 8,
        padding: 4,
        marginBottom: 20,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    filterButtonActive: {
        backgroundColor: '#666', // Or a lighter gray for active state
    },
    filterText: {
        color: '#aaa',
        fontSize: 12,
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    summaryContainer: {
        marginBottom: 15,
    },
    summaryText: {
        fontSize: 14,
        color: '#fff',
    },
    listContent: {
        paddingBottom: 20,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor handled by theme
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    myRow: {
        backgroundColor: '#4CD964', // Green highlight for me
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        // color handled by theme
    },
    myText: {
        color: '#fff', // Or dark if contrast is better, but design shows white on green
    },
    userSubText: {
        color: '#aaa',
        fontSize: 12,
    },
    mySubText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
});
