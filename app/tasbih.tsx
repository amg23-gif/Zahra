import React, { useState, useCallback, useRef } from 'react';
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
import colors from '@/constants/colors';
import { speak } from '@/src/lib/tts';
import { getPhrase } from '@/src/lib/darija';
import { VoiceGuide } from '@/src/components/VoiceGuide';

const C = colors.light;
type Mode = 33 | 99 | 0;

const MODES: { value: Mode; label: string }[] = [
  { value: 33, label: '٣٣' },
  { value: 99, label: '٩٩' },
  { value: 0, label: 'مفتوح' },
];

const TASBIH_PHRASES = [
  'سُبْحَانَ اللَّهِ',
  'الْحَمْدُ لِلَّهِ',
  'اللَّهُ أَكْبَرُ',
  'لَا إِلَهَ إِلَّا اللَّهُ',
];

export default function TasbihScreen() {
  const insets = useSafeAreaInsets();
  const [count, setCount] = useState(0);
  const [mode, setMode] = useState<Mode>(33);
  const [done, setDone] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 24;

  const handlePress = useCallback(async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
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
  const progressDeg = progress * 360;
  const currentPhrase = TASBIH_PHRASES[phraseIndex % TASBIH_PHRASES.length] ?? 'سُبْحَانَ اللَّهِ';

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={28} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المسبحة</Text>
        <VoiceGuide
          message="يا زهرة، اضغطي على الدائرة الكبيرة للتسبيح"
          autoSpeak
          delay={800}
        />
      </View>

      {/* Mode selector */}
      <View style={styles.modeRow}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[styles.modeBtn, mode === m.value && styles.modeActive]}
            onPress={() => {
              speak(m.value === 0 ? 'تسبيح مفتوح' : `${m.label} مرة`);
              setMode(m.value);
              setCount(0);
              setDone(false);
            }}
          >
            <Text style={[styles.modeBtnText, mode === m.value && styles.modeActiveText]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Phrase selector */}
      <View style={styles.phraseRow}>
        {TASBIH_PHRASES.map((phrase, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.phraseBtn, phraseIndex === i && styles.phraseActive]}
            onPress={() => { speak(phrase); setPhraseIndex(i); }}
          >
            <Text style={[styles.phraseBtnText, phraseIndex === i && styles.phraseActiveText]} numberOfLines={1}>
              {phrase.split(' ').slice(0, 2).join(' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Current phrase */}
      <TouchableOpacity onPress={() => speak(currentPhrase)} style={styles.phraseDisplay}>
        <Text style={styles.phraseDisplayText}>{currentPhrase}</Text>
        <Ionicons name="volume-medium-outline" size={18} color={C.primary} />
      </TouchableOpacity>

      {/* Big tasbih button */}
      <View style={styles.counterSection}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.85}
            style={[styles.tasbihBtn, done && styles.tasbihBtnDone]}
          >
            <View style={styles.tasbihInner}>
              <Text style={styles.countNumber}>{count}</Text>
              {mode > 0 && (
                <Text style={styles.countTotal}>/ {mode}</Text>
              )}
            </View>
            <Text style={styles.tapHint}>{done ? 'اكتمل ✓' : 'اضغطي هنا'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Progress dots */}
      {mode > 0 && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
        </View>
      )}

      {/* Reset */}
      <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
        <Ionicons name="refresh" size={22} color={C.mutedForeground} />
        <Text style={styles.resetText}>إعادة</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 22, fontFamily: 'Tajawal_700Bold', color: C.white },
  modeRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, padding: 16, backgroundColor: C.card },
  modeBtn: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, backgroundColor: C.secondary, borderWidth: 1.5, borderColor: C.border },
  modeActive: { backgroundColor: C.primary, borderColor: C.primary },
  modeBtnText: { fontSize: 18, fontFamily: 'Tajawal_700Bold', color: C.mutedForeground },
  modeActiveText: { color: C.white },
  phraseRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingVertical: 10, flexWrap: 'wrap', justifyContent: 'center' },
  phraseBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: C.secondary, borderWidth: 1, borderColor: C.border },
  phraseActive: { backgroundColor: C.gold, borderColor: C.gold },
  phraseBtnText: { fontSize: 13, fontFamily: 'Tajawal_700Bold', color: C.mutedForeground },
  phraseActiveText: { color: C.white },
  phraseDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  phraseDisplayText: { fontSize: 20, fontFamily: 'Tajawal_700Bold', color: C.primary, textAlign: 'center' },
  counterSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tasbihBtn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  tasbihBtnDone: { backgroundColor: C.success ?? C.primary },
  tasbihInner: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  countNumber: { fontSize: 64, fontFamily: 'Tajawal_800ExtraBold', color: C.white },
  countTotal: { fontSize: 22, fontFamily: 'Tajawal_500Medium', color: 'rgba(255,255,255,0.7)' },
  tapHint: { fontSize: 15, fontFamily: 'Tajawal_500Medium', color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  progressBar: { height: 8, backgroundColor: C.secondary, marginHorizontal: 32, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: C.gold, borderRadius: 4 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  resetText: { fontSize: 17, fontFamily: 'Tajawal_500Medium', color: C.mutedForeground },
});
