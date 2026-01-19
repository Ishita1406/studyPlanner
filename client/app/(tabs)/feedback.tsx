import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';

const AiFeedbackScreen = () => {
    return (
        <MobileCard title="AI Feedback" backgroundColor="#FDF0F3">
            <View style={styles.feedbackCard}>
                <Text style={styles.feedbackTitle}>Daily AI Feedback</Text>
                <Text style={styles.feedbackText}>
                    Great job! You excelled in logic tasks today but found memorization difficult. Let&apos;s focus more on flashcards tomorrow.
                </Text>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Suggested Adjustments</Text>
            </View>

            <View style={styles.spaceY4}>
                <View style={styles.adjustmentCard}>
                    <View style={[styles.adjustmentIcon, { backgroundColor: '#E8F8F2' }]}>
                        <Feather name="zap" size={20} color="#67C7A6" />
                    </View>
                    <View style={styles.adjustmentContent}>
                        <Text style={styles.adjustmentTitle}>Flashcard Review</Text>
                        <Text style={styles.adjustmentSub}>30 mins of Term Drills</Text>
                    </View>
                </View>

                <View style={[styles.adjustmentCard, { position: 'relative', overflow: 'hidden' }]}>
                    <View style={[styles.adjustmentIcon, { backgroundColor: '#FDF0F3' }]}>
                        <MaterialCommunityIcons name="brain" size={20} color="#F8A4B3" />
                    </View>
                    <View style={styles.adjustmentContent}>
                        <Text style={styles.adjustmentTitle}>Light Topic</Text>
                        <Text style={styles.adjustmentSub}>Intro to Ecology | 40m</Text>
                    </View>
                    <View style={styles.botIcon}>
                        <MaterialCommunityIcons name="robot" size={80} color="#9D96E1" />
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.gotItButton}>
                <Text style={styles.gotItText}>Got it!</Text>
            </TouchableOpacity>
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
