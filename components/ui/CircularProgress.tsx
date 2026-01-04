import React from 'react';
import { StyleSheet, View } from 'react-native';

interface CircularProgressProps {
    size: number;
    strokeWidth: number;
    progress: number; // 0 to 1
    color: string;
    trackColor?: string;
    children?: React.ReactNode;
}

export function CircularProgress({
    size,
    strokeWidth,
    progress,
    color,
    trackColor = '#333',
    children,
}: CircularProgressProps) {
    const radius = size / 2;
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const degrees = clampedProgress * 360;

    const renderHalf = (isLeft: boolean) => {
        const rotateValue = isLeft
            ? Math.max(0, degrees - 180)
            : Math.min(180, degrees);

        return (
            <View
                style={{
                    width: size / 2,
                    height: size,
                    overflow: 'hidden',
                    position: 'absolute',
                    left: isLeft ? 0 : size / 2,
                }}
            >
                <View
                    style={{
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: strokeWidth,
                        borderColor: color,
                        position: 'absolute',
                        left: isLeft ? 0 : -size / 2,
                        transform: [
                            { rotate: `${(isLeft ? 45 : -135) + rotateValue}deg` },
                        ],
                        // Only show the relevant half based on rotation
                        borderBottomColor: 'transparent',
                        borderLeftColor: 'transparent',
                    }}
                />
            </View>
        );
    };

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            {/* Track */}
            <View
                style={{
                    width: size,
                    height: size,
                    borderRadius: radius,
                    borderWidth: strokeWidth,
                    borderColor: trackColor,
                    position: 'absolute',
                }}
            />

            {/* Progress Halves */}
            {renderHalf(false)}
            {renderHalf(true)}

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
