import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/src/theme/colors';
import { SURAHS, Surah } from '@/src/lib/quran-data';
import { AudioPlayer } from '@/src/components/AudioPlayer';
import { RECITERS_LIST, ReciterId } from '@/src/lib/offline-audio';

const LAST_SURAH_KEY = 'zahra_last_surah';
const LAST_RECITER_KEY = 'zahra_last_reciter';

export default function QuranScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ surah?: string }>();
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<ReciterId>('alafasy');
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSaved();
  }, []);

  useEffect(() => {
    if (params.surah) {
      const surah = SURAHS.find((s) => s.number === Number(params.surah));
      if (surah) setSelectedSurah(surah);
    }
  }, [params.surah]);

  async function loadSaved() {
    const savedSurah = await AsyncStorage.getItem(LAST_SURAH_KEY);
    const savedReciter = await AsyncStorage.getItem(LAST_RECITER_KEY);
    if (savedReciter) setSelectedReciter(savedReciter as ReciterId);
    if (!params.surah && savedSurah) {
      const surah = SURAHS.find((s) => s.number === Number(savedSurah));
      if (surah) setSelectedSurah(surah);
    }
  }

  async function selectSurah(surah: Surah) {
    setSelectedSurah(surah);
    await AsyncStorage.setItem(LAST_SURAH_KEY, String(surah.number));
  }

  async function selectReciter(id: ReciterId) {
    setSelectedReciter(id);
    setShowReciterPicker(false);
    await AsyncStorage.setItem(LAST_RECITER_KEY, id);
  }

  const filtered = SURAHS.filter(
    (s) => s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase())
  );

  const currentIndex = selectedSurah ? SURAHS.findIndex((s) => s.number === selectedSurah.number) : -1;

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>القرآن الكريم</Text>
        <TouchableOpacity onPress={() => setShowReciterPicker(!showReciterPicker)}>
          <Ionicons name="mic-outline" size={24} color={colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Reciter picker */}
      {showReciterPicker && (
        <View style={styles.reciterPicker}>
          {RECITERS_LIST.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.reciterBtn, selectedReciter === r.id && styles.reciterActive]}
              onPress={() => selectReciter(r.id)}
            >
              <Text style={[styles.reciterText, selectedReciter === r.id && { color: colors.white }]}>
                {r.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Audio player (if surah selected) */}
      {selectedSurah && (
        <View style={styles.playerWrap}>
          <AudioPlayer
            surahNumber={selectedSurah.number}
            surahName={selectedSurah.name}
            reciterId={selectedReciter}
            hasPrevious={currentIndex > 0}
            hasNext={currentIndex < SURAHS.length - 1}
            onPrevious={() => {
              if (currentIndex > 0) selectSurah(SURAHS[currentIndex - 1]);
            }}
            onNext={() => {
              if (currentIndex < SURAHS.length - 1) selectSurah(SURAHS[currentIndex + 1]);
            }}
          />
        </View>
      )}

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحثي عن سورة..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
      </View>

      {/* Surah list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.number)}
        scrollEnabled={filtered.length > 0}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 },
        ]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.surahRow, selectedSurah?.number === item.number && styles.surahRowActive]}
            onPress={() => selectSurah(item)}
          >
            <View style={styles.surahNum}>
              <Text style={styles.surahNumText}>{item.number}</Text>
            </View>
            <View style={styles.surahInfo}>
              <Text style={[styles.surahName, selectedSurah?.number === item.number && { color: colors.white }]}>
                {item.name}
              </Text>
              <Text style={[styles.surahVerses, selectedSurah?.number === item.number && { color: 'rgba(255,255,255,0.7)' }]}>
                {item.versesCount} آية — {item.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
  reciterPicker: {
    backgroundColor: colors.surfaceWarm,
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reciterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  reciterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  reciterText: { fontSize: 16, fontFamily: 'Tajawal-Medium', color: colors.textPrimary },
  playerWrap: { padding: 16 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 16, fontFamily: 'Tajawal-Regular', color: colors.textPrimary },
  listContent: { paddingHorizontal: 12, gap: 8 },
  surahRow: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  surahRowActive: { backgroundColor: colors.primary },
  surahNum: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.prayerCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahNumText: { fontSize: 14, fontFamily: 'Tajawal-Bold', color: colors.primary },
  surahInfo: { flex: 1, gap: 2 },
  surahName: { fontSize: 20, fontFamily: 'Tajawal-Bold', color: colors.textPrimary, textAlign: 'right' },
  surahVerses: { fontSize: 13, fontFamily: 'Tajawal-Regular', color: colors.textMuted, textAlign: 'right' },
});
