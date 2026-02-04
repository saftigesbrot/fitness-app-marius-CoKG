
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSession } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { scoringsService } from '@/services/scorings';
import { trainingsService } from '@/services/trainings';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].icon;
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  const { username } = useSession();
  const [levelData, setLevelData] = useState<{ level: number; xp: number; xp_current: number; xp_needed: number } | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [topScore, setTopScore] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<{ plans: any[]; exercises: any[] } | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<{ myRank: number; total: number; above: any; below: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const level = await scoringsService.getLevel();
      setLevelData(level);

      const score = await scoringsService.getScorings('current');
      if (score && score.value !== undefined) {
        setCurrentScore(score.value);
      }

      // Load recommendations (new public plans and exercises)
      try {
        const recs = await trainingsService.getRecommendations();
        if (recs) {
          setRecommendations(recs);
        }
      } catch (error) {
        console.log('Error loading recommendations:', error);
      }

      // Load leaderboard data (uses top scores)
      const leaderboard = await scoringsService.getScorings('leaderboard');
      if (Array.isArray(leaderboard)) {
        // Find my rank
        const myIndex = leaderboard.findIndex(item => item.user__username === username);
        if (myIndex !== -1) {
          setLeaderboardData({
            myRank: myIndex + 1,
            total: leaderboard.length,
            above: myIndex > 0 ? leaderboard[myIndex - 1] : null,
            below: myIndex < leaderboard.length - 1 ? leaderboard[myIndex + 1] : null
          });
          // Set top score for leaderboard display
          setTopScore(leaderboard[myIndex].value);
        }
      }
    } catch (error) {
      console.log('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTraining = async () => {
    try {
      // Fetch user's plans to start training
      const plans = await trainingsService.getTrainingPlans();
      if (Array.isArray(plans) && plans.length > 0) {
        const planToStart = plans[0];
        const planId = planToStart.plan_id || planToStart.id;
        console.log("Starting training for plan:", planId);
        const response = await trainingsService.startTraining(planId);
        console.log("Start response:", response);
        router.push(`/workout/${planId}`);
      } else {
        Alert.alert("Keine Pläne", "Du hast noch keine Trainingspläne. Erstelle zuerst einen Plan.");
        router.push('/explore');
      }
    } catch (error) {
      Alert.alert("Fehler", "Training konnte nicht gestartet werden.");
      console.error(error);
    }
  };



  // derived or mock values for display limits
  const maxXP = 2000;
  const maxScore = 1500;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
              style={styles.avatar}
            />
            <View>
              <ThemedText type="title">Hallo, {username || 'Gast'}!</ThemedText>
              <ThemedText style={styles.subtitle}>Level {levelData?.level || 1} • {levelData?.xp_current || 0}/{levelData?.xp_needed || 0} XP</ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <IconSymbol name="bell.fill" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Daily Progress Card */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Fortschritt</ThemedText>
          <IconSymbol name="chevron.right" size={20} color={Colors.dark.icon} />
        </View>
        <ThemedView style={[styles.card, { backgroundColor: cardColor }]}>
          <View style={styles.statsRow}>
            {/* XP Circle */}
            <View style={styles.statItem}>
              <CircularProgress
                size={80}
                strokeWidth={8}
                progress={(levelData?.xp_current || 0) / (levelData?.xp_needed || 1)}
                color="#4CD964"
                trackColor="#333"
              >
                <View style={{ alignItems: 'center' }}>
                  <ThemedText type="subtitle" style={{ fontSize: 24, lineHeight: 28 }}>{levelData?.level || 1}</ThemedText>
                  <ThemedText style={{ fontSize: 10, color: '#aaa' }}>Level</ThemedText>
                </View>
              </CircularProgress>
            </View>

            {/* Score Circle */}
            <View style={styles.statItem}>
              <CircularProgress
                size={80}
                strokeWidth={8}
                progress={currentScore / 2000}
                color={primaryColor}
                trackColor="#333"
              >
                <View style={{ alignItems: 'center' }}>
                  <ThemedText type="subtitle" style={{ fontSize: 18, lineHeight: 22 }}>{currentScore}</ThemedText>
                  <ThemedText style={{ fontSize: 10, color: '#aaa' }}>Score</ThemedText>
                </View>
              </CircularProgress>
            </View>
          </View>
        </ThemedView>

        {/* Start Training Button */}
        <TouchableOpacity style={[styles.mainActionButton, { backgroundColor: primaryColor }]} onPress={handleStartTraining}>
          <View>
            <ThemedText type="subtitle" style={styles.actionButtonText}>Training Starten</ThemedText>
            <ThemedText style={styles.actionButtonSubText}>
              Starte dein erstes Training!
            </ThemedText>
          </View>
          <IconSymbol name="pencil" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Quick Access Grid */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Schnellzugriff</ThemedText>
        <View style={styles.grid}>
          <TouchableOpacity style={[styles.gridItem, { backgroundColor: cardColor }]} onPress={() => router.push('/explore')}>
            <ThemedText>Übungsbibliothek</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gridItem, { backgroundColor: cardColor }]} onPress={() => router.push('/training/create')}>
            <ThemedText>Neuer Plan</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gridItem, { backgroundColor: cardColor }]} onPress={() => router.push('/exercise/create')}>
            <ThemedText>Eigene Übung</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gridItem, { backgroundColor: cardColor }]} onPress={() => router.push('/profile')}>
            <ThemedText>Profil</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Leaderboard Snippet */}
        <TouchableOpacity style={styles.rowBetween} onPress={() => router.push('/leaderboard')}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Klassen-Leaderboard</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ThemedText style={styles.rankText}>
              {leaderboardData ? `Platz ${leaderboardData.myRank} von ${leaderboardData.total}` : 'Lade...'}
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={Colors.dark.icon} style={{ marginLeft: 5 }} />
          </View>
        </TouchableOpacity>
        <ThemedView style={[styles.card, styles.leaderboardCard]}>
          {leaderboardData?.above && (
            <View style={styles.leaderboardRow}>
              <Image source={{ uri: `https://i.pravatar.cc/150?u=${leaderboardData.above.user__username}` }} style={styles.smallAvatar} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <ThemedText>{leaderboardData.above.user__username} ({leaderboardData.above.value} Pkt)</ThemedText>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${Math.min((leaderboardData.above.value / 2000) * 100, 100)}%` }]} />
                </View>
              </View>
            </View>
          )}
          <View style={[styles.leaderboardRow, leaderboardData?.above && { marginTop: 15 }]}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.smallAvatar} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <ThemedText>{username || 'Du'} ({topScore} Pkt)</ThemedText>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min((topScore / 2000) * 100, 100)}%`, backgroundColor: '#4CD964' }]} />
              </View>
            </View>
          </View>
          {leaderboardData?.below && (
            <View style={[styles.leaderboardRow, { marginTop: 15 }]}>
              <Image source={{ uri: `https://i.pravatar.cc/150?u=${leaderboardData.below.user__username}` }} style={styles.smallAvatar} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <ThemedText>{leaderboardData.below.user__username} ({leaderboardData.below.value} Pkt)</ThemedText>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${Math.min((leaderboardData.below.value / 2000) * 100, 100)}%` }]} />
                </View>
              </View>
            </View>
          )}
        </ThemedView>

        {/* For You Section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Für Dich</ThemedText>
        {recommendations && (recommendations.plans.length > 0 || recommendations.exercises.length > 0) ? (
          <View>
            {recommendations.plans.map((plan) => (
              <TouchableOpacity
                key={plan.plan_id}
                onPress={() => router.push(`/training/${plan.plan_id}`)}
                activeOpacity={0.7}
                style={{ marginBottom: 12 }}
              >
                <ThemedView style={styles.card}>
                  <View style={styles.row}>
                    <IconSymbol name="figure.run" size={24} color={primaryColor} />
                    <View style={{ marginLeft: 15, flex: 1 }}>
                      <ThemedText type="defaultSemiBold">{plan.name}</ThemedText>
                      <ThemedText style={{ color: '#aaa', fontSize: 12 }}>Neuer öffentlicher Trainingsplan</ThemedText>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color="#aaa" />
                  </View>
                </ThemedView>
              </TouchableOpacity>
            ))}
            {recommendations.exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.exercise_id}
                onPress={() => router.push(`/exercise/${exercise.exercise_id}`)}
                activeOpacity={0.7}
                style={{ marginBottom: 12 }}
              >
                <ThemedView style={styles.card}>
                  <View style={styles.row}>
                    <IconSymbol name="dumbbell.fill" size={24} color={primaryColor} />
                    <View style={{ marginLeft: 15, flex: 1 }}>
                      <ThemedText type="defaultSemiBold">{exercise.name}</ThemedText>
                      <ThemedText style={{ color: '#aaa', fontSize: 12 }}>Neue öffentliche Übung</ThemedText>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color="#aaa" />
                  </View>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <ThemedView style={styles.card}>
            <View style={styles.row}>
              <IconSymbol name="sparkles" size={24} color="#aaa" />
              <View style={{ marginLeft: 15, flex: 1 }}>
                <ThemedText type="defaultSemiBold">Keine neuen Empfehlungen</ThemedText>
                <ThemedText style={{ color: '#aaa', fontSize: 12 }}>Schau später wieder vorbei!</ThemedText>
              </View>
            </View>
          </ThemedView>
        )}

      </ScrollView >
    </SafeAreaView >
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  subtitle: {
    fontSize: 12,
    color: '#aaa',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  card: {
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
  },
  leaderboardCard: {
    marginBottom: 15,
    marginTop: -5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  mainActionButton: {
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtonSubText: {
    color: '#rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  sectionTitle: {
    marginBottom: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  gridItem: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rankText: {
    color: '#aaa',
    fontSize: 12,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginTop: 5,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2D74DA',
    borderRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  }

});
