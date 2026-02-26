import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

interface LevelUpModalProps {
    visible: boolean;
    level: number;
    onClose: () => void;
}

export function LevelUpModal({ visible, level, onClose }: LevelUpModalProps) {
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    
    const scaleAnim = React.useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [visible]);
    
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.overlay} 
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View 
                    style={[
                        styles.modalContainer,
                        { 
                            backgroundColor: cardColor,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    {/* Sparkles Background */}
                    <View style={styles.sparklesContainer}>
                        <IconSymbol name="sparkles" size={40} color="#FFD700" style={styles.sparkle1} />
                        <IconSymbol name="sparkles" size={30} color="#FF6B6B" style={styles.sparkle2} />
                        <IconSymbol name="sparkles" size={35} color="#4ECDC4" style={styles.sparkle3} />
                        <IconSymbol name="sparkles" size={25} color="#95E1D3" style={styles.sparkle4} />
                    </View>
                    
                    {/* Trophy Icon */}
                    <View style={[styles.trophyContainer, { backgroundColor: primaryColor + '20' }]}>
                        <IconSymbol name="trophy.fill" size={80} color="#FFD700" />
                    </View>
                    
                    {/* Congratulations Text */}
                    <ThemedText type="title" style={[styles.congratsText, { color: primaryColor }]}>
                        Glückwunsch! 🎉
                    </ThemedText>
                    
                    {/* Level Display */}
                    <View style={styles.levelContainer}>
                        <ThemedText style={[styles.levelLabel, { color: textColor }]}>
                            Du hast erreicht
                        </ThemedText>
                        <View style={[styles.levelBadge, { 
                            backgroundColor: primaryColor,
                            shadowColor: primaryColor,
                        }]}>
                            <ThemedText style={styles.levelText}>
                                Level {level}
                            </ThemedText>
                        </View>
                    </View>
                    
                    {/* Motivational Text */}
                    <ThemedText style={[styles.motivationText, { color: textColor }]}>
                        Weiter so! Du machst großartige Fortschritte! 💪
                    </ThemedText>
                    
                    {/* Close Hint */}
                    <ThemedText style={styles.closeHint}>
                        Tippe irgendwo um fortzufahren
                    </ThemedText>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContainer: {
        width: '85%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    sparklesContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    sparkle1: {
        position: 'absolute',
        top: 20,
        left: 20,
        opacity: 0.8,
    },
    sparkle2: {
        position: 'absolute',
        top: 30,
        right: 30,
        opacity: 0.7,
    },
    sparkle3: {
        position: 'absolute',
        bottom: 80,
        left: 30,
        opacity: 0.6,
    },
    sparkle4: {
        position: 'absolute',
        bottom: 70,
        right: 25,
        opacity: 0.7,
    },
    trophyContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 4,
        borderColor: '#FFD700',
    },
    congratsText: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    levelContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    levelLabel: {
        fontSize: 16,
        marginBottom: 12,
        opacity: 0.8,
    },
    levelBadge: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    levelText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    motivationText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
        opacity: 0.9,
    },
    closeHint: {
        fontSize: 12,
        color: '#888',
        marginTop: 24,
        opacity: 0.7,
    },
});
