import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { speak } from '@/src/lib/tts';
import { VoiceGuide } from '@/src/components/VoiceGuide';

const C = colors.light;
const MEDICINE_KEY = 'zahra_medicines';

interface Medicine {
  id: string;
  name: string;
  time: string;
  taken: boolean;
  lastTakenDate: string;
}

const DEFAULT_MEDICINES: Medicine[] = [
  { id: '1', name: 'الدواء الصباحي', time: '08:00', taken: false, lastTakenDate: '' },
  { id: '2', name: 'الدواء المسائي', time: '20:00', taken: false, lastTakenDate: '' },
];

export default function MedicineScreen() {
  const insets = useSafeAreaInsets();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 24;

  useEffect(() => { loadMedicines(); }, []);

  async function loadMedicines() {
    const saved = await AsyncStorage.getItem(MEDICINE_KEY);
    const today = new Date().toDateString();
    const list: Medicine[] = saved ? JSON.parse(saved) : DEFAULT_MEDICINES;
    // Reset taken status for new day
    const reset = list.map((m) => ({ ...m, taken: m.lastTakenDate === today ? m.taken : false }));
    setMedicines(reset);
    await AsyncStorage.setItem(MEDICINE_KEY, JSON.stringify(reset));

    // Announce
    const notTaken = reset.filter((m) => !m.taken);
    if (notTaken.length > 0) {
      setTimeout(() => {
        speak(`يا زهرة، عندك ${notTaken.length} دواء لم تأخذيه بعد`);
      }, 800);
    } else {
      setTimeout(() => {
        speak('يا زهرة، أخذتِ كل أدويتك اليوم، الله يشفيك');
      }, 800);
    }
  }

  async function toggleMedicine(id: string) {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const today = new Date().toDateString();
    const updated = medicines.map((m) => {
      if (m.id !== id) return m;
      const taken = !m.taken;
      if (taken) speak(`بارك الله فيك يا زهرة، أخذتِ ${m.name}`);
      else speak(`يا زهرة، لا تنسي تأخذي ${m.name}`);
      return { ...m, taken, lastTakenDate: taken ? today : m.lastTakenDate };
    });
    setMedicines(updated);
    await AsyncStorage.setItem(MEDICINE_KEY, JSON.stringify(updated));
  }

  async function addMedicine() {
    if (!newName.trim()) return;
    const newMed: Medicine = {
      id: Date.now().toString(),
      name: newName.trim(),
      time: newTime,
      taken: false,
      lastTakenDate: '',
    };
    const updated = [...medicines, newMed];
    setMedicines(updated);
    await AsyncStorage.setItem(MEDICINE_KEY, JSON.stringify(updated));
    speak(`تمت إضافة ${newMed.name} يا زهرة`);
    setNewName('');
    setShowAdd(false);
  }

  async function deleteMedicine(id: string) {
    const med = medicines.find((m) => m.id === id);
    const updated = medicines.filter((m) => m.id !== id);
    setMedicines(updated);
    await AsyncStorage.setItem(MEDICINE_KEY, JSON.stringify(updated));
    if (med) speak(`تم حذف ${med.name}`);
  }

  const takenCount = medicines.filter((m) => m.taken).length;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={28} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تذكير الدواء</Text>
        <VoiceGuide
          message="يا زهرة، اضغطي على الدواء عندما تأخذيه ليتحول للأخضر"
          autoSpeak
          delay={800}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPadding, paddingTop: 16, gap: 12 }}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{takenCount}</Text>
            <Text style={styles.summaryLabel}>أُخذت</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: C.destructive }]}>{medicines.length - takenCount}</Text>
            <Text style={styles.summaryLabel}>متبقية</Text>
          </View>
          <TouchableOpacity
            style={styles.speakSummaryBtn}
            onPress={() => speak(`أخذتِ ${takenCount} دواء من ${medicines.length} يا زهرة`)}
          >
            <Ionicons name="volume-high" size={24} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* Medicines list */}
        {medicines.map((med) => (
          <View key={med.id} style={styles.medRow}>
            <TouchableOpacity
              style={[styles.medCard, med.taken && styles.medTaken]}
              onPress={() => toggleMedicine(med.id)}
              activeOpacity={0.8}
            >
              <View style={styles.medLeft}>
                <View style={[styles.checkCircle, med.taken && styles.checkCircleDone]}>
                  {med.taken && <Ionicons name="checkmark" size={22} color={C.white} />}
                </View>
                <View>
                  <Text style={[styles.medName, med.taken && styles.medNameTaken]}>{med.name}</Text>
                  <Text style={styles.medTime}>⏰ {med.time}</Text>
                </View>
              </View>
              <Ionicons
                name="volume-medium-outline"
                size={22}
                color={med.taken ? C.white + '80' : C.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteMedicine(med.id)}
            >
              <Ionicons name="trash-outline" size={20} color={C.destructive} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add medicine */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            speak('اضغطي لإضافة دواء جديد يا زهرة');
            setShowAdd(true);
          }}
        >
          <Ionicons name="add-circle" size={26} color={C.primary} />
          <Text style={styles.addText}>إضافة دواء جديد</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>دواء جديد</Text>
            <TextInput
              style={styles.input}
              placeholder="اسم الدواء"
              value={newName}
              onChangeText={setNewName}
              textAlign="right"
              placeholderTextColor={C.mutedForeground}
            />
            <TextInput
              style={styles.input}
              placeholder="وقت الدواء (مثال: 08:00)"
              value={newTime}
              onChangeText={setNewTime}
              textAlign="right"
              placeholderTextColor={C.mutedForeground}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={addMedicine}>
              <Text style={styles.saveText}>حفظ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
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
    backgroundColor: '#c0392b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 22, fontFamily: 'Tajawal_700Bold', color: C.white },
  summaryCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryItem: { alignItems: 'center', gap: 4 },
  summaryNum: { fontSize: 36, fontFamily: 'Tajawal_800ExtraBold', color: C.success ?? C.primary },
  summaryLabel: { fontSize: 15, fontFamily: 'Tajawal_500Medium', color: C.mutedForeground },
  summaryDivider: { width: 1, height: 48, backgroundColor: C.border },
  speakSummaryBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  medCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  medTaken: { backgroundColor: '#27ae60' },
  medLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  checkCircleDone: { backgroundColor: 'rgba(255,255,255,0.3)', borderColor: C.white },
  medName: { fontSize: 18, fontFamily: 'Tajawal_700Bold', color: C.foreground },
  medNameTaken: { color: C.white },
  medTime: { fontSize: 14, fontFamily: 'Tajawal_400Regular', color: C.mutedForeground, marginTop: 2 },
  deleteBtn: { padding: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 16, borderWidth: 2, borderColor: C.primary, borderStyle: 'dashed' },
  addText: { fontSize: 18, fontFamily: 'Tajawal_700Bold', color: C.primary },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12 },
  modalTitle: { fontSize: 22, fontFamily: 'Tajawal_700Bold', color: C.foreground, textAlign: 'center', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: C.border, borderRadius: 14, padding: 14, fontSize: 17, fontFamily: 'Tajawal_500Medium', color: C.foreground, backgroundColor: C.background },
  saveBtn: { backgroundColor: C.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  saveText: { color: C.white, fontSize: 18, fontFamily: 'Tajawal_700Bold' },
  cancelBtn: { backgroundColor: C.muted, borderRadius: 14, padding: 14, alignItems: 'center' },
  cancelText: { color: C.mutedForeground, fontSize: 17, fontFamily: 'Tajawal_500Medium' },
});
