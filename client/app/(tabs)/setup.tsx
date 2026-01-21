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
  difficultyScore: number;
}

interface SubjectItem {
  name: string;
  examDate?: string;
  importanceLevel: number;
  topics: TopicItem[];
}
const PLACEHOLDER_COLOR = '#B8B8C7'; // soft light grey

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
  const [currentDifficulty, setCurrentDifficulty] = useState(0.5);

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
    const updated = [...subjects];
    updated.splice(index, 1);
    setSubjects(updated);
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
      difficultyScore: currentDifficulty,
    });

    setSubjects(updated);
    setCurrentTopic('');
    setCurrentMinutes('60');
    setCurrentDifficulty(0.5);
    console.log();

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

    if (currentTopic.trim()) {
      showAlert('Unsaved Topic', 'You have typed a topic but not added it. Please click "Add Topic" or clear the field.');
      return;
    }

    const totalTopics = subjects.reduce((acc, sub) => acc + sub.topics.length, 0);
    if (totalTopics === 0) {
      showAlert('No Topics', 'Please add at least one topic to your subjects so we can generate a plan.');
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
          examDate: subject.examDate || undefined,
          importanceLevel: subject.importanceLevel,
        });

        console.log(subject);


        for (const topic of subject.topics) {
          await createTopic({
            subject: createdSubject._id,
            name: topic.name,
            estimatedMinutes: topic.estimatedMinutes,
            difficultyScore: topic.difficultyScore,
          });
        }



      }

      /* 3️⃣ PLAN */
      existingProfile ? await regeneratePlan() : await generatePlan();

      showAlert('Success', 'Study plan ready!');
      router.replace('/(tabs)');
    } catch (err) {
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
        <TextInput
          style={styles.input}
          placeholder="Daily Study Hours"
          placeholderTextColor={PLACEHOLDER_COLOR}
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

            {/* IMPORTANCE */}
            <View style={styles.importanceRow}>
              <Text style={styles.label}>Importance</Text>
              <View style={styles.importanceLevels}>
                {[1, 2, 3, 4, 5].map(level => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => {
                      const updated = [...subjects];
                      updated[sIdx].importanceLevel = level;
                      setSubjects(updated);
                    }}
                    style={[
                      styles.importanceDot,
                      subject.importanceLevel >= level &&
                      styles.importanceActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            {subject.examDate && (
              <Text style={styles.exam}>Exam: {subject.examDate}</Text>
            )}

            {/* TOPICS */}
            {subject.topics.map((t, tIdx) => (
              <View key={tIdx} style={styles.topicRow}>
                <Text style={styles.topicText}>
                  {t.name} · {t.estimatedMinutes}m ·{' '}
                  {(t.difficultyScore * 100).toFixed(0)}%
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
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={currentTopic}
                onChangeText={setCurrentTopic}
                style={styles.topicInput}
              />
              <TextInput
                placeholder="Min"
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={currentMinutes}
                onChangeText={setCurrentMinutes}
                keyboardType="numeric"
                style={styles.minutesInput}
              />
            </View>

            <View style={styles.difficultyRow}>
              <Text style={styles.label}>
                Difficulty {(currentDifficulty * 100).toFixed(0)}%
              </Text>
              <View style={styles.difficultyBar}>
                {[0.2, 0.4, 0.6, 0.8, 1].map(val => (
                  <TouchableOpacity
                    key={val}
                    onPress={() => setCurrentDifficulty(val)}
                    style={[
                      styles.difficultySegment,
                      currentDifficulty >= val &&
                      styles.difficultyActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.addTopicBtn}
              onPress={() => addTopic(sIdx)}
            >
              <Feather name="plus" size={16} color="#9D96E1" />
              <Text style={styles.addTopicText}>Add Topic</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* ADD SUBJECT */}
        <TextInput
          placeholder="New subject"
          placeholderTextColor={PLACEHOLDER_COLOR}
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

  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
  },

  subjectCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },

  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  subjectTitle: { fontWeight: '700', color: '#5C5C8E' },

  exam: { fontSize: 12, color: '#F8A4B3' },

  importanceRow: {},
  importanceLevels: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  importanceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DDD',
  },
  importanceActive: {
    backgroundColor: '#9D96E1',
  },

  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topicText: { fontSize: 12 },

  topicInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  topicInput: { flex: 1, backgroundColor: '#F7F7FF', padding: 8 },
  minutesInput: { width: 60, backgroundColor: '#F7F7FF', padding: 8 },

  difficultyRow: {},
  difficultyBar: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  difficultySegment: {
    height: 6,
    width: 24,
    borderRadius: 4,
    backgroundColor: '#EEE',
  },
  difficultyActive: {
    backgroundColor: '#F8A4B3',
  },

  addTopicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  addTopicText: {
    color: '#9D96E1',
    fontWeight: '600',
  },

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

  label: {
    fontSize: 12,
    color: '#666',
  },
});
