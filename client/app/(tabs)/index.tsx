import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTodayPlan, regeneratePlan } from '../../api/studyPlan';

const TodaysPlanScreen = () => {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalibrating, setRecalibrating] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();

  /* ---------------- FETCH PLAN ---------------- */

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const response = await getTodayPlan();
      setPlan(response);
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        Alert.alert("Error", "Failed to load today's plan");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [params?.refresh]);

  /* ---------------- HELPERS ---------------- */

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toDateString();
    return new Date(dateString).toDateString();
  };

  /* ---------------- ACTIONS ---------------- */

  const handleStartStudying = () => {
    if (!plan?.tasks?.length) {
      Alert.alert("No Tasks", "Please generate a study plan first");
      return;
    }

    const firstTask = plan.tasks[0];

    router.push({
      pathname: '/(tabs)/study-session',
      params: {
        topicId: firstTask.topic._id,
        topicName: firstTask.topic.name,
        subjectName:
          firstTask.topic.subject?.name || firstTask.topic.subject,
      },
    });
  };

  const handleSkipDay = async () => {
    setRecalibrating(true);
    try {
      const response = await regeneratePlan();
      setPlan(response);
      Alert.alert("Success", "Plan recalibrated for today!");
    } catch {
      Alert.alert("Error", "Failed to recalibrate plan");
    } finally {
      setRecalibrating(false);
    }
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const response = await regeneratePlan();
      setPlan(response);
      Alert.alert("Success", "Study plan generated for today!");
    } catch {
      Alert.alert("Error", "Failed to generate today's plan");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <MobileCard
      title="Today's Plan"
      backgroundColor="#F8F9FF"
      headerRight={
        <TouchableOpacity onPress={fetchPlan}>
          <Feather name="refresh-cw" size={20} color="#9D96E1" />
        </TouchableOpacity>
      }
    >
      <View style={styles.dateContainer}>
        <Feather name="calendar" size={20} color="#9D96E1" />
        <Text style={styles.dateText}>{formatDate(plan?.date)}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#9D96E1" />
      ) : !plan?.tasks?.length ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No plan for today.</Text>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGeneratePlan}
          >
            <Text style={styles.generateButtonText}>
              Generate Today's Plan
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ gap: 16 }}>
          {plan.tasks
            .filter((item: any) => !item.isCompleted)
            .map((item: any, index: number) => {
              const completed = item.completedMinutes || 0;
              const remaining = Math.max(item.plannedMinutes - completed, 0);
              const isDone = item.isCompleted;

              return (
                <View
                  key={item.topic._id}
                  style={[styles.taskCard, isDone && styles.taskCardDone]}
                >
                  <View>
                    <Text
                      style={[
                        styles.taskTitle,
                        isDone && styles.taskTitleDone,
                      ]}
                    >
                      {index + 1}. {item.topic.name}
                    </Text>
                    <Text style={styles.taskMeta}>
                      {isDone
                        ? 'Completed'
                        : `${remaining}m remaining (Goal: ${item.plannedMinutes}m)`}
                    </Text>
                  </View>

                  {isDone && (
                    <Feather
                      name="check-circle"
                      size={20}
                      color="#67C7A6"
                    />
                  )}
                </View>
              );
            })}
        </ScrollView>
      )}

      {plan?.tasks?.length > 0 && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartStudying}
        >
          <Text style={styles.startText}>Start Studying</Text>
        </TouchableOpacity>
      )}
    </MobileCard>
  );
};

export default TodaysPlanScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  dateContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9D96E1',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
  },
  taskCardDone: {
    backgroundColor: '#F0F9F5',
    opacity: 0.8,
  },
  taskTitle: {
    fontWeight: '700',
    color: '#5C5C8E',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#A0A0C0',
  },
  taskMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  startButton: {
    backgroundColor: '#67C7A6',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  startText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontWeight: '700',
    color: '#5C5C8E',
  },
  generateButton: {
    marginTop: 16,
    backgroundColor: '#9D96E1',
    padding: 12,
    borderRadius: 24,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
