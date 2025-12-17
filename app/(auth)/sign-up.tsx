import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSession } from '../../context/AuthContext';
import api from '../../services/api';

export default function SignUp() {
    const { signIn } = useSession();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(''); // Assuming email is standard often
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !email || !password) {
            if (Platform.OS === 'web') {
                window.alert('Bitte füllen Sie alle Felder aus.');
            } else {
                Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus.');
            }
            return;
        }

        setLoading(true);
        try {
            // NOTE: Endpoint is assumed based on plan. Adjust if backend differs.
            await api.post('/api/register/', {
                username,
                email,
                password,
            });

            // Auto-login after successful registration
            const loginResponse = await api.post('/api/token/', {
                username,
                password,
            });

            const { access, refresh } = loginResponse.data;
            signIn(access, refresh, username);
            router.replace('/');
        } catch (error: any) {
            let errorMessage = 'Das Konto konnte nicht erstellt werden. Bitte versuchen Sie es erneut.';

            if (error.response?.data) {
                // If the backend returns structured validation errors (e.g. { username: ["Exists"] })
                try {
                    const data = error.response.data;
                    if (typeof data === 'object') {
                        const messages: string[] = [];

                        // Helper to translate keys
                        const getLabel = (key: string) => {
                            switch (key) {
                                case 'username': return 'Benutzername';
                                case 'email': return 'E-Mail';
                                case 'password': return 'Passwort';
                                default: return key;
                            }
                        };

                        Object.entries(data).forEach(([key, value]) => {
                            const label = getLabel(key);
                            let text = Array.isArray(value) ? value.join(', ') : String(value);

                            // Basic translation of common backend errors
                            if (text.includes('already exists')) {
                                text = 'existiert bereits.';
                            } else if (text.includes('required')) {
                                text = 'ist erforderlich.';
                            }

                            messages.push(`${label}: ${text}`);
                        });

                        if (messages.length > 0) {
                            errorMessage = messages.join('\n');
                        }
                    } else if (typeof data === 'string') {
                        errorMessage = data;
                    }
                } catch (e) {
                    // Ignore parsing error
                }
            }

            if (Platform.OS === 'web') {
                window.alert(errorMessage);
            } else {
                Alert.alert('Registrierung fehlgeschlagen', errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholder="Choose a username"
                    placeholderTextColor="#666"
                    autoComplete="username"
                    textContentType="username"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor="#666"
                    autoComplete="email"
                    textContentType="emailAddress"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Choose a password"
                    placeholderTextColor="#666"
                    autoComplete="new-password"
                    textContentType="newPassword"
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.linkText}>Already have an account? Sign In</Text>
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
        backgroundColor: '#28a745', // Green for register
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#28a745',
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
