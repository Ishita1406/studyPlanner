import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { logSession } from '../../api/session';
import { getSessionFeedback } from '../../api/ai';

interface SessionFeedbackModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmitSuccess: () => void;
    sessionData: {
        topicId: string;
        topicName: string;
        durationMinutes: number;
    };
}

const SessionFeedbackModal = ({ visible, onClose, onSubmitSuccess, sessionData }: SessionFeedbackModalProps) => {
    const [difficulty, setDifficulty] = useState(3);
    const [focus, setFocus] = useState(3);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Log Session
            await logSession({
                topicId: sessionData.topicId,
                durationMinutes: sessionData.durationMinutes,
                difficultyRating: difficulty,
                focusRating: focus,
                notes: notes,
            });

            // 2. Get AI Feedback
            try {
                const feedbackData = await getSessionFeedback({
                    topicName: sessionData.topicName,
                    difficulty,
                    focus,
                    notes,
                    difficultyRating: difficulty, // Align with backend expectation
                    focusRating: focus
                });
                setAiFeedback(feedbackData.feedback || "Good job!");
            } catch (aiError) {
                console.log("AI Feedback failed", aiError);
                onSubmitSuccess(); // Still succeed even if AI fails
                onClose();
                return;
            }

            // Don't close immediately if we have feedback to show
            onSubmitSuccess();
        } catch (error) {
            console.error("Failed to log session:", error);
            // Optionally show alert
        } finally {
            setLoading(false);
        }
    };

    // Success View with AI Feedback
    if (aiFeedback) {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.successIcon}>
                            <Feather name="check-circle" size={48} color="#4ADE80" />
                        </View>
                        <Text style={styles.modalTitle}>Session Logged!</Text>

                        <View style={styles.aiFeedbackContainer}>
                            <View style={styles.aiHeader}>
                                <Feather name="zap" size={16} color="#9D96E1" />
                                <Text style={styles.aiLabel}>AI Tips</Text>
                            </View>
                            <Text style={styles.aiText}>{aiFeedback}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: '#4ADE80', marginTop: 24 }]}
                            onPress={onClose}
                        >
                            <Text style={styles.submitButtonText}>Awesome!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    const RatingSelector = ({ label, value, onChange, icon }: any) => (
        <View style={styles.ratingContainer}>
            <View style={styles.ratingHeader}>
                <Feather name={icon} size={16} color="#5C5C8E" />
                <Text style={styles.ratingLabel}>{label}</Text>
                <Text style={styles.ratingValue}>{value}/5</Text>
            </View>
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onChange(star)}
                        style={styles.starButton}
                    >
                        <Feather
                            name="star"
                            size={24}
                            color={star <= value ? "#FFD700" : "#E0E0F0"}
                            style={star <= value ? styles.filledStar : {}}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Session Complete!</Text>
                    <Text style={styles.modalSubtitle}>
                        You studied {sessionData.topicName} for {sessionData.durationMinutes}m.
                    </Text>

                    <View style={styles.formContainer}>
                        <RatingSelector
                            label="Difficulty"
                            icon="bar-chart-2"
                            value={difficulty}
                            onChange={setDifficulty}
                        />
                        <RatingSelector
                            label="Focus Level"
                            icon="target"
                            value={focus}
                            onChange={setFocus}
                        />

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Notes (Opional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="What did you learn? Any blockers?"
                                placeholderTextColor="#A0A0C0"
                                multiline
                                numberOfLines={3}
                                value={notes}
                                onChangeText={setNotes}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Save Progress</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#5C5C8E',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#A0A0C0',
        textAlign: 'center',
        marginBottom: 24,
    },
    formContainer: {
        width: '100%',
        gap: 20,
        marginBottom: 24,
    },
    ratingContainer: {
        gap: 8,
    },
    ratingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ratingLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5C5C8E',
        flex: 1,
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#9D96E1',
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    starButton: {
        padding: 4,
    },
    filledStar: {
        // Add shadow or glow if needed
    },
    inputContainer: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5C5C8E',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0F0',
        borderRadius: 16,
        padding: 12,
        height: 80,
        textAlignVertical: 'top',
        color: '#5C5C8E',
    },
    submitButton: {
        backgroundColor: '#9D96E1',
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: 32,
        width: '100%',
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    successIcon: {
        marginBottom: 16,
    },
    aiFeedbackContainer: {
        backgroundColor: '#F8F9FF',
        padding: 16,
        borderRadius: 16,
        width: '100%',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E0E0F0',
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    aiLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9D96E1',
        textTransform: 'uppercase',
    },
    aiText: {
        fontSize: 14,
        color: '#5C5C8E',
        lineHeight: 20,
    },
});

export default SessionFeedbackModal;
