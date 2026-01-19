import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MobileCard from '../components/MobileCard';

const TodaysPlanScreen = () => {
    return (
        <MobileCard
            title="Today's Plan"
            backgroundColor="#F8F9FF"
            headerRight={<Feather name="settings" size={20} color="#9D96E1" />}
        >
            <View style={styles.dateContainer}>
                <Feather name="settings" size={12} color="#9D96E1" />
                <Text style={styles.dateText}>May 2 2024</Text>
                <Text style={styles.separator}>|</Text>
                <TouchableOpacity style={styles.adaptiveButton}>
                    <Text style={styles.adaptiveText}>Adaptive Schedule</Text>
                    <Feather name="x" size={12} color="#9D96E1" />
                </TouchableOpacity>
            </View>

            <View style={styles.spaceY4}>
                {[
                    { id: '1', title: 'Data Structures', sub: 'Binary Trees', time: '1h 15m', priority: 1, color: '#22C55E', bg: '#E8F8F2' },
                    { id: '2', title: 'Statistics', sub: 'Probability Practice', time: '45m', priority: 3, color: '#EC4899', bg: '#FDF0F3' },
                    { id: '3', title: 'Review Session', sub: 'Revise Chapter 3', time: '30m', priority: 3, color: '#3B82F6', bg: '#F0F7FF' },
                ].map(item => (
                    <View key={item.id} style={styles.taskCard}>
                        <View style={styles.taskHeader}>
                            <Text style={styles.taskTitle}>{item.id}. {item.title}</Text>
                        </View>
                        <View style={styles.taskRow}>
                            <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                                <Feather name="book" size={16} color={item.color} />
                            </View>
                            <Text style={styles.taskMeta}>{item.sub} | {item.time}</Text>
                            <View style={styles.priorityCircle}>
                                <Text style={styles.priorityText}>{item.priority}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

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
});
