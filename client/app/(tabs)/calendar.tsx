import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import { getPlanByDate, getDatesWithPlans } from '../../api/studyPlan';

const StudyCalendarScreen = () => {
  const today = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  /* ---------------- LOAD MARKED DATES ---------------- */

  const loadMarkedDates = async () => {
    try {
      const dates = await getDatesWithPlans();

      const markings = dates.reduce((acc: any, date: string) => {
        acc[date] = { marked: true, dotColor: '#67C7A6' };
        return acc;
      }, {});

      setMarkedDates(markings);
    } catch (error) {
      console.error("Failed to load marked dates", error);
    }
  };

  /* ---------------- FETCH PLAN ---------------- */

  const fetchPlanForDate = async (date: string) => {
    setLoading(true);
    try {
      const plan = await getPlanByDate(date);
      setPlan(plan);

      // 🔥 ensure date is marked
      setMarkedDates(prev => ({
        ...prev,
        [date]: { marked: true, dotColor: '#67C7A6' },
      }));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setPlan(null);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    loadMarkedDates();
    fetchPlanForDate(today);
  }, []);

  useEffect(() => {
    fetchPlanForDate(selectedDate);
  }, [selectedDate]);

  /* ---------------- UI ---------------- */

  return (
    <MobileCard
      title="Your Study Calendar"
      backgroundColor="#F0FFF8"
      headerRight={<Feather name="calendar" size={20} color="#67C7A6" />}
    >
      <View style={styles.calendarCard}>
        <Calendar
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: '#67C7A6',
            },
          }}
        />
      </View>

      <View style={styles.spaceY4}>
        <Text style={styles.upcomingLabel}>
          Plan for {new Date(selectedDate).toDateString()}
        </Text>

        {loading ? (
          <ActivityIndicator color="#67C7A6" />
        ) : plan?.tasks?.length ? (
          <View style={styles.upcomingCard}>
            {plan.tasks.map((task: any, idx: number) => (
              <View key={idx} style={styles.upcomingItem}>
                <View style={styles.bullet} />
                <Text style={styles.upcomingText}>
                  {task.topic?.name} ·{' '}
                  <Text style={{ fontWeight: '700' }}>
                    {task.plannedMinutes}m
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No study plan generated for this date.
            </Text>
          </View>
        )}
      </View>
    </MobileCard>
  );
};

export default StudyCalendarScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 16,
    marginBottom: 24,
  },
  spaceY4: { gap: 16 },
  upcomingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C5C8E',
  },
  upcomingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    gap: 8,
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
    backgroundColor: '#67C7A6',
  },
  upcomingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    color: '#A0A0C0',
    fontStyle: 'italic',
  },
});
