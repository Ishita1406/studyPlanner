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
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { Modal } from 'react-native';

import { createProfile, getProfile, updateProfile } from '../../api/user';
import { createSubject } from '@/api/subject';
import { createTopic } from '@/api/topic';
import { getTopicBreakdown } from '@/api/ai';

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
const PLACEHOLDER_COLOR = '#B8B8C7';
const ACTIVE_COLOR = '#9D96E1';

/* ---------------- COMPONENT ---------------- */

const SetupScreen = () => {
  const router = useRouter();

  /* ---------- Profile ---------- */
  const [peakEnergy, setPeakEnergy] =
    useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  /* ---------- Subjects ---------- */
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentExamDate, setCurrentExamDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);

  /* ---------- Topics ---------- */
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentMinutes, setCurrentMinutes] = useState('');
  const [currentDifficulty, setCurrentDifficulty] = useState(0.5);

  /* ---------------- EFFECT ---------------- */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile?._id) {
          setExistingProfile(profile);
          // Set peak energy if exists
          if (profile.energyProfile && profile.energyProfile.length > 0) {
            const hour = profile.energyProfile[0].hour;
            if (hour === 9) setPeakEnergy('morning');
            if (hour === 14) setPeakEnergy('afternoon');
            if (hour === 20) setPeakEnergy('evening');
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

  const generateTopicsWithAI = async () => {
    if (!currentSubject.trim()) {
      showAlert('Error', 'Please enter a subject name first');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedTopics = await getTopicBreakdown(currentSubject.trim());

      if (!generatedTopics || generatedTopics.length === 0) {
        showAlert('Info', 'AI could not generate topics. Please add them manually.');
        setIsGenerating(false);
        return;
      }

      setSubjects(prev => [
        ...prev,
        {
          name: currentSubject.trim(),
          examDate: currentExamDate || undefined,
          importanceLevel: 3,
          topics: generatedTopics,
        },
      ]);

      setCurrentSubject('');
      setCurrentExamDate('');
      showAlert('Success', 'Topics generated successfully! You can customize them below.');

    } catch (err) {
      console.error(err);
      showAlert('Error', 'Failed to generate topics with AI');
    } finally {
      setIsGenerating(false);
    }
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
      estimatedMinutes: Number(currentMinutes) || 60, // Default to 60 if empty
      difficultyScore: currentDifficulty,
    });

    setSubjects(updated);
    setCurrentTopic('');
    setCurrentMinutes(''); // Reset to empty string
    setCurrentDifficulty(0.5);
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
      showAlert('No Topics', 'Please add at least one topic to your subjects.');
      return;
    }

    setLoading(true);

    try {
      /* 1️⃣ PROFILE */
      const profilePayload = {
        energyProfile: [
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

        for (const topic of subject.topics) {
          await createTopic({
            subject: createdSubject._id,
            name: topic.name,
            estimatedMinutes: topic.estimatedMinutes,
            difficultyScore: topic.difficultyScore,
          });
        }
      }

      showAlert('Success', 'Subjects saved! Now set your study hours on the home screen.');
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* PREFERENCES CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Study Preference</Text>
            <View style={styles.sectionHeader}>
              <Feather name="sun" size={16} color="#7C7C9E" />
              <Text style={styles.sectionLabel}>Peak Energy Time</Text>
            </View>

            <View style={styles.segmentContainer}>
              {(['morning', 'afternoon', 'evening'] as const).map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.segmentButton,
                    peakEnergy === time && styles.segmentButtonActive,
                  ]}
                  onPress={() => setPeakEnergy(time)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      peakEnergy === time && styles.segmentTextActive,
                    ]}
                  >
                    {time.charAt(0).toUpperCase() + time.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SUBJECT LIST */}
          {subjects.map((subject, sIdx) => (
            <View key={sIdx} style={styles.card}>
              <View style={styles.subjectHeader}>
                <View>
                  <Text style={styles.subjectTitle}>{subject.name}</Text>
                  {subject.examDate && (
                    <Text style={styles.examDate}>Exam: {subject.examDate}</Text>
                  )}
                </View>

                <TouchableOpacity onPress={() => removeSubject(sIdx)} style={styles.deleteBtn}>
                  <Feather name="trash-2" size={18} color="#F8A4B3" />
                </TouchableOpacity>
              </View>

              {/* IMPORTANCE */}
              <View style={styles.importanceContainer}>
                <Text style={styles.labelSmall}>Priority</Text>
                <View style={styles.dotsRow}>
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

              <View style={styles.divider} />

              {/* TOPICS LIST */}
              {subject.topics.length > 0 && (
                <View style={styles.topicList}>
                  {subject.topics.map((t, tIdx) => (
                    <View key={tIdx} style={styles.topicItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.topicName}>{t.name}</Text>
                        <Text style={styles.topicMeta}>
                          {t.estimatedMinutes}m · {t.difficultyScore > 0.7 ? 'Hard' : t.difficultyScore > 0.4 ? 'Medium' : 'Easy'}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeTopic(sIdx, tIdx)}>
                        <Feather name="x" size={16} color="#B8B8C7" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* ADD TOPIC AREA */}
              <View style={styles.addTopicArea}>
                <Text style={styles.addTopicLabel}>Add New Topic</Text>

                <TextInput
                  placeholder="Topic Name (e.g. Algebra Basics)"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={currentTopic}
                  onChangeText={setCurrentTopic}
                  style={styles.input}
                />

                <View style={styles.rowGap}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      placeholder="Min"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      value={currentMinutes}
                      onChangeText={setCurrentMinutes}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>

                  <View style={{ flex: 2 }}>
                    <View style={styles.difficultyContainer}>
                      {[0.2, 0.5, 0.8].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() => setCurrentDifficulty(val)}
                          style={[
                            styles.diffBadge,
                            currentDifficulty === val && styles.diffBadgeActive,
                          ]}
                        >
                          <Text style={[
                            styles.diffText,
                            currentDifficulty === val && styles.diffTextActive
                          ]}>
                            {val === 0.2 ? 'Easy' : val === 0.5 ? 'Med' : 'Hard'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addTopicBtn}
                  onPress={() => addTopic(sIdx)}
                >
                  <Feather name="plus-circle" size={16} color="#fff" />
                  <Text style={styles.addTopicBtnText}>Add Topic</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* ADD NEW SUBJECT CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>New Subject</Text>

            <TextInput
              placeholder="Subject Name (e.g. Mathematics)"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={currentSubject}
              onChangeText={setCurrentSubject}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <Feather name="calendar" size={18} color="#7C7C9E" />
              <Text style={styles.dateSelectorText}>
                {currentExamDate || 'Select Exam Date (Optional)'}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.addSubjectBtn} onPress={addSubject}>
                <Text style={styles.addSubjectBtnText}>+ Manual Add</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.aiBtn, isGenerating && styles.aiBtnDisabled]}
                onPress={generateTopicsWithAI}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Feather name="cpu" size={16} color="#fff" />
                    <Text style={styles.aiBtnText}>Auto-Generate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 20 }} />

        </ScrollView>
      </KeyboardAvoidingView>

      {/* SAVE */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Setup</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* DATE MODAL */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Calendar
              onDayPress={d => {
                setCurrentExamDate(d.dateString);
                setShowDatePicker(false);
              }}
              theme={{
                selectedDayBackgroundColor: ACTIVE_COLOR,
                todayTextColor: ACTIVE_COLOR,
                arrowColor: ACTIVE_COLOR,
              }}
            />
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </MobileCard>
  );
};

export default SetupScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, gap: 20, paddingBottom: 100 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#9D96E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5C5C8E',
    marginBottom: 4,
  },

  /* Preferences */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#7C7C9E' },

  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7F7FF',
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#9D96E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  segmentText: { fontSize: 13, color: '#B8B8C7', fontWeight: '500' },
  segmentTextActive: { color: ACTIVE_COLOR, fontWeight: '700' },

  /* Subject Card */
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  subjectTitle: { fontSize: 18, fontWeight: '800', color: '#5C5C8E' },
  examDate: { fontSize: 12, color: '#F8A4B3', marginTop: 2, fontWeight: '600' },
  deleteBtn: { padding: 4 },

  importanceContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  labelSmall: { fontSize: 12, color: '#B8B8C7', fontWeight: '600', textTransform: 'uppercase' },
  dotsRow: { flexDirection: 'row', gap: 6 },
  importanceDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EEE' },
  importanceActive: { backgroundColor: ACTIVE_COLOR },

  divider: { height: 1, backgroundColor: '#F0F0F8', marginVertical: 4 },

  /* Topics */
  topicList: { gap: 8 },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FF',
    padding: 10,
    borderRadius: 12,
  },
  topicName: { fontSize: 14, fontWeight: '600', color: '#5C5C8E' },
  topicMeta: { fontSize: 12, color: '#9D9DAF', marginTop: 2 },

  /* Add Topic Area */
  addTopicArea: {
    backgroundColor: '#F7F7FF',
    padding: 12,
    borderRadius: 16,
    gap: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  addTopicLabel: { fontSize: 12, fontWeight: '700', color: ACTIVE_COLOR, textTransform: 'uppercase' },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#5C5C8E',
  },

  rowGap: { flexDirection: 'row', gap: 10 },

  difficultyContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAFF',
    borderRadius: 12,
    overflow: 'hidden',
    height: 40,
  },
  diffBadge: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F7F7FF',
  },
  diffBadgeActive: { backgroundColor: '#F0F0FF' },
  diffText: { fontSize: 11, fontWeight: '600', color: '#B8B8C7' },
  diffTextActive: { color: ACTIVE_COLOR },

  addTopicBtn: {
    flexDirection: 'row',
    backgroundColor: ACTIVE_COLOR,
    padding: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addTopicBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  /* New Subject Form */
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8F9FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAFF',
  },
  dateSelectorText: { color: '#7C7C9E', fontSize: 14 },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  addSubjectBtn: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  addSubjectBtnText: { color: '#00ACC1', fontWeight: '700', fontSize: 15 },

  aiBtn: {
    flex: 1,
    backgroundColor: '#9D96E1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 8,
  },
  aiBtnDisabled: {
    opacity: 0.7,
  },
  aiBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  /* Footer */
  footer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  saveBtn: {
    backgroundColor: '#9D96E1',
    padding: 18,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#9D96E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(92, 92, 142, 0.2)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 16 },
  modalCloseBtn: { alignSelf: 'center', padding: 10, marginTop: 10 },
  modalCloseText: { color: '#9D96E1', fontWeight: '600' },
});
