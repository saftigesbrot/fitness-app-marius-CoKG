import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Animated, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { gamesService, type Game } from '@/services/games';
import { Fonts } from '@/constants/theme';

export default function GameDetailScreen() {
  const { id, tab } = useLocalSearchParams();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'training'>('info');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [trainingMode, setTrainingMode] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const initialOrderRef = useRef<string[]>([]);
  const gameRef = useRef<Game | null>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const textColor = '#ECEDEE';
  const mutedText = '#B0B7C3';
  const backgroundColor = '#0f172a';
  const cardColor = '#1e293b';
  const borderColor = '#2a3348';

  const loadGame = useCallback(() => {
    let active = true;
    (async () => {
      try {
        if (typeof id !== 'string') return;
        const found = await gamesService.getGame(id);
        if (!active) return;
        if (!found) {
          setLoadError('Spiel konnte nicht geladen werden.');
          return;
        }
        setLoadError(null);
        setGame(found);
      } catch {
        if (active) setLoadError('Spiel konnte nicht geladen werden.');
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  useFocusEffect(loadGame);

  useEffect(() => {
    if (tab === 'training') setActiveTab('training');
  }, [tab]);

  useEffect(() => {
    gameRef.current = game;
    if (game && initialOrderRef.current.length === 0) {
      initialOrderRef.current = (game.exercises ?? []).map((ex) => ex.id);
    }
  }, [game]);

  useEffect(() => {
    if (!isRunning) return;
    if (!endAt || !activeExerciseId) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        if (autoAdvance) {
          void completeActiveExercise();
        } else {
          setIsRunning(false);
          setEndAt(null);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, endAt, activeExerciseId]);

  useEffect(() => {
    if (!isRunning) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isRunning, pulseAnim]);

  if (loadError) {
    return (
      <View style={[styles.screen, { backgroundColor }]}>
        <ThemedText>{loadError}</ThemedText>
        <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/games')}>
          <ThemedText style={styles.backText}>← Zurück</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (!game) {
    return (
      <View style={[styles.screen, { backgroundColor }]}>
        <ThemedText>Spiel nicht gefunden.</ThemedText>
        <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/games')}>
          <ThemedText style={styles.backText}>← Zurück</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const moveExercise = async (index: number, direction: -1 | 1) => {
    if (!game) return;
    if (trainingMode) return;
    const next = [...(game.exercises ?? [])];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const updated = await gamesService.updateGame(game.id, {
      name: game.name,
      logo: game.logo,
      material: game.material,
      rules: game.rules,
      exercises: next,
    });
    if (updated) setGame(updated);
  };

  const startTraining = () => {
    const current = gameRef.current;
    if (!current) return;
    setTrainingMode(true);
    const next = (current.exercises ?? []).find((ex) => !ex.completed);
    if (!next) {
      setActiveExerciseId(null);
      setIsRunning(false);
      setRemainingSeconds(0);
      setEndAt(null);
      return;
    }
    setActiveExerciseId(next.id);
    const seconds = Math.max(1, (next.durationMinutes || 0) * 60);
    setRemainingSeconds(seconds);
    setEndAt(Date.now() + seconds * 1000);
    setIsRunning(true);
  };

  const pauseTraining = () => {
    setIsRunning(false);
    setEndAt(null);
  };

  const resumeTraining = () => {
    if (!activeExerciseId) return;
    if (remainingSeconds <= 0) return;
    setEndAt(Date.now() + remainingSeconds * 1000);
    setIsRunning(true);
  };

  const completeActiveExercise = async () => {
    const current = gameRef.current;
    if (!current || !activeExerciseId) return;
    const list = [...(current.exercises ?? [])];
    const idx = list.findIndex((ex) => ex.id === activeExerciseId);
    if (idx === -1) return;
    const [activeEx] = list.splice(idx, 1);
    list.push({ ...activeEx, completed: true });

    const updated = await gamesService.updateGame(current.id, {
      name: current.name,
      logo: current.logo,
      material: current.material,
      rules: current.rules,
      exercises: list,
    });
    if (!updated) return;
    setGame(updated);
    gameRef.current = updated;

    const next = (updated.exercises ?? []).find((ex) => !ex.completed);
    if (!next) {
      setActiveExerciseId(null);
      setIsRunning(false);
      setRemainingSeconds(0);
      setEndAt(null);
      return;
    }
    setActiveExerciseId(next.id);
    const seconds = Math.max(1, (next.durationMinutes || 0) * 60);
    setRemainingSeconds(seconds);
    if (autoAdvance) {
      setEndAt(Date.now() + seconds * 1000);
      setIsRunning(true);
    } else {
      setEndAt(null);
      setIsRunning(false);
    }
  };

  const manualComplete = () => {
    void completeActiveExercise();
  };

  const resetTraining = async () => {
    if (!game) return;
    const order = initialOrderRef.current;
    const exercises = [...(game.exercises ?? [])]
      .map((ex) => ({ ...ex, completed: false }))
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

    const updated = await gamesService.updateGame(game.id, {
      name: game.name,
      logo: game.logo,
      material: game.material,
      rules: game.rules,
      exercises,
    });
    if (updated) setGame(updated);
    setTrainingMode(false);
    setActiveExerciseId(null);
    setRemainingSeconds(0);
    setEndAt(null);
    setIsRunning(false);
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor }]}
      contentContainerStyle={styles.container}
      stickyHeaderIndices={[3]}
    >
      <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/games')}>
        <ThemedText style={styles.backText}>← Zurück</ThemedText>
      </TouchableOpacity>

      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <ThemedText style={styles.logoText}>{game.logo?.trim() ? game.logo : '🎮'}</ThemedText>
        </View>
        <ThemedText type="title" style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
          {game.name}
        </ThemedText>
      </View>

      <View style={styles.rule} />

      <View style={[styles.tabsSticky, { backgroundColor }]}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'info' ? styles.tabActive : styles.tabInactive]}
            onPress={() => setActiveTab('info')}
          >
            <ThemedText style={styles.tabText}>Spiel-Info</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'training' ? styles.tabActive : styles.tabInactive]}
            onPress={() => setActiveTab('training')}
          >
            <ThemedText style={styles.tabText}>Trainings-Plan</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'info' ? (
        <>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: mutedText }]}>Steckbrief</ThemedText>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: mutedText }]}>Material</ThemedText>
              <ThemedText style={[styles.infoValue, { color: textColor }]}>
                {game.material?.trim() ? game.material : '—'}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: mutedText }]}>Gesamtdauer</ThemedText>
              <ThemedText style={[styles.infoValue, { color: textColor }]}>
                {game.exercises?.length
                  ? `${game.exercises.reduce((sum, ex) => sum + (ex.durationMinutes || 0), 0)} min`
                  : '—'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: mutedText }]}>Regeln</ThemedText>
            <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
              <ThemedText style={[styles.value, styles.preWrap, { color: textColor }]}>
                {game.rules?.trim() ? game.rules : '—'}
              </ThemedText>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.section}>
          <View style={styles.trainingHeader}>
            <View style={styles.trainingTopRow}>
              <ThemedText style={[styles.sectionTitle, { color: mutedText }]}>Übungsablauf</ThemedText>
              <TouchableOpacity style={styles.editLink} onPress={() => router.push(`/games/${game.id}/exercises`)}>
                <ThemedText style={[styles.editLinkText, { color: '#3b82f6' }]}>Bearbeiten</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.trainingControls}>
              <TouchableOpacity
                style={[
                  styles.mainButton,
                  !trainingMode ? styles.mainBlue : isRunning ? styles.mainOrange : styles.mainGreen,
                ]}
                onPress={() => {
                  if (!trainingMode) startTraining();
                  else if (isRunning) pauseTraining();
                  else if (remainingSeconds <= 0) manualComplete();
                  else resumeTraining();
                }}
              >
                <ThemedText style={styles.mainButtonText}>
                  {!trainingMode ? 'Training starten' : isRunning ? 'Pause' : 'Weiter'}
                </ThemedText>
              </TouchableOpacity>

              <View style={styles.autoRow}>
                <Pressable
                  style={[styles.checkbox, autoAdvance ? styles.checkboxChecked : styles.checkboxUnchecked]}
                  onPress={() => setAutoAdvance((v) => !v)}
                >
                  {autoAdvance ? <ThemedText style={styles.checkboxMark}>✓</ThemedText> : null}
                </Pressable>
                <ThemedText style={[styles.autoText, { color: mutedText }]}>Auto-Modus</ThemedText>
              </View>

              <TouchableOpacity style={styles.resetLink} onPress={resetTraining}>
                <ThemedText style={[styles.resetText, { color: mutedText }]}>Training zurücksetzen</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.list}>
            {(game.exercises ?? []).map((ex, index) => (
              <View
                key={ex.id ?? String(index)}
                style={[
                  styles.card,
                  { backgroundColor: cardColor, borderColor },
                  ex.completed ? styles.cardCompleted : null,
                  activeExerciseId === ex.id ? styles.cardActive : null,
                  trainingMode && activeExerciseId !== ex.id ? styles.cardDim : null,
                ]}
              >
                {activeExerciseId === ex.id && isRunning ? (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.activeGlow,
                      {
                        opacity: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.15, 0.4],
                        }),
                      },
                    ]}
                  />
                ) : null}
                <View style={styles.exerciseHeader}>
                  <Pressable
                    style={[styles.checkbox, ex.completed ? styles.checkboxChecked : styles.checkboxUnchecked]}
                    onPress={async () => {
                      if (!game) return;
                      const list = [...(game.exercises ?? [])];
                      const idx = list.findIndex((item) => item.id === ex.id);
                      if (idx === -1) return;
                      const current = list[idx];
                      const toggled = { ...current, completed: !current.completed };
                      list.splice(idx, 1);
                      if (toggled.completed) {
                        list.push(toggled);
                      } else {
                        list.unshift(toggled);
                      }

                      const updated = await gamesService.updateGame(game.id, {
                        name: game.name,
                        logo: game.logo,
                        material: game.material,
                        rules: game.rules,
                        exercises: list,
                      });
                      if (updated) setGame(updated);
                    }}
                  >
                    {ex.completed ? <ThemedText style={styles.checkboxMark}>✓</ThemedText> : null}
                  </Pressable>
                  <ThemedText style={[styles.exerciseTitle, { color: textColor }]}>
                    {ex.title?.trim() ? ex.title : `Übung ${index + 1}`}
                  </ThemedText>
                  <View style={styles.exerciseActions}>
                    {!trainingMode ? (
                      <>
                        <Pressable
                          style={[styles.arrowButton, index === 0 ? styles.arrowDisabled : null]}
                          onPress={() => moveExercise(index, -1)}
                          disabled={index === 0}
                        >
                          <ThemedText style={styles.arrowText}>↑</ThemedText>
                        </Pressable>
                        <Pressable
                          style={[styles.arrowButton, index === (game.exercises ?? []).length - 1 ? styles.arrowDisabled : null]}
                          onPress={() => moveExercise(index, 1)}
                          disabled={index === (game.exercises ?? []).length - 1}
                        >
                          <ThemedText style={styles.arrowText}>↓</ThemedText>
                        </Pressable>
                      </>
                    ) : null}
                    <View style={styles.durationBadge}>
                      <ThemedText style={[styles.durationText, { color: mutedText }]}>
                        {activeExerciseId === ex.id && isRunning
                          ? `${Math.floor(remainingSeconds / 60)
                              .toString()
                              .padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`
                          : ex.durationMinutes
                          ? `${ex.durationMinutes} min`
                          : '—'}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                <ThemedText style={[styles.value, styles.preWrap, { color: textColor }]}>
                  {ex.description?.trim() ? ex.description : '—'}
                </ThemedText>
              </View>
            ))}
            {(game.exercises ?? []).length === 0 ? (
              <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                <ThemedText style={[styles.value, { color: textColor }]}>
                  Noch keine Übungen für dieses Spiel erstellt.
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoText: {
    fontSize: 34,
  },
  title: {
    textAlign: 'center',
    fontFamily: Fonts.serif,
    fontSize: 28,
  },
  rule: {
    height: 1,
    backgroundColor: '#2a3348',
    opacity: 0.7,
    marginVertical: 8,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
  },
  tabsSticky: {
    paddingVertical: 8,
    backgroundColor: '#0f172a',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  tabInactive: {
    backgroundColor: 'transparent',
    borderColor: '#2a3348',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  value: {
    fontSize: 16,
    lineHeight: 22,
  },
  preWrap: {
    whiteSpace: 'pre-wrap',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  section: {
    gap: 8,
  },
  trainingHeader: {
    gap: 8,
  },
  trainingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trainingControls: {
    gap: 8,
  },
  editLink: {
    paddingVertical: 4,
  },
  editLinkText: {
    fontWeight: '600',
    fontSize: 12,
  },
  mainButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  mainBlue: {
    backgroundColor: '#3b82f6',
  },
  mainOrange: {
    backgroundColor: '#f59e0b',
  },
  mainGreen: {
    backgroundColor: '#22c55e',
  },
  mainButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  autoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resetLink: {
    paddingVertical: 4,
  },
  resetText: {
    fontSize: 12,
  },
  editButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editButtonText: {
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    textAlign: 'right',
  },
  list: {
    gap: 14,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'baseline',
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  arrowButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a3348',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  arrowDisabled: {
    opacity: 0.4,
  },
  arrowText: {
    color: 'white',
    fontWeight: '700',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxUnchecked: {
    borderWidth: 1,
    borderColor: '#64748b',
  },
  checkboxChecked: {
    backgroundColor: '#22c55e',
  },
  checkboxMark: {
    color: 'white',
    fontWeight: '700',
  },
  durationBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a3348',
    backgroundColor: 'transparent',
  },
  durationText: {
    fontSize: 12,
  },
  cardCompleted: {
    opacity: 0.65,
  },
  cardActive: {
    borderColor: '#3b82f6',
  },
  cardDim: {
    opacity: 0.6,
  },
  activeGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
  },
  backLink: {
    alignSelf: 'flex-start',
    minHeight: 48,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 14,
  },
});
