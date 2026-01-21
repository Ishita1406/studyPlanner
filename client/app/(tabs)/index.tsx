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
import { useRouter } from 'expo-router';
import { getTodayPlan, regeneratePlan, generatePlan } from '../../api/studyPlan';

const TodaysPlanScreen = () => {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalibrating, setRecalibrating] = useState(false);

  const router = useRouter();

  /* ---------------- FETCH PLAN ---------------- */

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const response = await getTodayPlan();
      setPlan(response.plan); // ✅ FIX
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
  }, []);

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
      setPlan(response.plan); // ✅ FIX
      Alert.alert("Success", "Plan recalibrated for today!");
    } catch (error) {
      Alert.alert("Error", "Failed to recalibrate plan");
    } finally {
      setRecalibrating(false);
    }
  };

  const handleGeneratePlan = async () => {
  setLoading(true);
  try {
    const plan = await regeneratePlan(); // ✅ USE THIS
    setPlan(plan);
    Alert.alert("Success", "Study plan generated for today!");
  } catch (error) {
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
        <Feather name="calendar" size={12} color="#9D96E1" />
        <Text style={styles.dateText}>{formatDate(plan?.date)}</Text>
        <Text style={styles.separator}>|</Text>
        <TouchableOpacity style={styles.adaptiveButton} onPress={fetchPlan}>
          <Text style={styles.adaptiveText}>Refresh</Text>
          <Feather name="refresh-cw" size={12} color="#9D96E1" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#9D96E1" />
      ) : recalibrating ? (
        <View style={styles.recalibratingContainer}>
          <ActivityIndicator size="large" color="#F8A4B3" />
          <Text style={styles.recalibratingText}>AI Recalibrating...</Text>
          <Text style={styles.recalibratingSubtext}>
            Adjusting for missed time
          </Text>
        </View>
      ) : !plan?.tasks?.length ? (
        <View style={styles.emptyState}>
          <Feather name="calendar" size={48} color="#D0D0E0" />
          <Text style={styles.emptyText}>No plan generated for today.</Text>
          <Text style={styles.emptySubtext}>
            Create a syllabus first, then generate a study plan.
          </Text>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGeneratePlan}
          >
            <Feather name="zap" size={16} color="#fff" />
            <Text style={styles.generateButtonText}>
              Generate Today's Plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)/setup')}
          >
            <Text style={styles.secondaryButtonText}>
              Go to Syllabus Setup
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.spaceY4}>
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>
              {plan.tasks.length} Tasks • {plan.totalMinutes || 0} min
            </Text>
          </View>

          {plan.tasks.map((item: any, index: number) => (
            <View key={item._id || index} style={styles.taskCard}>
              <Text style={styles.taskTitle}>
                {index + 1}. {item.topic?.name}
              </Text>
              <Text style={styles.taskMeta}>
                {item.plannedMinutes}m
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {plan?.tasks?.length > 0 && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#67C7A6' }]}
            onPress={handleStartStudying}
          >
            <Feather name="play-circle" size={16} color="#fff" />
            <Text style={styles.actionText}>Start Studying</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#F8A4B3' }]}
            onPress={handleSkipDay}
            disabled={recalibrating}
          >
            <Feather name="skip-forward" size={16} color="#fff" />
            <Text style={styles.actionText}>Skip Day</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dateText: { fontSize: 12, fontWeight: '700', color: '#9D96E1' },
  separator: { color: '#D0D0E0' },
  adaptiveButton: { flexDirection: 'row', gap: 4 },
  adaptiveText: { fontSize: 12, fontWeight: '700', color: '#9D96E1' },
  spaceY4: { gap: 16 },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
  },
  taskTitle: { fontWeight: '700', color: '#5C5C8E' },
  taskMeta: { fontSize: 12, color: '#6B7280' },
  buttonRow: { flexDirection: 'row', gap: 16, marginTop: 24 },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  actionText: { color: '#fff', fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 20 },
  emptyText: { fontWeight: '700', color: '#5C5C8E' },
  emptySubtext: { fontSize: 12, color: '#A0A0C0', textAlign: 'center' },
  generateButton: {
    backgroundColor: '#9D96E1',
    padding: 12,
    borderRadius: 24,
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  generateButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#9D96E1',
    padding: 12,
    borderRadius: 24,
    marginTop: 12,
  },
  secondaryButtonText: { color: '#9D96E1', fontWeight: '600' },
  recalibratingContainer: { alignItems: 'center', gap: 8 },
  recalibratingText: { fontWeight: '700', color: '#5C5C8E' },
  recalibratingSubtext: { fontSize: 12, color: '#A0A0C0' },
  statsContainer: { alignItems: 'center' },
  statText: { fontSize: 12, color: '#6B7280' },
});
