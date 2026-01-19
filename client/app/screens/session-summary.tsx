import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';
import { useRouter } from 'expo-router';

const SessionSummaryScreen = () => {
    const router = useRouter();
    return (
        <MobileCard title="Session Summary" backgroundColor="#F2F1FF" showBack onBack={() => router.back()}>
            <View style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                    <View style={styles.sessionIcon}>
                        <Feather name="book" size={20} color="#22C55E" />
                    </View>
                    <Text style={styles.sessionTitle}>Binary Trees</Text>
                </View>

                <View style={styles.sessionDetails}>
                    <View style={styles.detailRow}>
                        <Feather name="clock" size={16} color="#9D96E1" />
                        <Text style={styles.detailText}>Time Spent: 1h 20m</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Feather name="target" size={16} color="#9D96E1" />
                        <Text style={styles.detailText}>Difficulty: Challenging</Text>
                    </View>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Focus Level</Text>
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground} />
                    <View style={styles.progressBarFill} />
                    <View style={styles.progressKnob} />
                </View>
                <View style={styles.progressLabels}>
                    <Text style={styles.progressLabelText}>Low</Text>
                    <Text style={styles.progressLabelText}>Medium</Text>
                    <Text style={styles.progressLabelText}>High</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.logSessionButton}>
                <Text style={styles.logSessionText}>Log Session</Text>
            </TouchableOpacity>
        </MobileCard>
    );
};

export default SessionSummaryScreen;

const styles = StyleSheet.create({
    sessionCard: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sessionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sessionIcon: {
        width: 32,
        height: 32,
        backgroundColor: '#DCFCE7',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sessionTitle: {
        fontWeight: '700',
        fontSize: 16,
        color: '#5C5C8E',
    },
    sessionDetails: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    progressContainer: {
        paddingHorizontal: 8,
        marginBottom: 48,
    },
    progressLabel: {
        fontWeight: '700',
        fontSize: 14,
        color: '#5C5C8E',
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressBarContainer: {
        height: 8,
        marginBottom: 8,
        position: 'relative',
    },
    progressBarBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#E0E0F0',
        borderRadius: 4,
    },
    progressBarFill: {
        position: 'absolute',
        width: '80%',
        height: '100%',
        backgroundColor: '#9D96E1',
        borderRadius: 4,
    },
    progressKnob: {
        position: 'absolute',
        top: -12,
        left: '80%',
        transform: [{ translateX: -16 }],
        width: 32,
        height: 32,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 4,
        borderColor: '#9D96E1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabelText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9D96E1',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    logSessionButton: {
        backgroundColor: '#9D96E1',
        paddingVertical: 16,
        borderRadius: 32,
        alignItems: 'center',
        shadowColor: '#9D96E1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    logSessionText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
