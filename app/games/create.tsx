import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { gamesService } from '@/services/games';
import { useThemeColor } from '@/hooks/use-theme-color';

const sanitizeText = (value: string) =>
  value.replace(/<\s*\/?\s*script[^>]*>/gi, '').trim();

export default function CreateGameScreen() {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [material, setMaterial] = useState('');
  const [rules, setRules] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const router = useRouter();

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const placeholderColor = useThemeColor({ light: '#666', dark: '#9BA1A6' }, 'icon');
  const inputBg = useThemeColor({ light: '#ffffff', dark: '#1f2636' }, 'card');
  const inputBorder = useThemeColor({ light: '#c7c7cc', dark: '#3a4255' }, 'icon');
  const errorColor = '#ef4444';

  const nameMissing = !name.trim();
  const canSave = !nameMissing && !createdId;
  const hasDraft = name.trim() || material.trim() || rules.trim() || logo.trim();

  const handleCreate = async () => {
    const trimmedName = sanitizeText(name);
    if (!trimmedName) {
      Alert.alert('Validation', 'Bitte gib einen Spielnamen ein.');
      return;
    }

    try {
      const created = await gamesService.addGame({
        name: trimmedName,
        logo: sanitizeText(logo),
        material: sanitizeText(material),
        rules: sanitizeText(rules),
      });
      setCreatedId(created.id);
      router.replace(`/games/${created.id}`);
    } catch {
      Alert.alert('Fehler', 'Spiel konnte nicht gespeichert werden.');
    }
  };

  const handlePlanExercises = async () => {
    const trimmedName = sanitizeText(name);
    if (!trimmedName) {
      Alert.alert('Validation', 'Bitte gib zuerst einen Spielnamen ein.');
      return;
    }

    try {
      if (createdId) {
        router.replace(`/games/${createdId}/exercises`);
        return;
      }
      const created = await gamesService.addGame({
        name: trimmedName,
        logo: sanitizeText(logo),
        material: sanitizeText(material),
        rules: sanitizeText(rules),
      });
      setCreatedId(created.id);
      router.replace(`/games/${created.id}/exercises`);
    } catch {
      Alert.alert('Fehler', 'Spiel konnte nicht gespeichert werden.');
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor }]}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedText type="title" style={styles.title}>
        Spiel erstellen
      </ThemedText>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <ThemedText type="subtitle" style={styles.label}>
          Spielname
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            { color: textColor, backgroundColor: inputBg, borderColor: nameMissing ? errorColor : inputBorder },
          ]}
          placeholder="Spielname eingeben..."
          placeholderTextColor={placeholderColor}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          maxLength={50}
        />
        {nameMissing ? <ThemedText style={[styles.errorText, { color: errorColor }]}>Pflichtfeld</ThemedText> : null}

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
          maxLength={10}
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
          maxLength={200}
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
          maxLength={500}
        />

        <View style={styles.sectionDivider} />
        <ThemedText type="subtitle" style={styles.label}>
          Übungen hinzufügen (optional)
        </ThemedText>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: primaryColor, opacity: hasDraft ? 1 : 0.6 }]}
          onPress={handlePlanExercises}
        >
          <ThemedText style={[styles.secondaryButtonText, { color: primaryColor }]}>
            + Übungen für dieses Spiel planen
          </ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: primaryColor, opacity: canSave ? 1 : 0.5 }]}
        onPress={handleCreate}
        disabled={!canSave}
      >
        <ThemedText style={styles.buttonText}>Erstellen</ThemedText>
      </TouchableOpacity>
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
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#2a3348',
    marginVertical: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
});
