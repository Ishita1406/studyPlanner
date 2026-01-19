import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';
import { createProfile } from '../../api/user';
import { useRouter } from 'expo-router';

const SetupScreen = () => {
    const router = useRouter();
    const [subject, setSubject] = useState('');
    const [topics, setTopics] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (!subject) {
            Alert.alert('Error', 'Please add a subject');
            return;
        }

        setLoading(true);
        try {
            // Simplified payload for now
            await createProfile({
                subjects: [{ name: subject, topics: topics.split(',').map(t => t.trim()) }]
            });
            Alert.alert("Success", "Profile updated!");
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert('Error', error as string);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileCard title="AI Study Planner" backgroundColor="#F0F7FF">
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

            <View style={styles.spaceY4}>
                <Text style={styles.sectionTitle}>What&apos;s your syllabus?</Text>

                <TextInput
                    placeholder="Subject (e.g., Mathematics)"
                    style={styles.input}
                    placeholderTextColor="#5C5C8E"
                    value={subject}
                    onChangeText={setSubject}
                />
                <TextInput
                    placeholder="Topics (comma separated)"
                    style={styles.input}
                    placeholderTextColor="#5C5C8E"
                    value={topics}
                    onChangeText={setTopics}
                />

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.addSubjectButton}>
                        <Text style={styles.addSubjectText}>Add Subject</Text>
                        <Feather name="plus" size={16} color="#4AA9FF" />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                </View>

                <View style={styles.deadlineContainer}>
                    <View style={styles.deadlineItem}>
                        <Text style={styles.deadlineText}>Deadline:</Text>
                        <Text style={styles.deadlineText}>05/20/2024</Text>
                    </View>
                    <View style={styles.deadlineItem}>
                        <Text style={styles.deadlineText}>Project Due:</Text>
                        <Text style={styles.deadlineText}>05/10/2024</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.nextButtonText}>Next</Text>
                        <Feather name="chevron-right" size={20} color="#fff" />
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
        width: 128,
        height: 128,
        borderRadius: 64,
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
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    clockBadge: {
        position: 'absolute',
        bottom: -16,
        right: -16,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    spaceY4: {
        gap: 16,
    },
    sectionTitle: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 18,
        color: '#5C5C8E',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        color: '#5C5C8E',
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#E0F2FE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#D0D0E0',
    },
    addSubjectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
    },
    addSubjectText: {
        color: '#4AA9FF',
        fontWeight: '600',
        fontSize: 12,
    },
    deadlineContainer: {
        gap: 8,
        marginTop: 16,
    },
    deadlineItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#D7E9FB',
        padding: 12,
        borderRadius: 16,
    },
    deadlineText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#5C5C8E',
    },
    nextButton: {
        backgroundColor: '#9D96E1',
        paddingVertical: 16,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
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
});
