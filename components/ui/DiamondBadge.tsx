import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from './icon-symbol';

interface DiamondBadgeProps {
    value: string | number;
    color?: string;
    size?: number;
    scoreMode?: boolean; // If true, interprets value as score (0-2000) and shows UP/DOWN icon
}

export function DiamondBadge({ value, color = '#FFD700', size = 50, scoreMode = false }: DiamondBadgeProps) {
    if (scoreMode && typeof value === 'number') {
        // Score mode: show UP/DOWN icon based on score value (NO DIAMOND)
        const score = value;
        const isAboveBalance = score > 1000;
        
        // Calculate intensity based on distance from balance point (1000)
        // Closer to edges (0 or 2000) = more intense glow
        let intensity: number;
        if (isAboveBalance) {
            // Above 1000: calculate distance to 2000
            // 1000 -> 2000: intensity from 0.4 to 1.0
            intensity = 0.4 + ((score - 1000) / 1000) * 0.6;
        } else {
            // Below 1000: calculate distance to 0
            // 1000 -> 0: intensity from 0.4 to 1.0
            intensity = 0.4 + ((1000 - score) / 1000) * 0.6;
        }
        
        // Icon size is CONSTANT - only color intensity varies
        const iconSize = size * 0.7;
        
        // Color based on direction with varying intensity
        const iconColor = isAboveBalance 
            ? `rgba(0, 122, 255, ${intensity})` // Blue for UP
            : `rgba(255, 59, 48, ${intensity})`; // Red for DOWN
        
        // Simple container without diamond rotation - just show the icon
        return (
            <View style={{
                width: size,
                height: size,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <IconSymbol
                    name={isAboveBalance ? 'arrow.up' : 'arrow.down'}
                    size={iconSize}
                    color={iconColor}
                />
            </View>
        );
    }
    
    // Number mode: show the value as text in diamond shape
    return (
        <View style={[styles.container, { 
            width: size, 
            height: size,
            borderColor: color,
        }]}>
            <ThemedText style={[styles.text, { 
                fontSize: size * 0.35,
                color: color,
            }]}>
                {value}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        transform: [{ rotate: '45deg' }],
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    text: {
        transform: [{ rotate: '-45deg' }],
        fontWeight: 'bold',
    },
});
