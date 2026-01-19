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

const MissedDaysScreen = () => {
    const router = useRouter();
    return (
        <MobileCard title="Missed Days Rescheduled" backgroundColor="#F4F1FF" showBack onBack={() => router.back()}>
            <Text style={styles.missedText}>You skipped 2 days, here&apos;s your updated plan:</Text>

            <View style={styles.spaceY4}>
                <View style={styles.missedCard}>
                    <View style={styles.missedHeader}>
                        <View style={styles.missedRow}>
                            <View style={[styles.numberCircle, { backgroundColor: '#D1FAE5' }]}>
                                <Text style={[styles.numberText, { color: '#059669' }]}>1</Text>
                            </View>
                            <Text style={styles.missedTitle}>Algorithms</Text>
                        </View>
                        <View style={styles.criticalBadge}>
                            <Text style={styles.criticalText}>Critical</Text>
                            <Feather name="chevron-right" size={12} color="#fff" />
                        </View>
                    </View>
                    <Text style={styles.missedNote}>Extra 20 mins added</Text>
                </View>

                <View style={styles.missedCard}>
                    <View style={styles.missedRow}>
                        <View style={[styles.iconCircle, { backgroundColor: '#FED7AA' }]}>
                            <Feather name="settings" size={16} color="#F97316" />
                        </View>
                        <View>
                            <Text style={styles.missedTitle}>Revision Session</Text>
                            <Text style={styles.missedNote}>Rescheduled | 40 mins</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.missedCard}>
                    <View style={styles.missedRow}>
                        <View style={[styles.numberCircle, { backgroundColor: '#E0E7FF' }]}>
                            <Text style={[styles.numberText, { color: '#6366F1' }]}>2</Text>
                        </View>
                        <View>
                            <Text style={styles.missedTitle}>Light Study</Text>
                            <Text style={styles.missedNote}>General Science Review</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.viewPlanButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={styles.viewPlanText}>View Plan</Text>
                    <Feather name="chevron-right" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.editScheduleButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={styles.editScheduleText}>Edit Schedule</Text>
                    <Feather name="chevron-right" size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        </MobileCard>
    );
};

export default MissedDaysScreen;

const styles = StyleSheet.create({
    missedText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 24,
    },
    spaceY4: {
        gap: 16,
    },
    missedCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    missedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    missedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    numberCircle: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        fontWeight: '700',
        fontSize: 12,
    },
    missedTitle: {
        fontWeight: '700',
        fontSize: 14,
        color: '#5C5C8E',
    },
    criticalBadge: {
        backgroundColor: '#F8A4B3',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        shadowColor: '#F8A4B3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    criticalText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    missedNote: {
        fontSize: 11,
        color: '#9CA3AF',
        fontStyle: 'italic',
        marginLeft: 44,
    },
    iconCircle: {
        padding: 8,
        borderRadius: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 32,
    },
    viewPlanButton: {
        flex: 1,
        backgroundColor: '#9D96E1',
        paddingVertical: 16,
        borderRadius: 24,
        gap: 4,
        shadowColor: '#9D96E1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    viewPlanText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    editScheduleButton: {
        flex: 1,
        backgroundColor: '#F8A4B3',
        paddingVertical: 16,
        borderRadius: 24,
        gap: 4,
        shadowColor: '#F8A4B3',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    editScheduleText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
});
