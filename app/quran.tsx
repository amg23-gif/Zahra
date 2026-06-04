import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';
import { SURAHS, Surah, FEATURED_SURAHS } from '@/src/lib/quran-data';
import { AudioPlayer } from '@/src/components/AudioPlayer';
import { RECITERS, ReciterId } from '@/src/lib/offline-audio';
import { speak } from '@/src/lib/tts';
import { VoiceGuide } from '@/src/components/VoiceGuide';

const C = colors.light;
const LAST_SURAH_KEY = 'zahra_last_surah';
const LAST_RECITER_KEY = 'zahra_last_reciter';

export default function QuranScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ surah?: string }>();
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<ReciterId>('alafasy');
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [showFeatured, setShowFeatured] = useState(true);

  useEffect(() => { loadSaved(); }, []);
  useEffect(() => {
    if (params.surah) {
      const surah = SURAHS.find((s) => s.number === Number(params.surah));
      if (surah) setSelectedSurah(surah);
    }
  }, [params.surah]);

  async function loadSaved() {
    const savedReciter = await AsyncStorage.getItem(LAST_RECITER_KEY);
    if (savedReciter) setSelectedReciter(savedReciter as ReciterId);
    if (!params.surah) {
      const savedSurah = await AsyncStorage.getItem(LAST_SURAH_KEY);
      if (savedSurah) {
        const surah = SURAHS.find((s) => s.number === Number(savedSurah));
        if (surah) setSelectedSurah(surah);
      }
    }
  }

  async function selectSurah(surah: Surah) {
    speak(`سورة ${surah.name}`);
    setSelectedSurah(surah);
    await AsyncStorage.setItem(LAST_SURAH_KEY, String(surah.number));
  }

  async function selectReciter(id: ReciterId) {
    const reciter = RECITERS.find((r) => r.id === id);
    if (reciter) speak(`القارئ ${reciter.arabicName}`);
    setSelectedReciter(id);
    setShowReciterPicker(false);
    await AsyncStorage.setItem(LAST_RECITER_KEY, id);
  }

  const currentIndex = selectedSurah ? SURAHS.findIndex((s) => s.number === selectedSurah.number) : -1;
  const featuredSurahs = SURAHS.filter((s) => FEATURED_SURAHS.includes(s.number));
  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20;
  const currentReciter = RECITERS.find((r) => r.id === selectedReciter);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={28} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>القرآن الكريم</Text>
        <VoiceGuide
          message="يا زهرة، اضغطي على اسم السورة لتسمعيها. يمكنك اختيار القارئ الذي تحبينه"
          autoSpeak
          delay={800}
        />
      </View>

      {/* Reciter selector */}
      <TouchableOpacity
        style={styles.reciterBar}
        onPress={() => {
          speak('اختاري القارئ الذي تحبينه يا زهرة');
          setShowReciterPicker(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="person-circle" size={22} color={C.primary} />
        <Text style={styles.reciterName}>{currentReciter?.arabicName ?? 'اختاري القارئ'}</Text>
        <Ionicons name="chevron-down" size={18} color={C.primary} />
      </TouchableOpacity>

      {/* Audio player */}
      {selectedSurah && (
        <AudioPlayer
          surahNumber={selectedSurah.number}
          surahName={selectedSurah.name}
          reciterId={selectedReciter}
          hasPrevious={currentIndex > 0}
          hasNext={currentIndex < SURAHS.length - 1}
          onPrevious={() => currentIndex > 0 && selectSurah(SURAHS[currentIndex - 1]!)}
          onNext={() => currentIndex < SURAHS.length - 1 && selectSurah(SURAHS[currentIndex + 1]!)}
        />
      )}

      {/* Featured toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, showFeatured && styles.toggleActive]}
          onPress={() => setShowFeatured(true)}
        >
          <Text style={[styles.toggleText, showFeatured && styles.toggleActiveText]}>السور المشهورة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, !showFeatured && styles.toggleActive]}
          onPress={() => setShowFeatured(false)}
        >
          <Text style={[styles.toggleText, !showFeatured && styles.toggleActiveText]}>كل السور</Text>
        </TouchableOpacity>
      </View>

      {/* Surahs list */}
      <FlatList
        data={showFeatured ? featuredSurahs : SURAHS}
        keyExtractor={(item) => String(item.number)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPadding, gap: 6 }}
        renderItem={({ item }) => {
          const isSelected = selectedSurah?.number === item.number;
          return (
            <TouchableOpacity
              style={[styles.surahRow, isSelected && styles.surahSelected]}
              onPress={() => selectSurah(item)}
              activeOpacity={0.75}
            >
              <View style={[styles.surahNum, { backgroundColor: isSelected ? C.white + '30' : C.secondary }]}>
                <Text style={[styles.surahNumText, { color: isSelected ? C.white : C.primary }]}>
                  {item.number}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.surahName, { color: isSelected ? C.white : C.foreground }]}>
                  {item.name}
                </Text>
                <Text style={[styles.surahVerses, { color: isSelected ? 'rgba(255,255,255,0.7)' : C.mutedForeground }]}>
                  {item.versesCount} آية — {item.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                </Text>
              </View>
              <Ionicons
                name={isSelected ? 'volume-high' : 'play-circle-outline'}
                size={26}
                color={isSelected ? C.gold : C.primary}
              />
            </TouchableOpacity>
          );
        }}
      />

      {/* Reciter picker modal */}
      <Modal visible={showReciterPicker} transparent animationType="slide" onRequestClose={() => setShowReciterPicker(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>اختاري القارئ</Text>
            <ScrollView>
              {RECITERS.map((reciter) => (
                <TouchableOpacity
                  key={reciter.id}
                  style={[styles.reciterOption, selectedReciter === reciter.id && styles.reciterOptionSelected]}
                  onPress={() => selectReciter(reciter.id)}
                >
                  <Ionicons
                    name={selectedReciter === reciter.id ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={C.primary}
                  />
                  <Text style={styles.reciterOptionText}>{reciter.arabicName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowReciterPicker(false)}>
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  reciterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    margin: 12,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: C.primary + '40',
  },
  reciterName: { flex: 1, fontSize: 17, fontFamily: 'Tajawal_700Bold', color: C.primary, textAlign: 'right' },
  toggleRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: C.primary },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: C.card },
  toggleActive: { backgroundColor: C.primary },
  toggleText: { fontSize: 15, fontFamily: 'Tajawal_700Bold', color: C.primary },
  toggleActiveText: { color: C.white },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  surahSelected: { backgroundColor: C.primary },
  surahNum: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  surahNumText: { fontSize: 15, fontFamily: 'Tajawal_700Bold' },
  surahName: { fontSize: 18, fontFamily: 'Tajawal_700Bold' },
  surahVerses: { fontSize: 13, fontFamily: 'Tajawal_400Regular', marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '75%' },
  modalTitle: { fontSize: 22, fontFamily: 'Tajawal_700Bold', color: C.foreground, textAlign: 'center', marginBottom: 16 },
  reciterOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  reciterOptionSelected: { backgroundColor: C.secondary, borderRadius: 12 },
  reciterOptionText: { fontSize: 18, fontFamily: 'Tajawal_500Medium', color: C.foreground, flex: 1, textAlign: 'right' },
  cancelBtn: { marginTop: 12, paddingVertical: 14, borderRadius: 12, backgroundColor: C.muted, alignItems: 'center' },
  cancelText: { fontSize: 17, fontFamily: 'Tajawal_700Bold', color: C.mutedForeground },
});
