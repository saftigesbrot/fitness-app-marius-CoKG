import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DiamondBadge } from '@/components/ui/DiamondBadge';
import { useSession } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { scoringsService } from '@/services/scorings';

type TimeFilter = 'Täglich' | 'Wöchentlich' | 'Monatlich';

export default function LeaderboardScreen() {
    const [mode, setMode] = useState<'score' | 'level'>('score');
    const [filter, setFilter] = useState<TimeFilter>('Täglich');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [now, setNow] = useState(new Date());
    const { username } = useSession();

    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');

    useEffect(() => {
        loadLeaderboard();
    }, [filter, mode]);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Load data when screen is focused
    useFocusEffect(
        useCallback(() => {
            loadLeaderboard();
        }, [filter, mode])
    );

    // Pull to refresh handler
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadLeaderboard();
        setRefreshing(false);
    }, [filter, mode]);

    const getBestScorePerUser = (rows: any[]) => {
        const bestByUser = new Map<string, any>();

        rows.forEach((row: any) => {
            const userId = row.user__id || row.user || row.id;
            const userName = row.username || row.user__username;
            const userKey = userId !== undefined ? `id:${userId}` : `name:${userName || 'unknown'}`;
            const currentBest = bestByUser.get(userKey);

            if (!currentBest || (row.value || 0) > (currentBest.value || 0)) {
                bestByUser.set(userKey, row);
            }
        });

        return Array.from(bestByUser.values());
    };

    const loadLeaderboard = async () => {
        try {
            setLoading(true);

            let data;
            let levelDataMap: any = {};
            
            if (mode === 'level') {
                data = await scoringsService.getScorings('levels');
            } else {
                const timeFrame = filter === 'Täglich' ? 'daily' : filter === 'Wöchentlich' ? 'weekly' : 'monthly';
                data = await scoringsService.getScorings('leaderboard', undefined, timeFrame);
                
                // Also fetch level data for score mode to show in badge
                try {
                    const levelData = await scoringsService.getScorings('levels');
                    if (Array.isArray(levelData)) {
                        levelData.forEach((item: any) => {
                            const username = item.username || item.user__username;
                            if (username) {
                                levelDataMap[username] = item.level || 1;
                            }
                        });
                    }
                } catch (e) {
                    console.log('Could not load level data for score mode:', e);
                }
            }

            if (Array.isArray(data)) {
                const normalizedData = mode === 'score' ? getBestScorePerUser(data) : data;

                // If backend returns data sorted, we might not need this, but good safety
                // Determine sort key: 'value' (score) or 'level'/'xp'
                const sorted = [...normalizedData].sort((a, b) => {
                    if (mode === 'level') {
                        if (b.level === a.level) return (b.xp || 0) - (a.xp || 0);
                        return (b.level || 0) - (a.level || 0);
                    }
                    return (b.value || 0) - (a.value || 0);
                });

                const formattedData = sorted.map((item: any, index: number) => {
                    // Calculate XP progress for level mode
                    let xpCurrent = 0;
                    let xpNeeded = 1;
                    let levelProgress = 0;
                    let userLevel = 1;

                    if (mode === 'level' && item.level) {
                        userLevel = item.level;
                        // Use backend data if available
                        xpCurrent = item.xp_current !== undefined ? item.xp_current : item.xp || 0;
                        xpNeeded = item.xp_needed !== undefined ? item.xp_needed : calculateXpForNextLevel(item.level);
                        
                        // If backend doesn't provide xp_current, calculate it
                        if (item.xp_current === undefined && item.xp !== undefined) {
                            const totalXpForCurrentLevel = calculateTotalXpForLevel(item.level);
                            xpCurrent = item.xp - totalXpForCurrentLevel;
                        }
                        
                        levelProgress = xpNeeded > 0 ? xpCurrent / xpNeeded : 0;
                    } else {
                        // In score mode, get level from levelDataMap
                        const itemUsername = item.username || item.user__username;
                        userLevel = levelDataMap[itemUsername] || 1;
                    }

                    return {
                        rank: index + 1,
                        name: item.username || item.user__username || 'Unbekannt',
                        points: mode === 'level' ? `Lvl ${item.level || 1} (${item.xp || 0} XP)` : `${item.value} Pkt`,
                        rawValue: mode === 'level' ? item.level : item.value,
                        level: userLevel,
                        xpCurrent,
                        xpNeeded,
                        levelProgress,
                        class: 'Klasse A',
                        avatar: `https://i.pravatar.cc/150?u=${item.username || item.user__username || index}`,
                        isMe: (item.username === username || item.user__username === username),
                    };
                });
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

    // Helper function to calculate XP needed for next level (logarithmic growth)
    const calculateTotalXpForLevel = (level: number): number => {
        if (level <= 1) return 0;
        const baseXp = 100;
        return Math.floor(baseXp * Math.pow(level, 1.5));
    };

    const calculateXpForNextLevel = (currentLevel: number): number => {
        const xpForNext = calculateTotalXpForLevel(currentLevel + 1);
        const xpForCurrent = calculateTotalXpForLevel(currentLevel);
        return xpForNext - xpForCurrent;
    };

    const formatRemainingTime = (milliseconds: number): string => {
        const safeMs = Math.max(0, milliseconds);
        const totalSeconds = Math.floor(safeMs / 1000);

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const twoDigits = (value: number) => value.toString().padStart(2, '0');

        if (days > 0) {
            return `${days}T ${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`;
        }

        return `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`;
    };

    const getCountdownForFilter = (currentDate: Date, currentFilter: TimeFilter) => {
        if (currentFilter === 'Täglich') {
            const endOfDay = new Date(currentDate);
            endOfDay.setHours(24, 0, 0, 0);
            return {
                remaining: formatRemainingTime(endOfDay.getTime() - currentDate.getTime()),
            };
        }

        if (currentFilter === 'Wöchentlich') {
            const dayOfWeek = currentDate.getDay();
            const daysUntilNextMonday = ((8 - dayOfWeek) % 7) || 7;
            const endOfWeek = new Date(currentDate);
            endOfWeek.setDate(currentDate.getDate() + daysUntilNextMonday);
            endOfWeek.setHours(0, 0, 0, 0);
            return {
                remaining: formatRemainingTime(endOfWeek.getTime() - currentDate.getTime()),
            };
        }

        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        return {
            remaining: formatRemainingTime(endOfMonth.getTime() - currentDate.getTime()),
        };
    };

    const activeCountdown = mode === 'score' ? getCountdownForFilter(now, filter) : null;

    const renderItem = ({ item }: { item: any }) => {
        // Determine badge color based on rank
        let badgeColor = '#aaa'; // Default gray
        if (item.rank === 1) badgeColor = '#FFD700'; // Gold
        else if (item.rank === 2) badgeColor = '#C0C0C0'; // Silver
        else if (item.rank === 3) badgeColor = '#CD7F32'; // Bronze

        // Avatar border color
        let avatarBorderColor = '#555';
        if (item.rank === 1) avatarBorderColor = '#FFD700';
        else if (item.rank === 2) avatarBorderColor = '#C0C0C0';
        else if (item.rank === 3) avatarBorderColor = '#CD7F32';

        // Get display value for badge
        const badgeValue = mode === 'level' ? item.level : item.rawValue;
        const badgeScoreMode = mode === 'score'; // Use score mode for UP/DOWN icons

        // Calculate progress for score mode (relative to max score)
        let progress = 0;
        const MAX_SCORE = 2000;
        if (mode === 'level') {
            progress = item.levelProgress;
        } else {
            // Score progress is relative to maximum (2000)
            progress = item.rawValue / MAX_SCORE;
        }

        return (
            <View style={[
                styles.userRow, 
                { backgroundColor: cardColor }, 
                item.isMe && { 
                    backgroundColor: 'rgba(255, 204, 0, 0.08)',
                    borderWidth: 2,
                    borderColor: '#FFD700',
                }
            ]}>
                {/* Avatar */}
                <Image source={{ uri: item.avatar }} style={[styles.avatar, { borderColor: avatarBorderColor }]} />
                
                {/* User Info with Progress */}
                <View style={styles.userInfo}>
                    <ThemedText type="defaultSemiBold" style={{ color: textColor }}>
                        {item.name}
                    </ThemedText>
                    
                    {/* Progress Bar */}
                    <View style={styles.progressWrapper}>
                        <ProgressBar 
                            progress={progress} 
                            height={10} 
                            dynamicColor={true}
                            progressType={mode === 'level' ? 'level' : 'points'}
                        />
                    </View>
                    
                    {/* Points/XP Info */}
                    {mode === 'level' ? (
                        <ThemedText style={styles.xpText}>
                            {item.xpCurrent} / {item.xpNeeded} XP
                        </ThemedText>
                    ) : (
                        <ThemedText style={[
                            styles.xpText, 
                            item.rawValue >= 2000 && { color: '#FFD700', fontWeight: '700' }
                        ]}>
                            {item.rawValue} / 2000 Punkte
                        </ThemedText>
                    )}
                </View>
                
                {/* Diamond Badge - positioned to align with progress bar */}
                <View style={styles.badgeContainer}>
                    <DiamondBadge 
                        value={badgeValue} 
                        color={badgeColor} 
                        size={50} 
                        scoreMode={badgeScoreMode}
                    />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
            <View style={styles.container}>
                <ThemedText type="title" style={styles.headerTitle}>Leaderboard</ThemedText>

                {/* Mode Toggle */}
                <View style={[styles.toggleContainer, { backgroundColor: cardColor }]}>
                    <TouchableOpacity
                        style={[styles.toggleButton, mode === 'score' && { backgroundColor: primaryColor }]}
                        onPress={() => setMode('score')}>
                        <ThemedText style={mode === 'score' ? styles.toggleTextActive : styles.toggleText}>Punkte</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, mode === 'level' && { backgroundColor: primaryColor }]}
                        onPress={() => setMode('level')}>
                        <ThemedText style={mode === 'level' ? styles.toggleTextActive : styles.toggleText}>Level</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Filter Tabs - Only show in Score Mode */}
                {mode === 'score' && (
                    <View style={[styles.filterContainer, { backgroundColor: cardColor }]}>
                        {(['Täglich', 'Wöchentlich', 'Monatlich'] as TimeFilter[]).map((f) => (
                            <TouchableOpacity
                                key={f}
                                style={[
                                    styles.filterButton,
                                    filter === f && { 
                                        backgroundColor: '#2C2C2E',
                                        borderColor: primaryColor,
                                    }
                                ]}
                                onPress={() => setFilter(f)}>
                                <ThemedText style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                    {f}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* My Rank Summary */}
                <View style={[styles.summaryContainer, { backgroundColor: cardColor }]}>
                    {(() => {
                        const myRank = users.find(u => u.isMe);
                        if (myRank) {
                            return (
                                <View style={styles.summaryMainRow}>
                                    <View style={styles.summarySideBlock}>
                                        {activeCountdown && (
                                            <View style={styles.countdownRow}>
                                                <IconSymbol name="clock.fill" size={14} color="#8E8E93" />
                                                <ThemedText style={styles.countdownText}>{activeCountdown.remaining}</ThemedText>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.summaryContent}>
                                        <ThemedText style={styles.summaryLabel}>Mein Rang</ThemedText>
                                        <ThemedText style={[styles.summaryValue, { color: primaryColor }]}>
                                            #{myRank.rank}
                                        </ThemedText>
                                        <ThemedText style={styles.summarySubtext}>
                                            {myRank.points}
                                        </ThemedText>
                                    </View>

                                    <View style={styles.summarySideBlock} />
                                </View>
                            );
                        }
                        return (
                            <ThemedText style={styles.summaryText}>
                                Du bist noch nicht im Ranking.
                            </ThemedText>
                        );
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
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={primaryColor}
                                colors={[primaryColor]}
                            />
                        }
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
    toggleContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        padding: 4,
        gap: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleText: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#fff',
        fontWeight: '700',
    },
    filterContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        backgroundColor: '#1C1C1E',
        gap: 4,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterText: {
        color: '#8E8E93',
        fontSize: 13,
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: '700',
    },
    summaryContainer: {
        marginBottom: 15,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    summaryMainRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    summarySideBlock: {
        width: 118,
        minHeight: 36,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    summaryContent: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    countdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    countdownText: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    summarySubtext: {
        fontSize: 14,
        color: '#8E8E93',
    },
    summaryText: {
        fontSize: 14,
        color: '#8E8E93',
    },
    listContent: {
        paddingBottom: 20,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        gap: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#555',
    },
    userInfo: {
        flex: 1,
        gap: 4,
    },
    badgeContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    progressWrapper: {
        width: '100%',
        marginTop: 4,
    },
    progressContainer: {
        marginTop: 6,
        gap: 4,
    },
    xpText: {
        color: '#aaa',
        fontSize: 10,
        marginTop: 2,
    },
    userSubText: {
        color: '#aaa',
        fontSize: 12,
    },
});
