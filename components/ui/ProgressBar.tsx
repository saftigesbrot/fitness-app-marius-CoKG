import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, View } from 'react-native';

type ProgressBarProps = {
    progress: number; // 0 to 1
    color?: string;
    height?: number;
};

export function ProgressBar({ progress, color, height = 8 }: ProgressBarProps) {
    const backgroundColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon'); // Using icon color as track background
    const itemsColor = color || useThemeColor({}, 'tint');

    const clampedProgress = Math.min(Math.max(progress, 0), 1);

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
