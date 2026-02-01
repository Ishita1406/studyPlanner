import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';
import { getDailyFeedback } from '../../api/ai';

const AiFeedbackScreen = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadFeedback = async () => {
        setLoading(true);
        try {
            const feedback = await getDailyFeedback();
            setData(feedback);
        } catch (error) {
            console.error("Failed to load feedback", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadFeedback();
        }, [])
    );

    if (loading) {
        return (
            <MobileCard title="AI Feedback" backgroundColor="#FDF0F3">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#9D96E1" />
                    <Text style={{ marginTop: 16, color: '#A0A0C0' }}>Analyzing your performance...</Text>
                </View>
            </MobileCard>
        );
    }

    return (
        <MobileCard title="AI Feedback" backgroundColor="#FDF0F3">
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.feedbackCard}>
                    <Text style={styles.feedbackTitle}>Daily AI Feedback</Text>
                    <Text style={styles.feedbackText}>
                        {data?.feedback || "No feedback available yet. Complete some sessions!"}
                    </Text>
                </View>

                {data?.adjustments?.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>Suggested Adjustments</Text>
                        </View>

                        <View style={styles.spaceY4}>
                            {data.adjustments.map((adj: any, idx: number) => (
                                <View key={idx} style={styles.adjustmentCard}>
                                    <View style={[styles.adjustmentIcon, { backgroundColor: '#E8F8F2' }]}>
                                        <Feather name={adj.icon || 'activity'} size={20} color="#67C7A6" />
                                    </View>
                                    <View style={styles.adjustmentContent}>
                                        <Text style={styles.adjustmentTitle}>{adj.title}</Text>
                                        <Text style={styles.adjustmentSub}>{adj.subtitle}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                <TouchableOpacity style={styles.gotItButton} onPress={loadFeedback}>
                    <Text style={styles.gotItText}>Refresh Analysis</Text>
                </TouchableOpacity>
            </ScrollView>
        </MobileCard>
    );
};

export default AiFeedbackScreen;

const styles = StyleSheet.create({
    feedbackCard: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FADDE2',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    feedbackTitle: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 16,
        color: '#5C5C8E',
        marginBottom: 16,
    },
    feedbackText: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 20,
        textAlign: 'center',
    },
    sectionHeader: {
        marginBottom: 8,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#F8A4B3',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 4,
    },
    spaceY4: {
        gap: 16,
    },
    adjustmentCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    adjustmentIcon: {
        padding: 12,
        borderRadius: 16,
    },
    adjustmentContent: {
        flex: 1,
    },
    adjustmentTitle: {
        fontWeight: '700',
        fontSize: 14,
        color: '#5C5C8E',
        marginBottom: 2,
    },
    adjustmentSub: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    botIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 80,
        height: 80,
        opacity: 0.4,
    },
    gotItButton: {
        backgroundColor: '#9D96E1',
        paddingVertical: 16,
        borderRadius: 32,
        alignItems: 'center',
        marginTop: 40,
        shadowColor: '#9D96E1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    gotItText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
