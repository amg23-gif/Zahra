import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';
import { speak } from '@/src/lib/tts';
import { getPhrase } from '@/src/lib/darija';
import { getDailyWord, getTimeOfDay, getIslamicDate, getDayName } from '@/src/lib/islamic';
import { EmergencyButton } from '@/src/components/EmergencyButton';
import { VoiceGuide } from '@/src/components/VoiceGuide';

const C = colors.light;
const LAST_SURAH_KEY = 'zahra_last_surah';

interface NavItem {
  label: string;
  subLabel: string;
  iconName: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  speakMsg: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'أوقات الصلاة',
    subLabel: 'الصلوات الخمس',
    iconName: 'time',
    route: '/prayers',
    color: C.primary,
    speakMsg: 'جاري فتح مواقيت الصلاة يا زهرة',
  },
  {
    label: 'القرآن الكريم',
    subLabel: '١١٤ سورة',
    iconName: 'book',
    route: '/quran',
    color: C.gold,
    speakMsg: 'جاري فتح القرآن الكريم يا زهرة',
  },
  {
    label: 'الأذكار',
    subLabel: 'صباح ومساء',
    iconName: 'heart',
    route: '/adhkar',
    color: '#7b4fa6',
    speakMsg: 'جاري فتح الأذكار يا زهرة',
  },
  {
    label: 'المسبحة',
    subLabel: '٣٣ — ٩٩',
    iconName: 'ellipse',
    route: '/tasbih',
    color: '#2980b9',
    speakMsg: 'جاري فتح المسبحة يا زهرة',
  },
  {
    label: 'تذكير الدواء',
    subLabel: 'تنبيه بالصوت',
    iconName: 'medical',
    route: '/medicine',
    color: '#e74c3c',
    speakMsg: 'جاري فتح تذكير الدواء يا زهرة',
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [lastSurah, setLastSurah] = useState<number | null>(null);
  const [greeting, setGreeting] = useState('');
  const [dailyWord] = useState(getDailyWord());
  const islamicDate = getIslamicDate();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    init();
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  async function init() {
    const saved = await AsyncStorage.getItem(LAST_SURAH_KEY);
    if (saved) setLastSurah(Number(saved));
    const timeGroup = getTimeOfDay();
    const phrase = getPhrase(timeGroup);
    setGreeting(phrase);
    setTimeout(() => speak(phrase), 700);
  }

  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 24;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.appName}>زهرة</Text>
            <Text style={styles.islamicDate}>{islamicDate.display}</Text>
            <Text style={styles.dayName}>{getDayName()}</Text>
          </View>
          <VoiceGuide message={greeting} autoSpeak={false} style={styles.voiceBtn} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPadding, paddingTop: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting card */}
        <Animated.View style={[styles.greetingCard, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={() => speak(greeting)}
            activeOpacity={0.8}
            style={styles.greetingInner}
          >
            <Ionicons name="volume-high" size={22} color={C.gold} style={{ marginBottom: 6 }} />
            <Text style={styles.greetingText}>{greeting}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Daily ayah */}
        <View style={styles.ayahCard}>
          <Text style={styles.ayahLabel}>آية اليوم</Text>
          <TouchableOpacity onPress={() => speak(dailyWord)} activeOpacity={0.8}>
            <Text style={styles.ayahText}>{dailyWord}</Text>
            <View style={styles.speakRow}>
              <Ionicons name="volume-medium-outline" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.speakHint}>اضغطي للاستماع</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Resume Quran */}
        {lastSurah && (
          <TouchableOpacity
            style={styles.resumeBtn}
            onPress={() => {
              speak('جاري استكمال القرآن من حيث توقفتِ يا زهرة');
              router.push({ pathname: '/quran', params: { surah: String(lastSurah) } });
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle" size={32} color={C.white} />
            <Text style={styles.resumeText}>كمّلي القرآن من حيث توقفتِ</Text>
          </TouchableOpacity>
        )}

        {/* Main Nav Grid */}
        <View style={styles.grid}>
          {NAV_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={[styles.card, { borderTopColor: item.color }]}
              onPress={() => {
                speak(item.speakMsg);
                router.push(item.route as never);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.cardIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.iconName} size={34} color={item.color} />
              </View>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardSub}>{item.subLabel}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency */}
        <EmergencyButton style={styles.emergency} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitles: { alignItems: 'center', flex: 1 },
  settingsBtn: { padding: 8 },
  voiceBtn: {},
  appName: {
    fontSize: 40,
    fontFamily: 'Tajawal_800ExtraBold',
    color: C.gold,
    letterSpacing: 2,
  },
  islamicDate: {
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  dayName: {
    fontSize: 12,
    fontFamily: 'Tajawal_400Regular',
    color: 'rgba(255,255,255,0.55)',
  },
  scroll: { flex: 1 },
  greetingCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 18,
    borderRightWidth: 5,
    borderRightColor: C.gold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  greetingInner: { alignItems: 'center' },
  greetingText: {
    fontSize: 19,
    fontFamily: 'Tajawal_500Medium',
    color: C.foreground,
    textAlign: 'center',
    lineHeight: 30,
  },
  ayahCard: {
    backgroundColor: C.primary,
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  ayahLabel: {
    fontSize: 13,
    fontFamily: 'Tajawal_400Regular',
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'right',
  },
  ayahText: {
    fontSize: 17,
    fontFamily: 'Tajawal_700Bold',
    color: C.gold,
    textAlign: 'right',
    lineHeight: 28,
  },
  speakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    justifyContent: 'flex-end',
  },
  speakHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Tajawal_400Regular',
  },
  resumeBtn: {
    backgroundColor: C.gold,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  resumeText: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    color: C.white,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    color: C.foreground,
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 13,
    fontFamily: 'Tajawal_400Regular',
    color: C.mutedForeground,
    textAlign: 'center',
  },
  emergency: {
    marginTop: 4,
    alignSelf: 'stretch',
  },
});
