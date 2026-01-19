import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';
import { getTodayPlan } from '../../api/studyPlan';

const TodaysPlanScreen = () => {
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchPlan = async () => {
        setLoading(true);
        try {
            const data = await getTodayPlan();
            setPlan(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlan();
    }, []);

    const formatDate = (dateString?: string) => {
        if (!dateString) return new Date().toDateString();
        return new Date(dateString).toDateString();
    };

    return (
        <MobileCard
            title="Today's Plan"
            backgroundColor="#F8F9FF"
            headerRight={<Feather name="settings" size={20} color="#9D96E1" />}
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
                <ActivityIndicator size="large" color="#9D96E1" style={{ marginTop: 20 }} />
            ) : !plan || !plan.tasks || plan.tasks.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No plan generated for today.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.spaceY4}>
                    {plan.tasks.map((item: any, index: number) => (
                        <View key={item._id || index} style={styles.taskCard}>
                            <View style={styles.taskHeader}>
                                <Text style={styles.taskTitle}>{index + 1}. {item.topic?.name || 'Topic'}</Text>
                            </View>
                            <View style={styles.taskRow}>
                                <View style={[styles.iconCircle, { backgroundColor: '#E8F8F2' }]}>
                                    <Feather name="book" size={16} color="#22C55E" />
                                </View>
                                <Text style={styles.taskMeta}>
                                    {item.topic?.subject || 'Subject'} | {item.plannedMinutes}m
                                </Text>
                                <View style={styles.priorityCircle}>
                                    <Text style={styles.priorityText}>{item.priority || 1}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#67C7A6' }]}>
                    <Text style={styles.actionText}>Start Studying</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F8A4B3', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={styles.actionText}>Skip Day</Text>
                    <Feather name="chevron-right" size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        </MobileCard>
    );
};

export default TodaysPlanScreen;

const styles = StyleSheet.create({
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9D96E1',
    },
    separator: {
        color: '#D0D0E0',
        fontSize: 12,
    },
    adaptiveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    adaptiveText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9D96E1',
    },
    spaceY4: {
        gap: 16,
    },
    taskCard: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F0F0F8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    taskTitle: {
        fontWeight: '700',
        fontSize: 14,
        color: '#5C5C8E',
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconCircle: {
        padding: 8,
        borderRadius: 12,
    },
    taskMeta: {
        fontSize: 12,
        color: '#6B7280',
        flex: 1,
        marginLeft: 8,
    },
    priorityCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 32,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    actionText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyText: {
        color: '#A0A0C0',
        fontSize: 14,
    },
});
