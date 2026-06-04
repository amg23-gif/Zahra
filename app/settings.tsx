import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';
import { speak } from '@/src/lib/tts';
import type { EmergencyContact } from '@/src/components/EmergencyButton';

const C = colors.light;
const EMERGENCY_CONTACTS_KEY = 'zahra_emergency_contacts';

const DEFAULT_CONTACTS: EmergencyContact[] = [
  { id: '1', name: 'الابن', phone: '0600000001' },
  { id: '2', name: 'البنت', phone: '0600000002' },
  { id: '3', name: 'الطوارئ', phone: '15' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<EmergencyContact[]>(DEFAULT_CONTACTS);
  const [showAdd, setShowAdd] = useState(false);
  const [editContact, setEditContact] = useState<EmergencyContact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 24;

  useEffect(() => { loadContacts(); }, []);

  async function loadContacts() {
    const saved = await AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY);
    if (saved) setContacts(JSON.parse(saved));
    setTimeout(() => speak('يا زهرة، هنا يمكنك ضبط أسماء وأرقام العائلة'), 700);
  }

  async function saveContacts(list: EmergencyContact[]) {
    setContacts(list);
    await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(list));
  }

  async function addOrEdit() {
    if (!name.trim() || !phone.trim()) return;
    let updated: EmergencyContact[];
    if (editContact) {
      updated = contacts.map((c) => c.id === editContact.id ? { ...c, name: name.trim(), phone: phone.trim() } : c);
      speak(`تم تحديث ${name.trim()}`);
    } else {
      const newContact: EmergencyContact = { id: Date.now().toString(), name: name.trim(), phone: phone.trim() };
      updated = [...contacts, newContact];
      speak(`تمت إضافة ${name.trim()}`);
    }
    await saveContacts(updated);
    setShowAdd(false);
    setEditContact(null);
    setName('');
    setPhone('');
  }

  async function deleteContact(id: string) {
    const c = contacts.find((x) => x.id === id);
    const updated = contacts.filter((x) => x.id !== id);
    await saveContacts(updated);
    if (c) speak(`تم حذف ${c.name}`);
  }

  const openEdit = (c: EmergencyContact) => {
    setEditContact(c);
    setName(c.name);
    setPhone(c.phone);
    setShowAdd(true);
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={28} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPadding, paddingTop: 20, gap: 16 }}>
        <Text style={styles.sectionTitle}>أرقام العائلة للطوارئ</Text>
        <Text style={styles.sectionHint}>اضغطي على الاسم لتعديله، أو اضغطي إضافة لرقم جديد</Text>

        {contacts.map((c) => (
          <View key={c.id} style={styles.contactRow}>
            <TouchableOpacity style={styles.contactCard} onPress={() => openEdit(c)} activeOpacity={0.8}>
              <Ionicons name="person-circle" size={40} color={C.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactPhone}>{c.phone}</Text>
              </View>
              <Ionicons name="pencil-outline" size={20} color={C.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteContact(c.id)}>
              <Ionicons name="trash-outline" size={22} color={C.destructive} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditContact(null);
            setName('');
            setPhone('');
            speak('اضغطي لإضافة رقم جديد');
            setShowAdd(true);
          }}
        >
          <Ionicons name="add-circle" size={26} color={C.primary} />
          <Text style={styles.addText}>إضافة رقم جديد</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.testBtn} onPress={() => speak('يا زهرة، الصوت يشتغل بشكل ممتاز، الحمد لله')}>
          <Ionicons name="volume-high" size={24} color={C.primary} />
          <Text style={styles.testBtnText}>اختبار الصوت</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editContact ? 'تعديل الرقم' : 'رقم جديد'}</Text>
            <TextInput
              style={styles.input}
              placeholder="الاسم (مثال: الابن أحمد)"
              value={name}
              onChangeText={setName}
              textAlign="right"
              placeholderTextColor={C.mutedForeground}
            />
            <TextInput
              style={styles.input}
              placeholder="رقم الهاتف"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              textAlign="right"
              placeholderTextColor={C.mutedForeground}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={addOrEdit}>
              <Text style={styles.saveText}>حفظ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn2} onPress={() => setShowAdd(false)}>
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
  sectionTitle: { fontSize: 20, fontFamily: 'Tajawal_700Bold', color: C.foreground },
  sectionHint: { fontSize: 14, fontFamily: 'Tajawal_400Regular', color: C.mutedForeground, lineHeight: 22 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  contactName: { fontSize: 18, fontFamily: 'Tajawal_700Bold', color: C.foreground },
  contactPhone: { fontSize: 15, fontFamily: 'Tajawal_400Regular', color: C.mutedForeground, marginTop: 2 },
  deleteBtn: { padding: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 16, borderWidth: 2, borderColor: C.primary, borderStyle: 'dashed' },
  addText: { fontSize: 18, fontFamily: 'Tajawal_700Bold', color: C.primary },
  separator: { height: 1, backgroundColor: C.border },
  testBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: C.secondary, borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: C.primary },
  testBtnText: { fontSize: 18, fontFamily: 'Tajawal_700Bold', color: C.primary },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12 },
  modalTitle: { fontSize: 22, fontFamily: 'Tajawal_700Bold', color: C.foreground, textAlign: 'center', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: C.border, borderRadius: 14, padding: 14, fontSize: 17, fontFamily: 'Tajawal_500Medium', color: C.foreground, backgroundColor: C.background },
  saveBtn: { backgroundColor: C.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  saveText: { color: C.white, fontSize: 18, fontFamily: 'Tajawal_700Bold' },
  cancelBtn2: { backgroundColor: C.muted, borderRadius: 14, padding: 14, alignItems: 'center' },
  cancelText: { color: C.mutedForeground, fontSize: 17, fontFamily: 'Tajawal_500Medium' },
});
