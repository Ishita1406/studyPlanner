import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard'; // Assuming path
import SessionFeedbackModal from '../components/SessionFeedbackModal';

const StudySessionScreen = () => {
    const router = useRouter();
    // params: { topicId, topicName, subjectName }
    const params = useLocalSearchParams();

    // Timer state
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<any>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Start timer automatically on mount? Or wait for user?
        // Let's wait for user to press play, or start immediately.
        // Let's start immediately for ease, but paused logic is available.
        setIsActive(true);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else if (!isActive && timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFinish = () => {
        setIsActive(false);
        if (seconds < 60) {
            Alert.alert("Session too short", "Session must be at least 1 minute to log.");
            return;
        }
        setShowModal(true);
    };

    const handleQuit = () => {
        Alert.alert(
            "Quit Session?",
            "Progress will be lost.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Quit", style: "destructive", onPress: () => router.back() }
            ]
        );
    };

    const handleSessionLogged = () => {
        router.back();
    };

    return (
        <MobileCard
            title="Study Session"
            backgroundColor="#F5F3FF"
            headerLeft={
                <TouchableOpacity onPress={handleQuit}>
                    <Feather name="x" size={24} color="#9D96E1" />
                </TouchableOpacity>
            }
        >
            <View style={styles.container}>
                <View style={styles.topicHeader}>
                    <View style={styles.iconCircle}>
                        <Feather name="book-open" size={24} color="#9D96E1" />
                    </View>
                    <Text style={styles.subjectText}>{params.subjectName || 'Subject'}</Text>
                    <Text style={styles.topicText}>{params.topicName || 'Topic Name'}</Text>
                </View>

                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>{formatTime(seconds)}</Text>
                    <Text style={styles.timerLabel}>elapsed time</Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[styles.controlButton, { backgroundColor: isActive ? '#F8A4B3' : '#67C7A6' }]}
                        onPress={toggleTimer}
                    >
                        <Feather name={isActive ? "pause" : "play"} size={32} color="#fff" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                    <Text style={styles.finishText}>Finish Session</Text>
                    <Feather name="check-circle" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <SessionFeedbackModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSubmitSuccess={handleSessionLogged}
                sessionData={{
                    topicId: params.topicId as string,
                    topicName: params.topicName as string,
                    durationMinutes: Math.floor(seconds / 60)
                }}
            />
        </MobileCard>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 32,
    },
    topicHeader: {
        alignItems: 'center',
        gap: 8,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: '#9D96E1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    subjectText: {
        fontSize: 14,
        color: '#9D96E1',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    topicText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#5C5C8E',
        textAlign: 'center',
    },
    timerContainer: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 64,
        fontWeight: '200',
        color: '#5C5C8E',
        fontVariant: ['tabular-nums'],
    },
    timerLabel: {
        fontSize: 14,
        color: '#A0A0C0',
    },
    controls: {
        flexDirection: 'row',
        gap: 24,
    },
    controlButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    finishButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#9D96E1',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 32,
        gap: 8,
        width: '100%',
        justifyContent: 'center',
    },
    finishText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default StudySessionScreen;
