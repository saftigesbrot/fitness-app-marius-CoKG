import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSession } from '../../context/AuthContext';
import api from '../../services/api';

export default function SignIn() {
    const { signIn } = useSession();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            if (Platform.OS === 'web') {
                window.alert('Bitte füllen Sie alle Felder aus.');
            } else {
                Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus.');
            }
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/api/token/', {
                username,
                password,
            });

            const { access, refresh } = response.data;
            signIn(access, refresh, username);
            router.replace('/');
        } catch (error: any) {
            let errorMessage = 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.';

            if (error.response?.status === 401) {
                errorMessage = 'Ungültiger Benutzername oder Passwort.';
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }

            if (Platform.OS === 'web') {
                window.alert(errorMessage);
            } else {
                Alert.alert('Anmeldung fehlgeschlagen', errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholder="Enter your username"
                    placeholderTextColor="#666"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Enter your password"
                    placeholderTextColor="#666"
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => router.push('/(auth)/sign-up')}
                >
                    <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
        color: '#333',
    },
    form: {
        gap: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#007AFF',
        fontSize: 16,
    }
});
