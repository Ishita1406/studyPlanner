import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface MobileCardProps {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  headerLeft?: React.ReactNode;
  footer?: React.ReactNode;
  bgClass?: string;
  backgroundColor?: string;
  showBack?: boolean;
}

const MobileCard: React.FC<MobileCardProps> = ({
  title,
  onBack,
  children,
  headerRight,
  headerLeft,
  footer,
  bgClass, // keeping for backward compatibility if needed, but mostly unused now
  backgroundColor = '#fff',
  showBack = false
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {headerLeft ? (
            headerLeft
          ) : showBack ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
            >
              <Feather name="chevron-left" size={24} color="#9D96E1" />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerRight}>
          {headerRight}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {/* Footer */}
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // borderRadius: 40, // Removing border radius for full screen feel if needed, or keeping it
    // overflow: 'hidden',
    // borderWidth: 8,
    // borderColor: '#fff',
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  header: {
    padding: 24,
    paddingTop: 60, // status bar space
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 8,
    borderRadius: 9999,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C5C8E',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footer: {
    padding: 24,
    paddingTop: 8,
    zIndex: 10,
  },
});

export default MobileCard;
