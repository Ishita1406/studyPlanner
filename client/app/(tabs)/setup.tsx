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
    Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';
import { createProfile, getProfile, updateProfile } from '../../api/user';
import { getTopicBreakdown } from '../../api/ai';
import { useRouter } from 'expo-router';

// Defines the shape of a subject in our local state
interface SubjectItem {
    name: string;
    topics: string[];
}

const SetupScreen = () => {
    const router = useRouter();

    // Form State
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [currentSubject, setCurrentSubject] = useState('');
    const [currentTopics, setCurrentTopics] = useState('');

    // Energy Profile State
    const [peakEnergy, setPeakEnergy] = useState<'morning' | 'afternoon' | 'evening' | null>(null);

    // Profile State
    const [existingProfile, setExistingProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

    // Initial Fetch: Check if profile exists
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getProfile(); // This might 404 if new user
                console.log("Existing profile:", profile);
                if (profile) {
                    setExistingProfile(profile);
                    // Pre-fill existing subjects if any
                    if (profile.subjects && Array.isArray(profile.subjects)) {
                        setSubjects(profile.subjects);
                    }
                }
            } catch (error) {
                // It's okay if profile doesn't exist yet
                console.log("No existing profile found or error fetching:", error);
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleAddSubject = () => {
        if (!currentSubject.trim()) {
            showAlert('Error', 'Please enter a subject name');
            return;
        }

        const newSubject: SubjectItem = {
            name: currentSubject.trim(),
            topics: currentTopics.split(',').map(t => t.trim()).filter(t => t.length > 0)
        };

        setSubjects([...subjects, newSubject]);
        setCurrentSubject('');
        setCurrentTopics('');
    };

    const handleRemoveSubject = (index: number) => {
        const updated = [...subjects];
        updated.splice(index, 1);
        setSubjects(updated);
    };

    const showAlert = (title: string, message: string) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}: ${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const handleAiGenerate = async () => {
        if (!currentSubject.trim()) {
            showAlert('Error', 'Please enter a Subject name first');
            return;
        }
        setAiLoading(true);
        try {
            const topics = await getTopicBreakdown(currentSubject);
            // Topics return as object array or strings? Our API returns {name, estimatedMinutes...}
            // For now, let's just extract names for the simple list
            const topicNames = Array.isArray(topics)
                ? topics.map((t: any) => t.name || t).join(', ')
                : '';

            setCurrentTopics(topicNames);
        } catch (error) {
            console.error(error);
            showAlert('Error', 'Failed to generate topics');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSave = async () => {
        if (subjects.length === 0) {
            showAlert('Error', 'Please add at least one subject');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                subjects: subjects,
                energyProfile: peakEnergy ? [{ hour: peakEnergy === 'morning' ? 9 : peakEnergy === 'afternoon' ? 14 : 20, energy: 100 }] : []
                // We can add deadline / working hours fields here later when backend supports them
            };

            // Smart Save Logic:
            // 1. Try to fetch profile again just in case (optional, relying on initial fetch usually enough)
            // 2. If we know it exists, update.
            // 3. If we think it's new, try create. If create fails with "exists", fallback to update.

            if (existingProfile) {
                console.log("Updating existing profile...");
                await updateProfile(payload);
            } else {
                console.log("Creating new profile...");
                try {
                    await createProfile(payload);
                    // If successful, we can set existingProfile to true for future (though we navigate away)
                } catch (createError: any) {
                    // Check for 409 or "exists" message
                    const errorMsg = createError.toString().toLowerCase();
                    if (errorMsg.includes('exists') || createError.status === 409) {
                        console.log("Profile already exists (caught error), switching to update...");
                        await updateProfile(payload);
                    } else {
                        // Genuine other error
                        throw createError;
                    }
                }
            }

            if (Platform.OS === 'web') {
                if (window.confirm('Profile saved! Go to dashboard?')) {
                    router.replace('/(tabs)');
                }
            } else {
                Alert.alert("Success", "Profile saved!", [
                    { text: "OK", onPress: () => router.replace('/(tabs)') }
                ]);
            }

        } catch (error: any) {
            console.error("Save error:", error);
            showAlert('Error', error as string);
        } finally {
            setLoading(false);
        }
    };

    if (profileLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#9D96E1" />
            </View>
        );
    }

    return (
        <MobileCard title={existingProfile ? "Update Syllabus" : "Setup Syllabus"} backgroundColor="#F0F7FF">
            <View style={styles.centered}>
                <View style={styles.avatarWrapper}>
                    <View style={styles.avatar}>
                        <View style={[styles.block, { backgroundColor: '#9D96E1', width: 64, height: 40 }]} />
                        <View style={[styles.block, { backgroundColor: '#F8A4B3', width: 56, height: 32, marginTop: -8 }]} />
                        <View style={[styles.block, { backgroundColor: '#A7D8E8', width: 48, height: 24, marginTop: -8 }]} />
                    </View>
                    <View style={styles.clockBadge}>
                        <Feather name="clock" size={24} color="#F8A4B3" />
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.spaceY4}>
                <Text style={styles.sectionTitle}>
                    {subjects.length > 0 ? "Your Subjects" : "Add Your Subjects"}
                </Text>

                {/* List of Added Subjects */}
                {subjects.map((subj, idx) => (
                    <View key={idx} style={styles.subjectCard}>
                        <View>
                            <Text style={styles.subjectTitle}>{subj.name}</Text>
                            <Text style={styles.subjectTopics}>
                                {subj.topics.length} topics: {subj.topics.slice(0, 3).join(', ')}{subj.topics.length > 3 ? '...' : ''}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveSubject(idx)}>
                            <Feather name="trash-2" size={18} color="#F8A4B3" />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Input Fields */}
                <View style={styles.inputGroup}>
                    <TextInput
                        placeholder="Subject (e.g., Mathematics)"
                        style={styles.input}
                        placeholderTextColor="#A0A0C0"
                        value={currentSubject}
                        onChangeText={setCurrentSubject}
                    />
                    <TextInput
                        placeholder="Topics (comma separated)"
                        style={styles.input}
                        placeholderTextColor="#A0A0C0"
                        value={currentTopics}
                        onChangeText={setCurrentTopics}
                    />

                    <TouchableOpacity
                        style={[styles.aiButton, aiLoading && styles.disabledButton]}
                        onPress={handleAiGenerate}
                        disabled={aiLoading}
                    >
                        {aiLoading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <Feather name="zap" size={16} color="#FFF" />
                                <Text style={styles.aiButtonText}>Auto-Generate Topics with AI</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.addSubjectButton} onPress={handleAddSubject}>
                        <Text style={styles.addSubjectText}>+ Add to List</Text>
                    </TouchableOpacity>
                </View>

                {/* Deadlines */}
                <View style={styles.deadlineContainer}>
                    <View style={styles.deadlineItem}>
                        <Text style={styles.deadlineLabel}>Term Ends:</Text>
                        <TextInput
                            style={styles.dateInput}
                            placeholder="MM/DD/YYYY"
                            defaultValue="05/20/2024"
                            placeholderTextColor="#C0C0E0"
                        />
                    </View>
                    <View style={styles.deadlineItem}>
                        <Text style={styles.deadlineLabel}>Project Due:</Text>
                        <TextInput
                            style={styles.dateInput}
                            placeholder="MM/DD/YYYY"
                            placeholderTextColor="#C0C0E0"
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Energy Profile Section */}
            <View style={styles.energySection}>
                <Text style={styles.sectionTitle}>When is your peak energy?</Text>
                <View style={styles.energyOptions}>
                    {(['morning', 'afternoon', 'evening'] as const).map((time) => (
                        <TouchableOpacity
                            key={time}
                            style={[
                                styles.energyOption,
                                peakEnergy === time && styles.energyOptionSelected
                            ]}
                            onPress={() => setPeakEnergy(time)}
                        >
                            <Feather
                                name={time === 'morning' ? 'sun' : time === 'afternoon' ? 'briefcase' : 'moon'}
                                size={20}
                                color={peakEnergy === time ? '#FFF' : '#9D96E1'}
                            />
                            <Text style={[
                                styles.energyText,
                                peakEnergy === time && styles.energyTextSelected
                            ]}>
                                {time.charAt(0).toUpperCase() + time.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity
                style={styles.nextButton}
                onPress={handleSave}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.nextButtonText}>{existingProfile ? "Update Plan" : "Create Plan"}</Text>
                        <Feather name="check" size={20} color="#fff" />
                    </>
                )}
            </TouchableOpacity>
        </MobileCard>
    );
};

export default SetupScreen;

const styles = StyleSheet.create({
    centered: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    block: {
        borderRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    clockBadge: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    spaceY4: {
        gap: 16,
        paddingBottom: 20,
    },
    sectionTitle: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 16,
        color: '#5C5C8E',
        marginBottom: 8,
    },
    inputGroup: {
        gap: 12,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        color: '#5C5C8E',
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },
    addSubjectButton: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#E0F7FA', // Light cyan
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#B2EBF2',
    },
    addSubjectText: {
        color: '#00ACC1',
        fontWeight: '700',
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#9D96E1',
        borderRadius: 16,
        gap: 8,
    },
    aiButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 12,
    },
    disabledButton: {
        opacity: 0.6,
    },
    subjectCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    subjectTitle: {
        fontWeight: '700',
        color: '#5C5C8E',
        fontSize: 14,
    },
    subjectTopics: {
        color: '#A0A0C0',
        fontSize: 12,
        maxWidth: 200,
    },
    deadlineContainer: {
        gap: 8,
        marginTop: 8,
    },
    deadlineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },
    deadlineLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#5C5C8E',
    },
    dateInput: {
        fontSize: 12,
        color: '#5C5C8E',
        fontWeight: '500',
        textAlign: 'right',
        minWidth: 100,
    },
    nextButton: {
        backgroundColor: '#9D96E1',
        paddingVertical: 16,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        shadowColor: '#9D96E1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    energySection: {
        marginTop: 16,
        marginBottom: 16,
    },
    energyOptions: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
    },
    energyOption: {
        flex: 1,
        padding: 12,
        borderRadius: 16,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0F2FE',
        alignItems: 'center',
        gap: 8,
    },
    energyOptionSelected: {
        backgroundColor: '#9D96E1',
        borderColor: '#9D96E1',
    },
    energyText: {
        fontSize: 12,
        color: '#5C5C8E',
        fontWeight: '600',
    },
    energyTextSelected: {
        color: '#FFF',
    },
});
