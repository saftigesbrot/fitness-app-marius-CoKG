import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSession } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { scoringsService } from '@/services/scorings';

type TimeFilter = 'Täglich' | 'Wöchentlich' | 'Monatlich';

export default function LeaderboardScreen() {
    const [filter, setFilter] = useState<TimeFilter>('Täglich');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { username } = useSession();

    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');

    useEffect(() => {
        loadLeaderboard();
    }, [filter]);

    const loadLeaderboard = async () => {
        try {
            setLoading(true);

            // Map UI filter to API parameter
            let type: 'current' | 'top' = 'top'; // Default
            // If the API supports 'daily', 'weekly', 'monthly', we should pass that.
            // Currently scoringsService only types 'current' | 'top'.
            // Assuming for now 'top' returns the all-time highscore or similar, 
            // and maybe the backend isn't ready for time-based filtering yet 
            // OR we need to extend the service. 
            // Let's stick to 'top' for now but if logic existed it would be:
            // const timeFrame = filter === 'Täglich' ? 'daily' : filter === 'Wöchentlich' ? 'weekly' : 'monthly';

            // Ideally we would call: scoringsService.getScorings('top', undefined, timeFrame);
            // But let's just use 'top' and maybe 'current' if filter is 'Täglich' (just as a heuristic if no better API exists)

            const data = await scoringsService.getScorings('top');

            if (Array.isArray(data)) {
                // Sort data by score just in case backend doesn't
                const sorted = [...data].sort((a, b) => (b.value || b.score || 0) - (a.value || a.score || 0));

                const formattedData = sorted.map((item: any, index: number) => ({
                    rank: index + 1,
                    // Handle different possible user object structures
                    name: item.user__username || item.username || item.user?.username || 'Unbekannt',
                    points: item.value || item.score || 0,
                    class: 'Klasse A',
                    avatar: `https://i.pravatar.cc/150?u=${item.user__username || item.username || index}`,
                    isMe: (item.user__username === username || item.username === username),
                }));
                setUsers(formattedData);
            } else {
                setUsers([]);
            }
        } catch (e) {
            console.error("Leaderboard load failed:", e);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.userRow, { backgroundColor: cardColor }, item.isMe && { backgroundColor: primaryColor }]}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <ThemedText type="defaultSemiBold" style={item.isMe ? styles.myText : { color: textColor }}>
                    {item.rank}. {item.name}
                </ThemedText>
                <ThemedText style={item.isMe ? styles.mySubText : styles.userSubText}>
                    ({item.class}) - {item.points} Pkt
                </ThemedText>
            </View>
            {item.rank === 1 && <IconSymbol name="trophy.fill" size={24} color="#FFD700" />}
            {item.rank === 2 && <IconSymbol name="trophy.fill" size={24} color="#C0C0C0" />}
            {item.rank === 3 && <IconSymbol name="trophy.fill" size={24} color="#CD7F32" />}
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
            <View style={styles.container}>
                <ThemedText type="title" style={styles.headerTitle}>Leaderboard</ThemedText>

                {/* Filter Tabs */}
                <View style={[styles.filterContainer, { backgroundColor: cardColor }]}>
                    {(['Täglich', 'Wöchentlich', 'Monatlich'] as TimeFilter[]).map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.filterButton,
                                filter === f && { backgroundColor: '#666' } // Active state
                            ]}
                            onPress={() => setFilter(f)}>
                            <ThemedText style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                {f}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* My Rank Summary */}
                <View style={styles.summaryContainer}>
                    {/* Calculate rank from loaded users */}
                    {(() => {
                        const myRank = users.find(u => u.isMe);
                        if (myRank) {
                            return (
                                <ThemedText style={styles.summaryText}>
                                    Mein Rang: <ThemedText style={{ color: '#4CD964', fontWeight: 'bold' }}>{myRank.rank}. ({myRank.points} Pkt.)</ThemedText>
                                </ThemedText>
                            );
                        }
                        return <ThemedText style={styles.summaryText}>Du bist noch nicht im Ranking.</ThemedText>;
                    })()}
                </View>

                {/* List */}
                {loading ? (
                    <ActivityIndicator size="large" color={primaryColor} />
                ) : (
                    <FlatList
                        data={users}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => item.name + index}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<ThemedText style={{ textAlign: 'center', marginTop: 20, color: '#aaa' }}>Keine Einträge gefunden.</ThemedText>}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
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
        // color: '#fff', // From Theme
    },
    listContent: {
        paddingBottom: 20,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
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
    myText: {
        color: '#fff',
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
