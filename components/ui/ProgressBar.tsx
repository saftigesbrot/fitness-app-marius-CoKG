import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, View, Animated } from 'react-native';
import { getProgressColor, getLevelColor } from '@/utils/colors';
import { useEffect, useRef } from 'react';

type ProgressBarProps = {
    progress: number; // 0 to 1
    color?: string;
    height?: number;
    dynamicColor?: boolean; // If true, color changes based on progress
    progressType?: 'level' | 'points'; // Type of progress (level uses blue, points uses red-yellow-green)
};

export function ProgressBar({ progress, color, height = 8, dynamicColor = false, progressType = 'points' }: ProgressBarProps) {
    const backgroundColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'background');
    const defaultColor = useThemeColor({}, 'tint');

    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    
    let itemsColor: string;
    if (dynamicColor) {
        // Use appropriate color function based on progressType
        itemsColor = progressType === 'level' ? getLevelColor(clampedProgress) : getProgressColor(clampedProgress);
    } else {
        itemsColor = color || defaultColor;
    }

    // Glow animation for gold (at 100% points)
    const glowAnim = useRef(new Animated.Value(0)).current;
    const isGold = clampedProgress >= 1.0 && progressType === 'points';

    useEffect(() => {
        if (isGold) {
            // Create a continuous glow effect
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        } else {
            glowAnim.setValue(0);
        }
    }, [isGold, glowAnim]);

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
    });

    const glowSize = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 8],
    });

    return (
        <View style={[styles.container, { height, backgroundColor }]}>
            {isGold && (
                <Animated.View
                    style={[
                        styles.glowEffect,
                        {
                            height,
                            width: `${clampedProgress * 100}%`,
                            opacity: glowOpacity,
                            shadowRadius: glowSize,
                            shadowColor: '#FFD700',
                            shadowOpacity: 1,
                            shadowOffset: { width: 0, height: 0 },
                        },
                    ]}
                />
            )}
            <View
                style={[
                    styles.fill,
                    {
                        width: `${clampedProgress * 100}%`,
                        backgroundColor: itemsColor,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 999,
        overflow: 'visible',
    },
    fill: {
        height: '100%',
        borderRadius: 999,
    },
    glowEffect: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'transparent',
    },
});
