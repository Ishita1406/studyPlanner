import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTodayPlan, regeneratePlan, removeTaskFromPlan } from '../../api/studyPlan';
import { updateProfile } from '../../api/user';

const TodaysPlanScreen = () => {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalibrating, setRecalibrating] = useState(false);
  const [dailyHours, setDailyHours] = useState('2');

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
      // 1. Update Daily Hours first
      await updateProfile({ maxDailyMinutes: Number(dailyHours) * 60 });

      // 2. Generate Plan
      const response = await regeneratePlan();
      setPlan(response);
      Alert.alert("Success", "Study plan generated for today!");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to generate today's plan");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTask = async (topicId: string) => {
    console.log("Attempting to delete topic:", topicId);
    if (!topicId) {
      Alert.alert("Error", "Invalid task ID");
      return;
    }

    const performDelete = async () => {
      console.log("Deletion confirmed for:", topicId);
      try {
        const res = await removeTaskFromPlan(topicId);
        console.log("Delete response:", res);

        // Optimistic update
        if (plan) {
          const updatedTasks = plan.tasks.filter((t: any) => t.topic?._id !== topicId);
          setPlan({ ...plan, tasks: updatedTasks });
        }
      } catch (error) {
        console.error("Delete failed:", error);
        Alert.alert("Error", "Failed to remove task");
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to remove this task from today's plan?");
      if (confirmed) {
        await performDelete();
      } else {
        console.log("Deletion cancelled (Web)");
      }
      return;
    }

    Alert.alert(
      "Remove Task",
      "Are you sure you want to remove this task from today's plan?",
      [
        { text: "Cancel", style: "cancel", onPress: () => console.log("Deletion cancelled") },
        {
          text: "Remove",
          style: "destructive",
          onPress: performDelete
        }
      ]
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <MobileCard
      title="Today's Plan"
      backgroundColor="#F8F9FF"
      headerRight={
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity onPress={fetchPlan}>
            <Feather name="refresh-cw" size={20} color="#9D96E1" />
          </TouchableOpacity>
        </View>
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
          <Text style={styles.emptyText}>Configure Today's Session</Text>

          <View style={styles.hoursContainer}>
            <Text style={styles.hoursLabel}>How many hours today?</Text>
            <TextInput
              style={styles.input}
              value={dailyHours}
              onChangeText={setDailyHours}
              keyboardType="numeric"
              placeholder="2"
            />
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGeneratePlan}
          >
            <Text style={styles.generateButtonText}>
              Generate Plan
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

                  {isDone ? (
                    <Feather
                      name="check-circle"
                      size={20}
                      color="#67C7A6"
                    />
                  ) : (
                    <TouchableOpacity onPress={() => handleRemoveTask(item.topic._id)}>
                      <Feather name="trash-2" size={18} color="#F8A4B3" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
        </ScrollView>
      )}

      {plan?.tasks?.length > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipDay}
          >
            <Text style={styles.skipButtonText}>Skip Day</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartStudying}
          >
            <Text style={styles.startText}>Start Studying</Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
    backgroundColor: '#67C7A6',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#9D96E1',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#9D96E1',
    fontWeight: '700',
  },
  startText: {
    color: '#fff',
    fontWeight: '700',
  },

  /* Empty State / Generate */
  emptyState: {
    alignItems: 'center',
    marginTop: 32,
    gap: 20,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
  },
  emptyText: {
    fontWeight: '700',
    color: '#5C5C8E',
    fontSize: 16,
  },
  hoursContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  hoursLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#F3F4F6',
    width: '50%',
    padding: 12,
    textAlign: 'center',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#5C5C8E',
  },
  generateButton: {
    width: '100%',
    backgroundColor: '#9D96E1',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
