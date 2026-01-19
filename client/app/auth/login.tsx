import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';
import { useRouter } from 'expo-router';
import { login } from '../../api/auth';

const LoginScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        console.log("Login button pressed");
        if (!email || !password) {
            console.log("Missing fields");
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            console.log("Calling auth.login with", email);
            await login(email, password);
            console.log("Login successful, navigating");
            router.replace('/(tabs)');
        } catch (error) {
            console.error("Login component error:", error);
            Alert.alert('Login Failed', error as string);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileCard title="Welcome Back" backgroundColor="#F5F3FF">
            <View style={styles.centered}>
                <View style={styles.iconWrapper}>
                    <Feather name="user" size={40} color="#9D96E1" />
                </View>
            </View>

            <View style={styles.spaceY4}>
                <View style={styles.inputContainer}>
                    <Feather name="mail" size={20} color="#9D96E1" style={styles.inputIcon} />
                    <TextInput
                        placeholder="Email Address"
                        style={styles.input}
                        placeholderTextColor="#A0A0C0"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="#9D96E1" style={styles.inputIcon} />
                    <TextInput
                        placeholder="Password"
                        style={styles.input}
                        placeholderTextColor="#A0A0C0"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.mainButton}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.mainButtonText}>Log In</Text>
                        <Feather name="arrow-right" size={20} color="#fff" />
                    </>
                )}
            </TouchableOpacity>

            <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                    Don&apos;t have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                    <Text style={styles.toggleButtonText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </MobileCard>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    centered: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#9D96E1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    spaceY4: {
        gap: 16,
    },
    inputContainer: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        top: 16,
        zIndex: 1,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        paddingLeft: 48,
        color: '#5C5C8E',
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#E0E0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    forgotPassword: {
        alignItems: 'flex-end',
    },
    forgotPasswordText: {
        color: '#9D96E1',
        fontSize: 12,
        fontWeight: '600',
    },
    mainButton: {
        backgroundColor: '#9D96E1',
        paddingVertical: 16,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 32,
        shadowColor: '#9D96E1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    mainButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        marginTop: 24,
    },
    toggleText: {
        color: '#6B7280',
        fontSize: 14,
    },
    toggleButtonText: {
        color: '#F8A4B3',
        fontWeight: '700',
        fontSize: 14,
    },
});
