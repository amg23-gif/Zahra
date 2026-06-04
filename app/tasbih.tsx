import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/src/theme/colors';
import { speak } from '@/src/lib/tts';
import { getPhrase } from '@/src/lib/darija';

type Mode = 33 | 99 | 0; // 0 = open

const MODES: { value: Mode; label: string }[] = [
  { value: 33, label: '٣٣' },
  { value: 99, label: '٩٩' },
  { value: 0, label: 'مفتوح' },
];

export default function TasbihScreen() {
  const insets = useSafeAreaInsets();
  const [count, setCount] = useState(0);
  const [mode, setMode] = useState<Mode>(33);
  const [done, setDone] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePress = useCallback(async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const newCount = count + 1;
    setCount(newCount);

    if (mode > 0 && newCount >= mode) {
      setDone(true);
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      speak(getPhrase('tasbihDone'));
    }
  }, [count, mode, scaleAnim]);

  const handleReset = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCount(0);
    setDone(false);
  };

  const progress = mode > 0 ? Math.min(count / mode, 1) : 0;
  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المسبحة</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Mode selector */}
      <View style={styles.modeRow}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[styles.modeBtn, mode === m.value && styles.modeBtnActive]}
            onPress={() => { setMode(m.value); setCount(0); setDone(false); }}
          >
            <Text style={[styles.modeBtnText, mode === m.value && styles.modeBtnTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Counter area */}
      <View style={styles.center}>
        {done ? (
          <View style={styles.doneWrap}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
            <Text style={styles.doneText}>الله يتقبل منك أ زهرة</Text>
          </View>
        ) : (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={styles.countBtn}
              onPress={handlePress}
              activeOpacity={0.85}
            >
              <Text style={styles.countNumber}>{count}</Text>
              {mode > 0 && (
                <Text style={styles.countTarget}>/ {mode}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Dhikr label */}
      <Text style={styles.dhikrLabel}>سبحان الله</Text>

      {/* Reset */}
      <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
        <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.resetText}>إعادة</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 22, fontFamily: 'Tajawal-Bold', color: colors.white },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  modeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeBtnText: { fontSize: 20, fontFamily: 'Tajawal-Bold', color: colors.textSecondary },
  modeBtnTextActive: { color: colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  countBtn: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    gap: 4,
  },
  countNumber: { fontSize: 72, fontFamily: 'Tajawal-ExtraBold', color: colors.white, includeFontPadding: false },
  countTarget: { fontSize: 22, fontFamily: 'Tajawal-Medium', color: 'rgba(255,255,255,0.65)' },
  doneWrap: { alignItems: 'center', gap: 20 },
  doneText: { fontSize: 24, fontFamily: 'Tajawal-Bold', color: colors.primary, textAlign: 'center' },
  dhikrLabel: {
    fontSize: 28,
    fontFamily: 'Tajawal-ExtraBold',
    color: colors.gold,
    textAlign: 'center',
    paddingBottom: 16,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  resetText: { fontSize: 18, fontFamily: 'Tajawal-Medium', color: colors.textSecondary },
});
