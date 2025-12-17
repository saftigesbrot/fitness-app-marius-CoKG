import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, View } from 'react-native';

export type BadgeProps = {
    label: string;
    color?: string;
    textColor?: string;
};

export function Badge({ label, color, textColor }: BadgeProps) {
    const backgroundColor = color || useThemeColor({}, 'tint');
    const text = textColor || '#fff';

    return (
        <View style={[styles.badge, { backgroundColor }]}>
            <Text style={[styles.label, { color: text }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});
