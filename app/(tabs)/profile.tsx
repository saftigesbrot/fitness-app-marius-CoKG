import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSession } from '@/context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { signOut, session, username: contextUsername } = useSession();
    const [username, setUsername] = useState<string>('User');

    useEffect(() => {
        if (contextUsername) {
            setUsername(contextUsername);
        } else if (session) {
            try {
                const decoded: any = jwtDecode(session);
                if (decoded.username) {
                    setUsername(decoded.username);
                } else if (decoded.user_id) {
                    setUsername(`User #${decoded.user_id}`);
                }
            } catch (e) {
                // Token decoding failed, likely invalid token. 
                // We silently ignore this as the username will just default to 'User'
            }
        }
    }, [session, contextUsername]);

    const handleLogout = () => {
        if (typeof window !== 'undefined' && Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to log out?")) {
                signOut();
            }
        } else {
            Alert.alert(
                "Logout",
                "Are you sure you want to log out?",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Logout",
                        style: "destructive",
                        onPress: () => {
                            signOut();
                        }
                    }
                ]
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <IconSymbol name="person.fill" size={60} color="#fff" />
                </View>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.email}>Hello, welcome back!</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color="#FF3B30" />
                    <Text style={[styles.menuText, { color: '#FF3B30' }]}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f7',
    },
    header: {
        backgroundColor: '#fff',
        padding: 32,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5ea',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#007AFF', // Brand color
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#8e8e93',
    },
    content: {
        marginTop: 32,
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    menuText: {
        flex: 1,
        fontSize: 17,
        fontWeight: '500',
        marginLeft: 12,
    },
});
