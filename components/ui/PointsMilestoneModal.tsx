import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

interface PointsMilestoneModalProps {
    visible: boolean;
    points: number;
    onClose: () => void;
}

export function PointsMilestoneModal({ visible, points, onClose }: PointsMilestoneModalProps) {
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
    
    // Determine milestone type and content
    const getMilestoneContent = () => {
        if (points >= 2000) {
            return {
                icon: 'crown.fill' as const,
                iconColor: '#FFD700',
                title: 'Unglaublich!',
                subtitle: '2000 Punkte erreicht! 👑',
                message: 'Du hast die Spitze erreicht! Du bist ein wahrer Champion! Halte diesen beeindruckenden Stand und inspiriere andere! 💪✨',
                emoji: '🏆',
                bgColor: '#FFD700'
            };
        } else if (points >= 1500) {
            return {
                icon: 'star.fill' as const,
                iconColor: '#4CAF50',
                title: 'Guter Job!',
                subtitle: '1500 Punkte erreicht! 🎯',
                message: 'Fantastische Leistung! Du bist auf dem besten Weg zur Spitze. Weiter so! 💚',
                emoji: '🌟',
                bgColor: '#4CAF50'
            };
        } else {
            return {
                icon: 'heart.fill' as const,
                iconColor: '#FF9800',
                title: 'Nicht aufgeben!',
                subtitle: '500 Punkte unterschritten 😔',
                message: 'Jeder hat mal einen schwachen Moment. Das ist okay! Morgen ist ein neuer Tag - du schaffst das! 💙',
                emoji: '💪',
                bgColor: '#FF9800'
            };
        }
    };
    
    const content = getMilestoneContent();
    
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
                        <IconSymbol name="sparkles" size={35} color={content.bgColor} style={styles.sparkle1} />
                        <IconSymbol name="sparkles" size={25} color={content.bgColor} style={styles.sparkle2} />
                        <IconSymbol name="sparkles" size={30} color={content.bgColor} style={styles.sparkle3} />
                        <IconSymbol name="sparkles" size={28} color={content.bgColor} style={styles.sparkle4} />
                    </View>
                    
                    {/* Icon */}
                    <View style={[styles.iconContainer, { 
                        backgroundColor: content.iconColor + '20',
                        borderColor: content.iconColor
                    }]}>
                        <IconSymbol name={content.icon} size={80} color={content.iconColor} />
                    </View>
                    
                    {/* Title Text */}
                    <View style={styles.titleContainer}>
                        <ThemedText style={styles.titleEmoji}>{content.emoji}</ThemedText>
                        <ThemedText type="title" style={[styles.titleText, { color: content.bgColor }]}>
                            {content.title}
                        </ThemedText>
                        <ThemedText style={styles.titleEmoji}>{content.emoji}</ThemedText>
                    </View>
                    
                    {/* Subtitle */}
                    <ThemedText style={[styles.subtitle, { color: textColor }]}>
                        {content.subtitle}
                    </ThemedText>
                    
                    {/* Message */}
                    <ThemedText style={[styles.message, { color: textColor }]}>
                        {content.message}
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
        opacity: 0.7,
    },
    sparkle2: {
        position: 'absolute',
        top: 30,
        right: 30,
        opacity: 0.6,
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
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 4,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        gap: 12,
    },
    titleEmoji: {
        fontSize: 28,
    },
    titleText: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
        opacity: 0.9,
        paddingHorizontal: 10,
    },
    closeHint: {
        fontSize: 12,
        color: '#888',
        marginTop: 24,
        opacity: 0.7,
    },
});
