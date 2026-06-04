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
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { speak } from '@/src/lib/tts';
import { VoiceGuide } from '@/src/components/VoiceGuide';

const C = colors.light;

type Category = 'morning' | 'evening' | 'sleep' | 'after_prayer';

interface AdhkarCategory {
  id: Category;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  items: { text: string; count: string }[];
}

const ADHKAR: AdhkarCategory[] = [
  {
    id: 'morning',
    title: 'أذكار الصباح',
    icon: 'sunny',
    color: '#e67e22',
    items: [
      { text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', count: '١ مرة' },
      { text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ', count: '١ مرة' },
      { text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ', count: '١ مرة' },
      { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: '١٠٠ مرة' },
      { text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', count: '٣ مرات' },
      { text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ', count: '٣ مرات' },
    ],
  },
  {
    id: 'evening',
    title: 'أذكار المساء',
    icon: 'moon',
    color: '#8e44ad',
    items: [
      { text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', count: '١ مرة' },
      { text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ', count: '١ مرة' },
      { text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي', count: '٣ مرات' },
      { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: '١٠٠ مرة' },
      { text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ', count: '٣ مرات' },
    ],
  },
  {
    id: 'sleep',
    title: 'أذكار النوم',
    icon: 'bed',
    color: '#2980b9',
    items: [
      { text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', count: '١ مرة' },
      { text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', count: '٣ مرات' },
      { text: 'سُبْحَانَ اللَّهِ (٣٣) — الْحَمْدُ لِلَّهِ (٣٣) — اللَّهُ أَكْبَرُ (٣٤)', count: 'مرة' },
      { text: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ — آية الكرسي', count: '١ مرة' },
      { text: 'قُلْ هُوَ اللَّهُ أَحَدٌ — قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ — قُلْ أَعُوذُ بِرَبِّ النَّاسِ', count: '٣ مرات' },
    ],
  },
  {
    id: 'after_prayer',
    title: 'أذكار بعد الصلاة',
    icon: 'hand-right',
    color: C.primary,
    items: [
      { text: 'أَسْتَغْفِرُ اللَّهَ', count: '٣ مرات' },
      { text: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ', count: '١ مرة' },
      { text: 'سُبْحَانَ اللَّهِ', count: '٣٣ مرة' },
      { text: 'الْحَمْدُ لِلَّهِ', count: '٣٣ مرة' },
      { text: 'اللَّهُ أَكْبَرُ', count: '٣٣ مرة' },
      { text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', count: '١ مرة' },
    ],
  },
];

export default function AdhkarScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Category>('morning');
  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20;

  const currentCategory = ADHKAR.find((c) => c.id === selected)!;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={28} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الأذكار</Text>
        <VoiceGuide
          message="يا زهرة، اضغطي على أي ذكر لتسمعيه بالصوت"
          autoSpeak
          delay={800}
        />
      </View>

      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
        {ADHKAR.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.tab, selected === cat.id && { backgroundColor: cat.color }]}
            onPress={() => {
              speak(cat.title);
              setSelected(cat.id);
            }}
          >
            <Ionicons name={cat.icon} size={20} color={selected === cat.id ? C.white : cat.color} />
            <Text style={[styles.tabText, { color: selected === cat.id ? C.white : cat.color }]}>
              {cat.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Adhkar list */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPadding, gap: 10 }}>
        {currentCategory.items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dhikrCard}
            onPress={async () => {
              if (Platform.OS !== 'web') {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              speak(item.text);
            }}
            activeOpacity={0.75}
          >
            <View style={styles.dhikrHeader}>
              <View style={[styles.indexBadge, { backgroundColor: currentCategory.color }]}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>
              <View style={[styles.countBadge, { borderColor: currentCategory.color }]}>
                <Text style={[styles.countText, { color: currentCategory.color }]}>{item.count}</Text>
              </View>
            </View>
            <Text style={styles.dhikrText}>{item.text}</Text>
            <View style={styles.speakHint}>
              <Ionicons name="volume-medium-outline" size={16} color={C.mutedForeground} />
              <Text style={styles.speakHintText}>اضغطي للاستماع</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  tabs: { backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: C.secondary,
  },
  tabText: { fontSize: 14, fontFamily: 'Tajawal_700Bold' },
  dhikrCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    gap: 10,
  },
  dhikrHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  indexBadge: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  indexText: { color: C.white, fontSize: 14, fontFamily: 'Tajawal_700Bold' },
  countBadge: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  countText: { fontSize: 13, fontFamily: 'Tajawal_700Bold' },
  dhikrText: { fontSize: 18, fontFamily: 'Tajawal_500Medium', color: C.foreground, textAlign: 'right', lineHeight: 30 },
  speakHint: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  speakHintText: { fontSize: 12, fontFamily: 'Tajawal_400Regular', color: C.mutedForeground },
});
