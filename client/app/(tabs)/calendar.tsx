import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';
import { getPlanByDate } from '../../api/studyPlan';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';

const StudyCalendarScreen = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchPlanForDate = async (dateString: string) => {
        setLoading(true);
        try {
            const data = await getPlanByDate(dateString);
            setPlan(data);
        } catch (error) {
            console.error(error);
            setPlan(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlanForDate(selectedDate);
    }, [selectedDate]);

    return (
        <MobileCard
            title="Your Study Calendar"
            backgroundColor="#F0FFF8"
            headerRight={<Feather name="calendar" size={20} color="#cb90ecff" />}
        >
            <View style={styles.calendarCard}>
                <Calendar
                    onDayPress={(day: DateData) => {
                        setSelectedDate(day.dateString);
                    }}
                    markedDates={{
                        [selectedDate]: { selected: true, disableTouchEvent: true }
                    }}
                    theme={{
                        backgroundColor: '#ffffff',
                        calendarBackground: '#ffffff',
                        textSectionTitleColor: '#b6c1cd',
                        selectedDayBackgroundColor: '#67C7A6',
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: '#67C7A6',
                        dayTextColor: '#2d4150',
                        textDisabledColor: '#d9e1e8',
                        dotColor: '#00adf5',
                        selectedDotColor: '#ffffff',
                        arrowColor: '#5C5C8E',
                        disabledArrowColor: '#d9e1e8',
                        monthTextColor: '#5C5C8E',
                        indicatorColor: 'blue',
                        textDayFontWeight: '300',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: '300',
                        textDayFontSize: 14,
                        textMonthFontSize: 16,
                        textDayHeaderFontSize: 14
                    }}
                />
            </View>

            <View style={styles.spaceY4}>
                <Text style={styles.upcomingLabel}>Plan for {new Date(selectedDate).toDateString()}</Text>

                {loading ? (
                    <ActivityIndicator color="#67C7A6" />
                ) : plan && plan.tasks ? (
                    <View style={styles.upcomingCard}>
                        <View style={styles.upcomingList}>
                            {plan.tasks.map((task: any, idx: number) => (
                                <View key={idx} style={styles.upcomingItem}>
                                    <View style={[styles.bullet, { backgroundColor: '#67C7A6' }]} />
                                    <Text style={styles.upcomingText}>
                                        {task.topic?.name || 'Topic'}: <Text style={{ fontWeight: '600', color: '#5C5C8E' }}>{task.plannedMinutes}m</Text>
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No plan for this date.</Text>
                    </View>
                )}
            </View>
        </MobileCard>
    );
};

export default StudyCalendarScreen;

const styles = StyleSheet.create({
    calendarCard: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        overflow: 'hidden'
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
        width: '100%'
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
    emptyState: {
        padding: 16,
        alignItems: 'center',
    },
    emptyText: {
        color: '#A0A0C0',
        fontStyle: 'italic',
    },
});
