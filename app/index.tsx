import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/src/theme/colors';
import { BigButton } from '@/src/components/BigButton';
import { speak } from '@/src/lib/tts';
import { getPhrase } from '@/src/lib/darija';
import { getDailyWord, getTimeOfDay, getIslamicDate, getDayName } from '@/src/lib/islamic';

const LAST_SURAH_KEY = 'zahra_last_surah';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [lastSurah, setLastSurah] = useState<number | null>(null);
  const [greeting, setGreeting] = useState('');
  const [dailyWord] = useState(getDailyWord());
  const islamicDate = getIslamicDate();

  useEffect(() => {
    init();
  }, []);

  async function init() {
    // Load last surah
    const saved = await AsyncStorage.getItem(LAST_SURAH_KEY);
    if (saved) setLastSurah(Number(saved));

    // Greeting based on time
    const timeGroup = getTimeOfDay();
    const phrase = getPhrase(timeGroup);
    setGreeting(phrase);

    // Speak greeting after 700ms
    setTimeout(() => {
      speak(phrase);
    }, 700);
  }

  const navItems = [
    {
      label: 'مواقيت الصلاة',
      icon: <Ionicons name="time-outline" size={28} color={colors.white} />,
      route: '/prayers' as const,
      variant: 'primary' as const,
      phrase: 'goPrayers' as const,
    },
    {
      label: 'القرآن الكريم',
      icon: <Ionicons name="book-outline" size={28} color={colors.white} />,
      route: '/quran' as const,
      variant: 'primary' as const,
      phrase: 'resumeQuran' as const,
    },
    {
      label: 'أذكار',
      icon: <Ionicons name="heart-outline" size={28} color={colors.white} />,
      route: '/adhkar' as const,
      variant: 'secondary' as const,
      phrase: 'goAdhkar' as const,
    },
    {
      label: 'مسبحة',
      icon: <Ionicons name="infinite-outline" size={28} color={colors.white} />,
      route: '/tasbih' as const,
      variant: 'secondary' as const,
      phrase: 'goTasbih' as const,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>زهرة</Text>
        <Text style={styles.islamicDate}>{islamicDate.display}</Text>
        <Text style={styles.dayName}>{getDayName()}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting card */}
        <View style={styles.greetingCard}>
          <Text style={styles.greetingText}>{greeting}</Text>
        </View>

        {/* Daily word */}
        <View style={styles.dailyWordCard}>
          <Text style={styles.dailyWordLabel}>كلمة حلوة لزهرة</Text>
          <Text style={styles.dailyWord}>{dailyWord}</Text>
        </View>

        {/* Resume Quran button (if last surah exists) */}
        {lastSurah && (
          <BigButton
            label={`كمّلي قراءة القرآن`}
            icon={<Ionicons name="play-circle-outline" size={28} color={colors.white} />}
            variant="gold"
            onPress={() => {
              speak(getPhrase('resumeQuran'));
              router.push({ pathname: '/quran', params: { surah: String(lastSurah) } });
            }}
          />
        )}

        {/* Main navigation buttons */}
        <View style={styles.buttonsSection}>
          {navItems.map((item) => (
            <BigButton
              key={item.route}
              label={item.label}
              icon={item.icon}
              variant={item.variant}
              onPress={() => {
                speak(getPhrase(item.phrase));
                router.push(item.route as any);
              }}
            />
          ))}
        </View>

        {/* Reminds button */}
        <TouchableOpacity
          style={styles.remindsBtn}
          onPress={() => router.push('/reminds')}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          <Text style={styles.remindsBtnText}>رسل يومي</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontFamily: 'Tajawal-ExtraBold',
    color: colors.gold,
    letterSpacing: 2,
  },
  islamicDate: {
    fontSize: 15,
    fontFamily: 'Tajawal-Medium',
    color: colors.primaryLight,
    marginTop: 4,
    textAlign: 'center',
  },
  dayName: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  greetingCard: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 16,
    padding: 20,
    borderRightWidth: 4,
    borderRightColor: colors.gold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  greetingText: {
    fontSize: 20,
    fontFamily: 'Tajawal-Medium',
    color: colors.textPrimary,
    textAlign: 'right',
    lineHeight: 32,
  },
  dailyWordCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  dailyWordLabel: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  dailyWord: {
    fontSize: 17,
    fontFamily: 'Tajawal-Bold',
    color: colors.gold,
    textAlign: 'right',
    lineHeight: 28,
  },
  buttonsSection: {
    gap: 8,
    marginTop: 4,
  },
  remindsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 4,
  },
  remindsBtnText: {
    fontSize: 17,
    fontFamily: 'Tajawal-Medium',
    color: colors.primary,
  },
});
