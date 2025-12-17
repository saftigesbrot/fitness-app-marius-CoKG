import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, View, ViewProps } from 'react-native';

export type CardProps = ViewProps & {
    variant?: 'default' | 'outlined';
};

export function Card({ style, variant = 'default', ...otherProps }: CardProps) {
    const backgroundColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
    const borderColor = useThemeColor({ light: '#ccc', dark: '#333' }, 'icon');

    return (
        <View
            style={[
                styles.card,
                { backgroundColor },
                variant === 'outlined' && { borderWidth: 1, borderColor, backgroundColor: 'transparent' },
                style,
            ]}
            {...otherProps}
        />
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
});
