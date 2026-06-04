import React, { useState } from 'react';
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
import { colors } from '@/src/theme/colors';
import { speak } from '@/src/lib/tts';
import { getPhrase } from '@/src/lib/darija';

type Category = 'morning' | 'evening' | 'sleep' | 'after_prayer';

const ADHKAR: Record<Category, { title: string; items: string[] }> = {
  morning: {
    title: 'أذكار الصباح',
    items: [
      'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
      'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ',
      'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ — ١٠٠ مرة',
      'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ — ٣ مرات',
      'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ — ٧ مرات',
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ — ٣ مرات',
      'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا — ٣ مرات',
    ],
  },
  evening: {
    title: 'أذكار المساء',
    items: [
      'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
      'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
      'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ — ٤ مرات',
      'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي — ٣ مرات',
      'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ — ١٠٠ مرة',
      'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ — ٣ مرات',
    ],
  },
  sleep: {
    title: 'أذكار النوم',
    items: [
      'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
      'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ — ٣ مرات',
      'سُبْحَانَ اللَّهِ — ٣٣ مرة، الْحَمْدُ لِلَّهِ — ٣٣ مرة، اللَّهُ أَكْبَرُ — ٣٤ مرة',
      'الآية: اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ — آية الكرسي',
      'قُلْ هُوَ اللَّهُ أَحَدٌ، قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، قُلْ أَعُوذُ بِرَبِّ النَّاسِ — ٣ مرات',
      'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ',
    ],
  },
  after_prayer: {
    title: 'أذكار بعد الصلاة',
    items: [
      'أَسْتَغْفِرُ اللَّهَ — ٣ مرات',
      'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ ذَا الْجَلَالِ وَالْإِكْرَامِ',
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      'سُبْحَانَ اللَّهِ — ٣٣ مرة، الْحَمْدُ لِلَّهِ — ٣٣ مرة، اللَّهُ أَكْبَرُ — ٣٣ مرة',
      'آية الكرسي — مرة واحدة',
      'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    ],
  },
};

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'morning', label: 'الصباح', icon: 'sunny-outline' },
  { key: 'evening', label: 'المساء', icon: 'moon-outline' },
  { key: 'sleep', label: 'النوم', icon: 'bed-outline' },
  { key: 'after_prayer', label: 'بعد الصلاة', icon: 'heart-outline' },
];

export default function AdhkarScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<Category>('morning');

  const current = ADHKAR[activeCategory];

  const handleListen = () => {
    speak(getPhrase('goAdhkar'));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الأذكار</Text>
        <TouchableOpacity onPress={handleListen}>
          <Ionicons name="volume-high-outline" size={24} color={colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.tab, activeCategory === cat.key && styles.tabActive]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Ionicons
              name={cat.icon as any}
              size={18}
              color={activeCategory === cat.key ? colors.white : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeCategory === cat.key && styles.tabTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 },
        ]}
      >
        <Text style={styles.sectionTitle}>{current.title}</Text>
        {current.items.map((dhikr, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dhikrCard}
            onPress={() => speak(dhikr)}
            activeOpacity={0.8}
          >
            <Text style={styles.dhikrNumber}>{index + 1}</Text>
            <Text style={styles.dhikrText}>{dhikr}</Text>
            <Ionicons name="volume-high-outline" size={18} color={colors.textMuted} style={styles.speakIcon} />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  tabs: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 15, fontFamily: 'Tajawal-Medium', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  scrollContent: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 24, fontFamily: 'Tajawal-ExtraBold', color: colors.primary, textAlign: 'center', marginBottom: 8 },
  dhikrCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dhikrNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 13,
    fontFamily: 'Tajawal-Bold',
    overflow: 'hidden',
  },
  dhikrText: { flex: 1, fontSize: 18, fontFamily: 'Tajawal-Medium', color: colors.textPrimary, textAlign: 'right', lineHeight: 30 },
  speakIcon: { marginTop: 4 },
});
