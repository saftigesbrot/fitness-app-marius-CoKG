import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].icon;
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  // Mock Data
  const dailyXP = 850;
  const maxXP = 1500;
  const trainingScore = 1020;
  const maxScore = 1000;

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
              <ThemedText type="title">Hallo, Max!</ThemedText>
              <ThemedText style={styles.subtitle}>Level 12 • XP {dailyXP}</ThemedText>
            </View>
          </View>
          <TouchableOpacity>
            <IconSymbol name="bell.fill" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Daily Progress Card */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Tagesfortschritt</ThemedText>
          <IconSymbol name="chevron.right" size={20} color={Colors.dark.icon} />
        </View>
        <ThemedView style={[styles.card, { backgroundColor: cardColor }]}>
          <View style={styles.statsRow}>
            {/* XP Circle Placeholder */}
            <View style={styles.statItem}>
              <View style={[styles.circle, { borderColor: '#4CD964' }]}>
                <ThemedText type="defaultSemiBold">XP</ThemedText>
                <ThemedText style={{ fontSize: 10, color: '#aaa' }}>Points</ThemedText>
              </View>
              <View>
                <ThemedText type="defaultSemiBold" style={{ color: '#4CD964' }}>Daily XP</ThemedText>
                <ThemedText style={styles.statValue}>{dailyXP} / {maxXP}</ThemedText>
              </View>
            </View>

            {/* Score Circle Placeholder */}
            <View style={styles.statItem}>
              <View style={[styles.circle, { borderColor: primaryColor }]}>
                <IconSymbol name="chart.bar.fill" size={20} color={primaryColor} />
              </View>
              <View>
                <ThemedText type="defaultSemiBold" style={{ color: primaryColor }}>Trainingsscore</ThemedText>
                <ThemedText style={styles.statValue}>{trainingScore} / {maxScore}</ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Start Training Button */}
        <TouchableOpacity style={[styles.mainActionButton, { backgroundColor: primaryColor }]}>
          <View>
            <ThemedText type="subtitle" style={styles.actionButtonText}>Training Starten</ThemedText>
            <ThemedText style={styles.actionButtonSubText}>Letzter Plan: Ganzkörper-Push</ThemedText>
          </View>
          <IconSymbol name="pencil" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Quick Access Grid */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Schnellzugriff</ThemedText>
        <View style={styles.grid}>
          <TouchableOpacity style={[styles.gridItem, { backgroundColor: cardColor }]} onPress={() => router.push('/explore')}>
            <ThemedText>Übungsbibliothek</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gridItem, { backgroundColor: cardColor }]}>
            <ThemedText>Meine Pläne</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gridItem, { backgroundColor: cardColor }]}>
            <ThemedText>Neuer Plan</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gridItem, { backgroundColor: cardColor }]}>
            <ThemedText>Suche</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Leaderboard Snippet */}
        <View style={styles.rowBetween}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Klassen-Leaderboard</ThemedText>
          <ThemedText style={styles.rankText}>Platz 4 von 20</ThemedText>
        </View>
        <ThemedView style={[styles.card, { backgroundColor: cardColor }]}>
          <View style={styles.leaderboardRow}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=5' }} style={styles.smallAvatar} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <ThemedText>Anna_Fit (1100 Pkt)</ThemedText>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '90%' }]} />
              </View>
            </View>
          </View>
          <View style={[styles.leaderboardRow, { marginTop: 15 }]}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.smallAvatar} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <ThemedText>Du (1050 Pkt)</ThemedText>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '80%', backgroundColor: '#4CD964' }]} />
              </View>
            </View>
          </View>
        </ThemedView>

        {/* For You Section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Für Dich</ThemedText>
        <ThemedView style={[styles.card, { backgroundColor: cardColor }]}>
          <View style={styles.row}>
            <IconSymbol name="figure.run" size={24} color="#aaa" />
            <View style={{ marginLeft: 15 }}>
              <ThemedText type="defaultSemiBold">Neuer Plan: Beine & Core</ThemedText>
              <ThemedText style={{ color: '#aaa', fontSize: 12 }}>Verkomment mückt malommiert.</ThemedText>
            </View>
          </View>
        </ThemedView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor handled by theme
  },
  container: {
    padding: 20,
    // backgroundColor handled by theme
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
    // backgroundColor handled by theme
    marginBottom: 20,
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
    // backgroundColor handled by theme
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
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  gridItem: {
    width: '48%',
    // backgroundColor handled by theme
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
    backgroundColor: '#397cc0', // primary
    borderRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  }

});
