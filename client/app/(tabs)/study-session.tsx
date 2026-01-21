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
import MobileCard from '../components/MobileCard';
import SessionFeedbackModal from '../components/SessionFeedbackModal';

const StudySessionScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const timerRef = useRef<any>(null);

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
    };

    const handleFinish = () => {
        setIsActive(false);
        if (seconds < 60) {
            Alert.alert("Session too short", "Minimum 1 minute required.");
            return;
        }
        setShowModal(true);
    };

    const handleQuit = () => {
        console.log("clicked");

        Alert.alert(
            "Quit Session?",
            "Progress will be saved, but the topic will remain in your plan.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Quit",
                    style: "destructive",
                    onPress: async () => {
                        if (timerRef.current) clearInterval(timerRef.current);

                        try {
                            const durationMinutes = Math.floor(seconds / 60);
                            await import('../../api/session').then(m => m.logSession({
                                topicId: params.topicId as string,
                                durationMinutes: durationMinutes > 0 ? durationMinutes : 1, // Log at least 1 min
                            }));
                        } catch (error) {
                            console.error("Failed to log partial session", error);
                        }

                        router.replace({
                            pathname: '/(tabs)',
                            params: { refresh: 'true' },
                        });
                    },
                },
            ]
        );
    };

    const handleSessionLogged = () => {
        router.replace({
            pathname: '/(tabs)',
            params: { refresh: 'true' },
        });
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
                <Text style={styles.subjectText}>{params.subjectName}</Text>
                <Text style={styles.topicText}>{params.topicName}</Text>

                <Text style={styles.timerText}>{formatTime(seconds)}</Text>

                <TouchableOpacity
                    style={styles.finishButton}
                    onPress={handleFinish}
                >
                    <Text style={styles.finishText}>Finish Session</Text>
                </TouchableOpacity>
            </View>

            <SessionFeedbackModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSubmitSuccess={handleSessionLogged}
                sessionData={{
                    topicId: params.topicId as string,
                    topicName: params.topicName as string,
                    durationMinutes: Math.floor(seconds / 60),
                }}
            />
        </MobileCard>
    );
};

export default StudySessionScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 32,
        paddingVertical: 20,
    },
    subjectText: {
        fontSize: 14,
        color: '#9D96E1',
        fontWeight: '600',
    },
    topicText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#5C5C8E',
        textAlign: 'center',
    },
    timerText: {
        fontSize: 64,
        fontWeight: '200',
        color: '#5C5C8E',
    },
    finishButton: {
        backgroundColor: '#9D96E1',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 32,
    },
    finishText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
