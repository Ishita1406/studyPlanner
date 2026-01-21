import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { Modal } from 'react-native';

import { createProfile, getProfile, updateProfile } from '../../api/user';
import { generatePlan, regeneratePlan } from '../../api/studyPlan';
import { createSubject } from '@/api/subject';
import { createTopic } from '@/api/topic';

/* ---------------- TYPES ---------------- */

interface TopicItem {
  name: string;
  estimatedMinutes: number;
}

interface SubjectItem {
  name: string;
  examDate?: string;
  importanceLevel: number;
  topics: TopicItem[];
}

/* ---------------- COMPONENT ---------------- */

const SetupScreen = () => {
  const router = useRouter();

  /* ---------- Profile ---------- */
  const [dailyHours, setDailyHours] = useState('2');
  const [peakEnergy, setPeakEnergy] =
    useState<'morning' | 'afternoon' | 'evening' | null>(null);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  /* ---------- Subjects ---------- */
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentExamDate, setCurrentExamDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  /* ---------- Topics ---------- */
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentMinutes, setCurrentMinutes] = useState('60');

  /* ---------------- EFFECT ---------------- */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile?._id) {
          setExistingProfile(profile);
          if (profile.maxDailyMinutes) {
            setDailyHours((profile.maxDailyMinutes / 60).toString());
          }
          if (profile.energyProfile?.length) {
            const hour = profile.energyProfile[0].hour;
            if (hour === 9) setPeakEnergy('morning');
            else if (hour === 14) setPeakEnergy('afternoon');
            else if (hour === 20) setPeakEnergy('evening');
          }
        }
      } catch (err: any) {
        if (err?.status !== 404) console.error(err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  /* ---------------- HELPERS ---------------- */

  const showAlert = (title: string, message: string) => {
    Platform.OS === 'web'
      ? window.alert(`${title}: ${message}`)
      : Alert.alert(title, message);
  };

  /* ---------------- SUBJECT HANDLERS ---------------- */

  const addSubject = () => {
    if (!currentSubject.trim()) {
      showAlert('Error', 'Subject name required');
      return;
    }

    setSubjects(prev => [
      ...prev,
      {
        name: currentSubject.trim(),
        examDate: currentExamDate || undefined,
        importanceLevel: 3,
        topics: [],
      },
    ]);

    setCurrentSubject('');
    setCurrentExamDate('');
  };

  const removeSubject = (index: number) => {
    const copy = [...subjects];
    copy.splice(index, 1);
    setSubjects(copy);
  };

  /* ---------------- TOPIC HANDLERS ---------------- */

  const addTopic = (subjectIndex: number) => {
    if (!currentTopic.trim()) {
      showAlert('Error', 'Topic name required');
      return;
    }

    const updated = [...subjects];
    updated[subjectIndex].topics.push({
      name: currentTopic.trim(),
      estimatedMinutes: Number(currentMinutes) || 60,
    });

    setSubjects(updated);
    setCurrentTopic('');
    setCurrentMinutes('60');
  };

  const removeTopic = (sIdx: number, tIdx: number) => {
    const updated = [...subjects];
    updated[sIdx].topics.splice(tIdx, 1);
    setSubjects(updated);
  };

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    if (!subjects.length) {
      showAlert('Error', 'Add at least one subject');
      return;
    }

    setLoading(true);

    try {
      /* 1️⃣ PROFILE */
      const profilePayload = {
        maxDailyMinutes: Number(dailyHours) * 60,
        energyProfile: peakEnergy
          ? [
              {
                hour:
                  peakEnergy === 'morning'
                    ? 9
                    : peakEnergy === 'afternoon'
                    ? 14
                    : 20,
                energy: 100,
              },
            ]
          : [],
      };

      existingProfile
        ? await updateProfile(profilePayload)
        : await createProfile(profilePayload);

      /* 2️⃣ SUBJECTS + TOPICS */
      for (const subject of subjects) {
        const createdSubject = await createSubject({
          name: subject.name,
          examDate: subject.examDate,
          importanceLevel: subject.importanceLevel,
        });

        for (const topic of subject.topics) {
          await createTopic({
            subject: createdSubject._id,
            name: topic.name,
            estimatedMinutes: topic.estimatedMinutes,
          });
        }
      }

      /* 3️⃣ PLAN */
      existingProfile ? await regeneratePlan() : await generatePlan();

      showAlert('Success', 'Study plan ready!');
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error(err);
      showAlert('Error', 'Failed to save setup');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  if (profileLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#9D96E1" />
      </View>
    );
  }

  return (
    <MobileCard title="Setup Syllabus" backgroundColor="#F0F7FF">
      <ScrollView contentContainerStyle={styles.space}>
        {/* DAILY TIME */}
        <Text style={styles.title}>Daily Study Hours</Text>
        <TextInput
          style={styles.input}
          value={dailyHours}
          onChangeText={setDailyHours}
          keyboardType="numeric"
        />

        {/* SUBJECT LIST */}
        {subjects.map((subject, sIdx) => (
          <View key={sIdx} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectTitle}>{subject.name}</Text>
              <TouchableOpacity onPress={() => removeSubject(sIdx)}>
                <Feather name="trash-2" size={16} color="#F8A4B3" />
              </TouchableOpacity>
            </View>

            {subject.examDate && (
              <Text style={styles.exam}>Exam: {subject.examDate}</Text>
            )}

            {/* TOPICS */}
            {subject.topics.map((t, tIdx) => (
              <View key={tIdx} style={styles.topicRow}>
                <Text style={styles.topicText}>
                  {t.name} · {t.estimatedMinutes}m
                </Text>
                <TouchableOpacity
                  onPress={() => removeTopic(sIdx, tIdx)}
                >
                  <Feather name="x" size={14} color="#999" />
                </TouchableOpacity>
              </View>
            ))}

            {/* ADD TOPIC */}
            <View style={styles.topicInputRow}>
              <TextInput
                placeholder="Topic"
                value={currentTopic}
                onChangeText={setCurrentTopic}
                style={styles.topicInput}
              />
              <TextInput
                placeholder="Min"
                value={currentMinutes}
                onChangeText={setCurrentMinutes}
                keyboardType="numeric"
                style={styles.minutesInput}
              />
              <TouchableOpacity onPress={() => addTopic(sIdx)}>
                <Feather name="plus" size={18} color="#9D96E1" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ADD SUBJECT */}
        <TextInput
          placeholder="New subject"
          value={currentSubject}
          onChangeText={setCurrentSubject}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowDatePicker(true)}
        >
          <Feather name="calendar" size={16} color="#5C5C8E" />
          <Text>
            {currentExamDate || 'Set exam date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addBtn} onPress={addSubject}>
          <Text style={styles.addText}>+ Add Subject</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SAVE */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Create Plan</Text>
        )}
      </TouchableOpacity>

      {/* DATE MODAL */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.modal}>
          <Calendar
            onDayPress={d => {
              setCurrentExamDate(d.dateString);
              setShowDatePicker(false);
            }}
          />
        </View>
      </Modal>
    </MobileCard>
  );
};

export default SetupScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center' },
  space: { padding: 16, gap: 12 },
  title: { textAlign: 'center', fontWeight: '700' },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
  },
  subjectCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subjectTitle: { fontWeight: '700', color: '#5C5C8E' },
  exam: { fontSize: 12, color: '#F8A4B3' },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  topicText: { fontSize: 12 },
  topicInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  topicInput: { flex: 1, backgroundColor: '#F7F7FF', padding: 8 },
  minutesInput: { width: 50, backgroundColor: '#F7F7FF', padding: 8 },
  addBtn: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E0F7FA',
    borderRadius: 14,
  },
  addText: { fontWeight: '700', color: '#00ACC1' },
  dateBtn: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#F8F9FF',
    borderRadius: 14,
  },
  saveBtn: {
    backgroundColor: '#9D96E1',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },
  modal: { flex: 1, justifyContent: 'center' },
});
