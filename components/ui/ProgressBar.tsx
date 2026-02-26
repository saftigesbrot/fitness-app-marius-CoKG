import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, View } from 'react-native';
import { getProgressColor } from '@/utils/colors';

type ProgressBarProps = {
    progress: number; // 0 to 1
    color?: string;
    height?: number;
    dynamicColor?: boolean; // If true, color changes based on progress
};

export function ProgressBar({ progress, color, height = 8, dynamicColor = false }: ProgressBarProps) {
    const backgroundColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'background');
    const defaultColor = useThemeColor({}, 'tint');

    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const itemsColor = dynamicColor ? getProgressColor(clampedProgress) : (color || defaultColor);

    return (
        <View style={[styles.container, { height, backgroundColor }]}>
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
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 999,
    },
});
