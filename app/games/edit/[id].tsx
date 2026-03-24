import { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { gamesService, type Game } from '@/services/games';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function EditGameScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [material, setMaterial] = useState('');
  const [rules, setRules] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const placeholderColor = useThemeColor({ light: '#666', dark: '#9BA1A6' }, 'icon');
  const inputBg = useThemeColor({ light: '#ffffff', dark: '#1f2636' }, 'card');
  const inputBorder = useThemeColor({ light: '#c7c7cc', dark: '#3a4255' }, 'icon');

  const loadGame = useCallback(() => {
    let active = true;
    (async () => {
      if (typeof id !== 'string') return;
      const found = await gamesService.getGame(id);
      if (!active) return;
      setGame(found);
      if (found) {
        setName(found.name);
        setLogo(found.logo ?? '');
        setMaterial(found.material ?? '');
        setRules(found.rules ?? '');
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  useFocusEffect(loadGame);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Validation', 'Bitte gib einen Spielnamen ein.');
      return;
    }
    if (typeof id !== 'string') return;

    const updated = await gamesService.updateGame(id, {
      name: trimmedName,
      logo,
      material,
      rules,
    });

    if (!updated) {
      Alert.alert('Fehler', 'Spiel konnte nicht gespeichert werden.');
      return;
    }

    router.replace(`/games/${id}`);
  };

  if (!game) {
    return (
      <View style={[styles.screen, { backgroundColor }]}>
        <ThemedText>Spiel nicht gefunden.</ThemedText>
        <TouchableOpacity style={[styles.button, { backgroundColor: primaryColor, marginTop: 12 }]} onPress={() => router.replace('/games')}>
          <ThemedText style={styles.buttonText}>Zurück zur Liste</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor }]}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedText type="title" style={styles.title}>
        Spiel bearbeiten
      </ThemedText>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <ThemedText type="subtitle" style={styles.label}>
          Spielname
        </ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor: inputBorder }]}
          placeholder="Spielname eingeben..."
          placeholderTextColor={placeholderColor}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <ThemedText type="subtitle" style={styles.label}>
          Logo (Emoji)
        </ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor: inputBorder }]}
          placeholder="z.B. 👑 ⚽ 🎲"
          placeholderTextColor={placeholderColor}
          value={logo}
          onChangeText={setLogo}
          autoCapitalize="none"
        />

        <ThemedText type="subtitle" style={styles.label}>
          Material
        </ThemedText>
        <TextInput
          style={[styles.input, styles.multiline, { color: textColor, backgroundColor: inputBg, borderColor: inputBorder }]}
          placeholder="z.B. Ball, Hütchen, Stoppuhr"
          placeholderTextColor={placeholderColor}
          value={material}
          onChangeText={setMaterial}
          multiline
        />

        <ThemedText type="subtitle" style={styles.label}>
          Regeln
        </ThemedText>
        <TextInput
          style={[styles.input, styles.multiline, { color: textColor, backgroundColor: inputBg, borderColor: inputBorder }]}
          placeholder="Kurze Regeln in wenigen Sätzen..."
          placeholderTextColor={placeholderColor}
          value={rules}
          onChangeText={setRules}
          multiline
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button, { backgroundColor: primaryColor }]} onPress={handleSave}>
          <ThemedText style={styles.buttonText}>Speichern</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryButton, { borderColor: primaryColor }]} onPress={() => router.replace(`/games/${id}`)}>
          <ThemedText style={[styles.secondaryButtonText, { color: primaryColor }]}>Abbrechen</ThemedText>
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
    gap: 16,
  },
  title: {
    marginBottom: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  label: {
    fontSize: 14,
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
    minHeight: 80,
    textAlignVertical: 'top',
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
  actions: {
    flexDirection: 'row',
    gap: 10,
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
});
