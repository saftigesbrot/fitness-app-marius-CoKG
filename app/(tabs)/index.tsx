
import { useRouter } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LevelUpModal } from '@/components/ui/LevelUpModal';
import { PointsMilestoneModal } from '@/components/ui/PointsMilestoneModal';
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
  const [scoringData, setScoringData] = useState<{ value: number } | null>(null);
  const [recommendations, setRecommendations] = useState<{ plans: any[]; exercises: any[] } | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<{ myRank: number; total: number; above: any; below: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [showPointsMilestoneModal, setShowPointsMilestoneModal] = useState(false);
  const [milestonePoints, setMilestonePoints] = useState(0);
  const previousLevelRef = useRef<number | null>(null);

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const loadData = async () => {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      
      console.log('Loading level data...');
      const level = await scoringsService.getLevel();
      console.log('Level data received:', level);
      
      // Check for level up by comparing with stored level
      if (level && level.level) {
        try {
          const storedLevel = await SecureStore.getItemAsync('lastKnownLevel');
          console.log('Stored level:', storedLevel, 'Current level:', level.level);
          
          if (storedLevel) {
            const lastLevel = parseInt(storedLevel, 10);
            if (level.level > lastLevel) {
              console.log('🎉 LEVEL UP DETECTED!', lastLevel, '->', level.level);
              setNewLevel(level.level);
              setShowLevelUpModal(true);
            }
          }
          
          // Store current level
          await SecureStore.setItemAsync('lastKnownLevel', level.level.toString());
        } catch (error) {
          console.error('Error checking level up:', error);
        }
      }
      
      setLevelData(level);

      console.log('Loading scoring data...');
      const score = await scoringsService.getScorings('current');
      console.log('Scoring data received:', score);
      if (score) {
        const currentPoints = score.value || 0;
        setScoringData({
          value: currentPoints
        });
        
        // Check for points milestones
        try {
          const storedMilestones = await SecureStore.getItemAsync('pointsMilestones');
          const milestones = storedMilestones ? JSON.parse(storedMilestones) : {};
          
          // Check if we reached 2000 points for the first time
          if (currentPoints >= 2000 && !milestones.reached2000) {
            console.log('🏆 Reached 2000 points milestone!');
            milestones.reached2000 = true;
            setMilestonePoints(2000);
            setShowPointsMilestoneModal(true);
            await SecureStore.setItemAsync('pointsMilestones', JSON.stringify(milestones));
          }
          // Check if we reached 1500 points for the first time
          else if (currentPoints >= 1500 && !milestones.reached1500) {
            console.log('🌟 Reached 1500 points milestone!');
            milestones.reached1500 = true;
            setMilestonePoints(1500);
            setShowPointsMilestoneModal(true);
            await SecureStore.setItemAsync('pointsMilestones', JSON.stringify(milestones));
          }
          // Check if we dropped below 500 points
          else if (currentPoints < 500 && !milestones.below500) {
            console.log('😔 Dropped below 500 points');
            milestones.below500 = true;
            setMilestonePoints(500);
            setShowPointsMilestoneModal(true);
            await SecureStore.setItemAsync('pointsMilestones', JSON.stringify(milestones));
          }
          // Reset the below500 flag if we're back above 500
          else if (currentPoints >= 500 && milestones.below500) {
            milestones.below500 = false;
            await SecureStore.setItemAsync('pointsMilestones', JSON.stringify(milestones));
          }
        } catch (error) {
          console.error('Error checking points milestones:', error);
        }
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
      <ScrollView 
        contentContainerStyle={[styles.container, { backgroundColor }]} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
              style={styles.avatar}
            />
            <View>
              <ThemedText type="title">Hallo, {username || 'Gast'}!</ThemedText>
              <ThemedText style={styles.subtitle}>
                Level {levelData?.level || 1} ({levelData?.xp || 0} XP) • {scoringData?.value || 0} Punkte
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <IconSymbol name="bell.fill" size={24} color={iconColor} />
          </TouchableOpacity>
          {/* TEST: Level Up Modal Button - Remove in production */}
          <TouchableOpacity 
            onPress={() => {
              setNewLevel(levelData?.level || 8);
              setShowLevelUpModal(true);
            }}
            style={{ marginLeft: 10 }}
          >
            <ThemedText style={{ fontSize: 20 }}>🎉</ThemedText>
          </TouchableOpacity>
          {/* TEST: Points Milestone Buttons - Remove in production */}
          <TouchableOpacity 
            onPress={() => {
              setMilestonePoints(500);
              setShowPointsMilestoneModal(true);
            }}
            style={{ marginLeft: 5 }}
          >
            <ThemedText style={{ fontSize: 20 }}>😔</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              setMilestonePoints(1500);
              setShowPointsMilestoneModal(true);
            }}
            style={{ marginLeft: 5 }}
          >
            <ThemedText style={{ fontSize: 20 }}>⭐</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              setMilestonePoints(2000);
              setShowPointsMilestoneModal(true);
            }}
            style={{ marginLeft: 5 }}
          >
            <ThemedText style={{ fontSize: 20 }}>👑</ThemedText>
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
                dynamicColor={true}
                progressType="level"
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
                progress={(scoringData?.value || 0) / 2000}
                dynamicColor={true}
                progressType="points"
                trackColor="#333"
              >
                <View style={{ alignItems: 'center' }}>
                  <ThemedText 
                    type="subtitle" 
                    style={[
                      { fontSize: 18, lineHeight: 22 },
                      (scoringData?.value || 0) >= 2000 && { color: '#FFD700' }
                    ]}
                  >
                    {scoringData?.value || 0}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 10, color: '#aaa' }}>Punkte</ThemedText>
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
                <ThemedText style={leaderboardData.above.value >= 2000 ? { color: '#FFD700', fontWeight: '700' } : undefined}>
                  {leaderboardData.above.user__username} ({leaderboardData.above.value} Pkt)
                </ThemedText>
                <ProgressBar 
                  progress={Math.min(leaderboardData.above.value / 2000, 1)} 
                  height={6} 
                  dynamicColor={true}
                  progressType="points"
                />
              </View>
            </View>
          )}
          <View style={[styles.leaderboardRow, leaderboardData?.above && { marginTop: 15 }]}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.smallAvatar} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <ThemedText style={(scoringData?.value || 0) >= 2000 ? { color: '#FFD700', fontWeight: '700' } : undefined}>
                {username || 'Du'} ({scoringData?.value || 0} Pkt)
              </ThemedText>
              <ProgressBar 
                progress={(scoringData?.value || 0) / 2000} 
                height={6} 
                dynamicColor={true}
                progressType="points"
              />
            </View>
          </View>
          {leaderboardData?.below && (
            <View style={[styles.leaderboardRow, { marginTop: 15 }]}>
              <Image source={{ uri: `https://i.pravatar.cc/150?u=${leaderboardData.below.user__username}` }} style={styles.smallAvatar} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <ThemedText style={leaderboardData.below.value >= 2000 ? { color: '#FFD700', fontWeight: '700' } : undefined}>
                  {leaderboardData.below.user__username} ({leaderboardData.below.value} Pkt)
                </ThemedText>
                <ProgressBar 
                  progress={Math.min(leaderboardData.below.value / 2000, 1)} 
                  height={6} 
                  dynamicColor={true}
                  progressType="points"
                />
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
      
      {/* Level Up Modal */}
      <LevelUpModal
        visible={showLevelUpModal}
        level={newLevel}
        onClose={() => setShowLevelUpModal(false)}
      />
      
      {/* Points Milestone Modal */}
      <PointsMilestoneModal
        visible={showPointsMilestoneModal}
        points={milestonePoints}
        onClose={() => setShowPointsMilestoneModal(false)}
      />
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

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  }

});
