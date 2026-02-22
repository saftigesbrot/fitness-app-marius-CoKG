import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './themed-text';
import { useOfflineMutation } from '@/context/OfflineMutationContext';

export function OfflineIndicator() {
    const { isOnline } = useOfflineMutation();
    const insets = useSafeAreaInsets();

    if (isOnline) return null;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ThemedText style={styles.text}>Offline Modus - Änderungen werden lokal gespeichert</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#b52d2d', // Dark red
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 8,
        paddingHorizontal: 10,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
    },
    text: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
