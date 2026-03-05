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
        const score = value;
        
        // At 2000 points, show a golden crown icon
        if (score >= 2000) {
            return (
                <View style={{
                    width: size,
                    height: size,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <IconSymbol
                        name="crown.fill"
                        size={size * 0.9}
                        color="#FFD700"
                    />
                </View>
            );
        }
        
        // Neutral zone around 1000 points (950-1050) - show blue diamond
        if (score >= 950 && score <= 1050) {
            return (
                <View style={{
                    width: size,
                    height: size,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <View style={{ transform: [{ rotate: '45deg' }] }}>
                        <IconSymbol
                            name="diamond.fill"
                            size={size * 0.5}
                            color="#2D74DA"
                        />
                    </View>
                </View>
            );
        }
        
        // Score mode: show UP/DOWN triangle with solid colors (no intensity variation)
        const isAboveBalance = score > 1050;
        
        // Use larger triangle icons
        const iconSize = size * 1.2;
        
        // Solid colors - Green for up, Red for down
        const iconColor = isAboveBalance 
            ? '#4CD964' // Green for UP (above neutral zone)
            : '#FF3B30'; // Red for DOWN (below neutral zone)
        
        // Simple container - just show the icon
        return (
            <View style={{
                width: size,
                height: size,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <IconSymbol
                    name={isAboveBalance ? 'arrow.up.wide' : 'arrow.down.wide'}
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
