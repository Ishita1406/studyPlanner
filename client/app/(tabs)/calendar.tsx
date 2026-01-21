import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
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
import { getSubjects } from '../../api/subject';

const StudyCalendarScreen = () => {
  const today = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  /* ---------------- LOAD MARKED DATES ---------------- */



  const [subjects, setSubjects] = useState<any[]>([]);

  /* ---------------- LOAD MARKED DATES ---------------- */

  const loadMarkedDates = async () => {
    try {
      const dates = await getDatesWithPlans();
      const fetchedSubjects = await getSubjects();
      setSubjects(fetchedSubjects);

      const markings: any = {};

      // 1. Mark Plan Dates (Green Dot)
      dates.forEach((date: string) => {
        markings[date] = {
          marked: true,
          dotColor: '#67C7A6', // Green for study plan
          details: { hasPlan: true }
        };
      });

      // 2. Mark Exam Dates (Red Dot)
      fetchedSubjects.forEach((sub: any) => {
        if (sub.examDate) {
          const date = sub.examDate.split('T')[0];

          if (markings[date]) {
            // If both exist, maybe show a different color or multiple dots?
            // For now, let's prioritize Exam color or just keep it marked.
            // react-native-calendars supports `dots: []` for multiple dots if we use checking specific marking type
            // sticking to simple dot for now, overriding with Red if it's an exam.
            markings[date] = {
              ...markings[date],
              marked: true,
              dotColor: '#F8A4B3', // Red/Pink for Exam
              details: { ...markings[date].details, hasExam: true, examSubject: sub.name }
            };
          } else {
            markings[date] = {
              marked: true,
              dotColor: '#F8A4B3',
              details: { hasExam: true, examSubject: sub.name }
            };
          }
        }
      });

      setMarkedDates(markings);
    } catch (error) {
      console.error("Failed to load marked dates", error);
    }
  };

  /* ---------------- FETCH PLAN ---------------- */

  const fetchPlanForDate = async (date: string) => {
    // Check if we have any data (Plan OR Exam) for this date
    const dateData = markedDates[date];

    if (!dateData) {
      setPlan(null);
      return;
    }

    setLoading(true);
    try {
      // If we have a plan, fetch it
      if (dateData.details?.hasPlan) {
        const plan = await getPlanByDate(date);
        setPlan(plan);
      } else {
        // No plan, but maybe an exam?
        setPlan(null);
      }
    } catch (error) {
      console.error('Unexpected error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EFFECTS ---------------- */

  useFocusEffect(
    useCallback(() => {
      loadMarkedDates();
    }, [])
  );

  useEffect(() => {
    // Only fetch if markedDates is populated (or empty if loaded)
    fetchPlanForDate(selectedDate);
  }, [selectedDate, markedDates]);

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
            {markedDates[selectedDate]?.details?.hasExam ? (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Feather name="flag" size={32} color="#F8A4B3" />
                <Text style={[styles.emptyText, { color: '#F8A4B3' }]}>
                  Exam Day: {markedDates[selectedDate].details.examSubject}
                </Text>
                <Text style={styles.emptySubtext}>Good luck! No study tasks scheduled today.</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>
                No study plan generated for this date.
              </Text>
            )}
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
  emptySubtext: {
    fontSize: 12,
    color: '#A0A0C0',
    marginTop: 4,
    textAlign: 'center',
  },
});
