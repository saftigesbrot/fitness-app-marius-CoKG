import { Stack, router, useLocalSearchParams } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function FinishedScreen() {
    const { xp, offline } = useLocalSearchParams();
    const backgroundColor = useThemeColor({}, 'background');
    const primaryColor = '#2D74DA';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.content}>
                <IconSymbol name="trophy.fill" size={100} color="#FFD700" style={{ marginBottom: 20 }} />

                <ThemedText type="title" style={styles.title}>Training Beendet!</ThemedText>

                <ThemedText style={styles.subtitle}>
                    {offline === 'true'
                        ? 'Dein Training wurde lokal gespeichert und wird gesendet sobald du online bist.'
                        : 'Du hast großartige Arbeit geleistet.'}
                </ThemedText>

                <View style={styles.xpContainer}>
                    <ThemedText style={styles.xpLabel}>Erhaltene XP</ThemedText>
                    <ThemedText type="title" style={styles.xpValue}>
                        {offline === 'true' ? '?' : `+${xp || 0}`}
                    </ThemedText>
                    {offline === 'true' && <ThemedText style={{ color: '#aaa', fontSize: 10, marginTop: 5 }}>Wird berechnet...</ThemedText>}
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: primaryColor }]}
                    onPress={() => router.dismissTo('/')}
                >
                    <ThemedText style={styles.buttonText}>Zurück zum Home</ThemedText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 40 },

    xpContainer: {
        backgroundColor: '#333',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 50,
        width: '80%'
    },
    xpLabel: { color: '#aaa', fontSize: 14, marginBottom: 5, textTransform: 'uppercase' },
    xpValue: { fontSize: 48, color: '#FFD700', fontWeight: 'bold' },

    button: {
        width: '100%',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
