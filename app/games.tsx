import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Alert, FlatList, Platform, Pressable, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { gamesService, type Game } from '@/services/games';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function GamesScreen() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const { width } = useWindowDimensions();
  const backgroundColor = '#0f172a';
  const cardColor = '#1e293b';
  const primaryColor = useThemeColor({}, 'primary');
  const mutedText = useThemeColor({ light: '#616161', dark: '#B0B7C3' }, 'icon');
  const borderColor = '#2a3348';

  const loadGames = useCallback(() => {
    let active = true;
    (async () => {
      try {
        const storedGames = await gamesService.getGames();
        if (active) setGames(storedGames);
      } catch {
        // ignore
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(loadGames);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const numColumns = useMemo(() => {
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  }, [width]);

  const handleDelete = (id: string) => {
    const performDelete = async () => {
      try {
        const next = await gamesService.deleteGame(id);
        setGames(next);
      } catch {
        Alert.alert('Fehler', 'Spiel konnte nicht gelöscht werden.');
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const ok = window.confirm('Möchtest du dieses Spiel wirklich löschen?');
      if (ok) void performDelete();
      return;
    }

    Alert.alert('Spiel löschen', 'Möchtest du dieses Spiel wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => void performDelete(),
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Spiele
        </ThemedText>
        {games.length === 0 ? (
          <ThemedText>Hier werden später Spiele angezeigt.</ThemedText>
        ) : (
          <FlatList
            data={games}
            key={numColumns}
            numColumns={numColumns}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const totalMinutes = (item.exercises ?? []).reduce((sum, ex) => sum + (ex.durationMinutes || 0), 0);
              return (
                <Pressable
                  style={({ hovered }) => [
                    styles.card,
                    { backgroundColor: cardColor, borderColor, flex: 1 },
                    hovered ? styles.cardHover : null,
                  ]}
                >
                  <Pressable style={styles.cardHeader} onPress={() => router.push(`/games/${item.id}`)}>
                    <View style={styles.logoWrap}>
                      <ThemedText style={styles.logoText}>{item.logo?.trim() ? item.logo : '🎮'}</ThemedText>
                    </View>
                    <ThemedText style={styles.gameName}>{item.name}</ThemedText>
                  </Pressable>

                  <View style={styles.cardBody}>
                    <ThemedText style={[styles.metaText, { color: mutedText }]}>Dauer: {totalMinutes} Min</ThemedText>
                    <ThemedText style={[styles.metaText, { color: mutedText }]}>
                      Material: {item.material?.trim() ? item.material : '—'}
                    </ThemedText>
                  </View>

                  <Pressable
                    style={styles.deleteIcon}
                    onPress={() => handleDelete(item.id)}
                    hitSlop={10}
                  >
                    <ThemedText style={styles.deleteIconText}>×</ThemedText>
                  </Pressable>
                </Pressable>
              );
            }}
          />
        )}
      </View>
      <View style={[styles.stickyFooter, { backgroundColor }]}>
        <TouchableOpacity style={[styles.button, { backgroundColor: primaryColor }]} onPress={() => router.push('/games/create')}>
          <ThemedText style={{ color: 'white' }}>Spiel erstellen</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 12,
  },
  list: {
    gap: 16,
    paddingBottom: 80,
  },
  gridRow: {
    gap: 16,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderColor: '#2a3348',
  },
  cardHover: {
    borderColor: '#3b82f6',
    transform: [{ scale: 1.01 }],
  },
  cardHeader: {
    alignItems: 'center',
    gap: 8,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoText: {
    fontSize: 22,
  },
  gameName: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardBody: {
    gap: 6,
  },
  metaText: {
    fontSize: 14,
  },
  deleteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.9)',
  },
  deleteIconText: {
    color: 'white',
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '700',
  },
  button: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2a3348',
  },
});
