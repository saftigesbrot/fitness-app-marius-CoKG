import { useCallback, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { gamesService, type ExerciseItem, type Game } from '@/services/games';
import { useThemeColor } from '@/hooks/use-theme-color';

const sanitizeText = (value: string) =>
  value.replace(/<\s*\/?\s*script[^>]*>/gi, '').trim();

export default function GameExercisesScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({ light: '#666', dark: '#9BA1A6' }, 'icon');
  const inputBg = useThemeColor({ light: '#ffffff', dark: '#1f2636' }, 'card');
  const inputBorder = useThemeColor({ light: '#c7c7cc', dark: '#3a4255' }, 'icon');

  const accentBlue = useMemo(() => '#3b82f6', []);
  const deleteColor = useMemo(() => '#ef4444', []);
  const darkBackground = useMemo(() => '#0f172a', []);
  const darkCard = useMemo(() => '#1e293b', []);
  const errorColor = useMemo(() => '#ef4444', []);

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
        setExercises(found.exercises ?? []);
      } catch {
        if (active) setLoadError('Spiel konnte nicht geladen werden.');
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  useFocusEffect(loadGame);

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        id: `ex-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: '',
        description: '',
        durationMinutes: 5,
        completed: false,
      },
    ]);
  };

  const updateExercise = (exerciseId: string, patch: Partial<ExerciseItem>) => {
    setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, ...patch } : ex)));
  };

  const removeExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };


  const hasInvalid = exercises.some((ex) => !ex.title.trim() || ex.durationMinutes <= 0);
  const canSave = !hasInvalid;

  const handleSave = async () => {
    if (!game) return;
    if (hasInvalid) {
      Alert.alert('Validation', 'Bitte Pflichtfelder ausfüllen und Dauer > 0 setzen.');
      return;
    }

    const sanitizedExercises = exercises.map((ex) => ({
      ...ex,
      title: sanitizeText(ex.title).slice(0, 50),
      description: sanitizeText(ex.description).slice(0, 500),
      durationMinutes: Math.max(1, Number(ex.durationMinutes) || 1),
    }));

    const updated = await gamesService.updateGame(game.id, {
      name: game.name,
      logo: game.logo,
      material: game.material,
      rules: game.rules,
      exercises: sanitizedExercises,
    });
    if (!updated) {
      Alert.alert('Fehler', 'Übungen konnten nicht gespeichert werden.');
      return;
    }
    router.replace(`/games/${game.id}?tab=training`);
  };

  if (loadError) {
    return (
      <View style={[styles.screen, { backgroundColor: darkBackground }]}>
        <ThemedText>{loadError}</ThemedText>
      </View>
    );
  }

  if (!game) {
    return (
      <View style={[styles.screen, { backgroundColor: darkBackground }]}>
        <ThemedText>Spiel nicht gefunden.</ThemedText>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: ExerciseItem; index: number }) => {
    const titleMissing = !item.title.trim();
    const durationInvalid = item.durationMinutes <= 0;

    return (
      <View style={[styles.card, { backgroundColor: darkCard }]}>
        <View style={styles.cardHeader}>
          <ThemedText style={styles.cardTitle}>Übung {index + 1}</ThemedText>
          <Pressable style={[styles.deleteMini, { backgroundColor: deleteColor }]} onPress={() => removeExercise(item.id)}>
            <ThemedText style={styles.deleteMiniText}>Löschen</ThemedText>
          </Pressable>
        </View>

        <ThemedText style={styles.label}>Titel *</ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: textColor, backgroundColor: inputBg, borderColor: titleMissing ? errorColor : inputBorder },
          ]}
          placeholder="z.B. Liegestütze"
          placeholderTextColor={placeholderColor}
          value={item.title}
          onChangeText={(v) => updateExercise(item.id, { title: v })}
          maxLength={50}
        />
        {titleMissing ? <ThemedText style={[styles.errorText, { color: errorColor }]}>Pflichtfeld</ThemedText> : null}

        <ThemedText style={styles.label}>Ablauf</ThemedText>
        <TextInput
          style={[styles.input, styles.multiline, { color: textColor, backgroundColor: inputBg, borderColor: inputBorder }]}
          placeholder="Kurze Beschreibung..."
          placeholderTextColor={placeholderColor}
          value={item.description}
          onChangeText={(v) => updateExercise(item.id, { description: v })}
          multiline
          maxLength={500}
        />

        <ThemedText style={styles.label}>Dauer (Min) *</ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.numberInput,
            { color: textColor, backgroundColor: inputBg, borderColor: durationInvalid ? errorColor : inputBorder },
          ]}
          placeholder="z.B. 5"
          placeholderTextColor={placeholderColor}
          keyboardType="numeric"
          value={item.durationMinutes ? String(item.durationMinutes) : ''}
          onChangeText={(v) => {
            const clean = v.replace(/[^\d]/g, '');
            const num = clean ? Number(clean) : 0;
            updateExercise(item.id, { durationMinutes: num });
          }}
        />
        {durationInvalid ? (
          <ThemedText style={[styles.errorText, { color: errorColor }]}>Bitte positive Zahl eingeben</ThemedText>
        ) : null}
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: darkBackground }]}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedText type="title" style={styles.title}>
        Übungen
      </ThemedText>
      <ThemedText style={styles.subtitle}>für {game.name}</ThemedText>

      <View style={styles.list}>
        {exercises.map((item, index) => (
          <View key={item.id}>{renderItem({ item, index })}</View>
        ))}
      </View>

      <TouchableOpacity style={[styles.addButton, { borderColor: accentBlue }]} onPress={addExercise}>
        <ThemedText style={[styles.addButtonText, { color: accentBlue }]}>+ Übung hinzufügen</ThemedText>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: accentBlue, opacity: canSave ? 1 : 0.5 }]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <ThemedText style={styles.buttonText}>Speichern</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryButton, { borderColor: accentBlue }]} onPress={() => router.replace(`/games/${game.id}`)}>
          <ThemedText style={[styles.secondaryButtonText, { color: accentBlue }]}>Abbrechen</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
    fontWeight: '700',
    fontSize: 16,
  },
  list: {
    gap: 12,
  },
  deleteMini: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  deleteMiniText: {
    color: 'white',
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
  },
  input: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  numberInput: {
    maxWidth: 160,
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
  },
});
