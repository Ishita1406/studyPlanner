import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';

const StudyCalendarScreen = () => {
    return (
        <MobileCard
            title="Your Study Calendar"
            backgroundColor="#F0FFF8"
            headerRight={<Feather name="calendar" size={20} color="#22C55E" />}
        >
            <View style={styles.calendarCard}>
                <View style={styles.calendarHeader}>
                    <Text style={styles.calendarTitle}>May 2024</Text>
                    <Feather name="chevron-right" size={20} color="#D1D5DB" />
                </View>

                <View style={styles.weekDays}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fir', 'Set'].map(day => (
                        <Text key={day} style={styles.weekDayText}>{day}</Text>
                    ))}
                </View>

                <View style={styles.daysGrid}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map(day => {
                        let style = styles.dayText;
                        if (day === 2) style = { ...style, color: '#F8A4B3' } as any;
                        if (day === 3) style = { ...style, color: '#67C7A6' } as any;
                        if (day === 8) style = { ...style, color: '#4AA9FF' } as any;
                        if (day === 9) style = { ...style, color: '#F8A4B3' } as any;

                        return (
                            <Text key={day} style={style}>{day}</Text>
                        );
                    })}
                </View>
            </View>

            <View style={styles.spaceY4}>
                <Text style={styles.upcomingLabel}>Upcoming Adjustments</Text>
                <View style={styles.upcomingCard}>
                    <View style={styles.upcomingList}>
                        <View style={styles.upcomingItem}>
                            <View style={[styles.bullet, { backgroundColor: '#67C7A6' }]} />
                            <Text style={styles.upcomingText}>
                                May 4: <Text style={{ fontWeight: '600', color: '#5C5C8E' }}>Extra Statistics Review</Text>
                            </Text>
                        </View>
                        <View style={styles.upcomingItem}>
                            <View style={[styles.bullet, { backgroundColor: '#4AA9FF' }]} />
                            <Text style={styles.upcomingText}>
                                May 6: <Text style={{ fontWeight: '600', color: '#5C5C8E' }}>Mock Test Scheduled</Text>
                            </Text>
                        </View>
                    </View>
                    <View style={styles.calendarIcon}>
                        <Feather name="calendar" size={64} color="#67C7A6" />
                    </View>
                </View>
            </View>
        </MobileCard>
    );
};

export default StudyCalendarScreen;

const styles = StyleSheet.create({
    calendarCard: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    calendarTitle: {
        fontWeight: '700',
        fontSize: 16,
        color: '#5C5C8E',
    },
    weekDays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    weekDayText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#F8A4B3',
        textAlign: 'center',
        width: 28,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    dayText: {
        width: 28,
        height: 28,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 12,
    },
    spaceY4: {
        gap: 16,
    },
    upcomingLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#5C5C8E',
        marginBottom: 8,
        marginLeft: 4,
    },
    upcomingCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    upcomingList: {
        gap: 8,
        zIndex: 10,
    },
    upcomingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    upcomingText: {
        fontSize: 12,
        color: '#6B7280',
    },
    calendarIcon: {
        width: 64,
        height: 64,
        opacity: 0.3,
    },
});
