import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getProgressColor, getLevelColor } from '@/utils/colors';

interface CircularProgressProps {
    size: number;
    strokeWidth: number;
    progress: number; // 0 to 1
    color?: string;
    trackColor?: string;
    children?: React.ReactNode;
    dynamicColor?: boolean; // If true, color changes based on progress
    progressType?: 'level' | 'points'; // Type of progress (level uses blue, points uses red-yellow-green)
}

export function CircularProgress({
    size,
    strokeWidth,
    progress,
    color,
    trackColor = '#333',
    children,
    dynamicColor = false,
    progressType = 'points',
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    
    let finalColor: string;
    if (dynamicColor) {
        // Use appropriate color function based on progressType
        finalColor = progressType === 'level' ? getLevelColor(clampedProgress) : getProgressColor(clampedProgress);
    } else {
        finalColor = color || '#4CD964';
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
        outputRange: [4, 12],
    });

    const strokeDashoffset = circumference * (1 - clampedProgress);
    const strokeLinecap = clampedProgress >= 1 ? 'butt' : 'round';

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            {/* Glow Effect */}
            {isGold && (
                <Animated.View
                    style={{
                        width: size,
                        height: size,
                        borderRadius: radius,
                        position: 'absolute',
                        opacity: glowOpacity,
                        shadowColor: '#FFD700',
                        shadowRadius: glowSize,
                        shadowOpacity: 1,
                        shadowOffset: { width: 0, height: 0 },
                        backgroundColor: 'transparent',
                    }}
                />
            )}
            
            {/* Track */}
            <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={finalColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap={strokeLinecap}
                    transform={`rotate(-90 ${center} ${center})`}
                />
            </Svg>

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
