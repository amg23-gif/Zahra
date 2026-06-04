import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/src/theme/colors';
import { speak } from '@/src/lib/tts';
import { getPhrase, phrases } from '@/src/lib/darija';
import { scheduleAllAdhan } from '@/src/lib/adhan';
import { useAdhan } from '@/src/components/AdhanProvider';

const REMINDERS_KEY = 'zahra_reminders';

interface Reminder {
  id: string;
  label: string;
  enabled: boolean;
  time: string;
  phrase: keyof typeof phrases;
}

const DEFAULT_REMINDERS: Reminder[] = [
  { id: '1', label: 'تذكير الصباح', enabled: true, time: '07:00', phrase: 'morning' },
  { id: '2', label: 'تذكير الأذكار', enabled: true, time: '17:00', phrase: 'goAdhkar' },
  { id: '3', label: 'تذكير القرآن', enabled: true, time: '20:00', phrase: 'resumeQuran' },
  { id: '4', label: 'تذكير الليل', enabled: false, time: '22:00', phrase: 'night' },
];

export default function RemindsScreen() {
  const insets = useSafeAreaInsets();
  const { notificationsEnabled, enableNotifications } = useAdhan();
  const [reminders, setReminders] = useState<Reminder[]>(DEFAULT_REMINDERS);
  const [dailyPhrase, setDailyPhrase] = useState('');

  useEffect(() => {
    loadReminders();
    setDailyPhrase(getPhrase('loveBites'));
  }, []);

  async function loadReminders() {
    const saved = await AsyncStorage.getItem(REMINDERS_KEY);
    if (saved) {
      setReminders(JSON.parse(saved) as Reminder[]);
    }
  }

  async function toggleReminder(id: string) {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setReminders(updated);
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>رسل يومي</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 },
        ]}
      >
        {/* Daily love message */}
        <View style={styles.loveCard}>
          <Text style={styles.loveLabel}>كلمة من القلب</Text>
          <Text style={styles.loveText}>{dailyPhrase}</Text>
          <TouchableOpacity style={styles.listenBtn} onPress={() => speak(dailyPhrase)}>
            <Ionicons name="volume-high-outline" size={20} color={colors.primary} />
            <Text style={styles.listenText}>استمتعي</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications status */}
        {!notificationsEnabled && (
          <TouchableOpacity style={styles.enableNotifCard} onPress={enableNotifications}>
            <Ionicons name="notifications-off-outline" size={24} color={colors.error} />
            <View style={styles.enableNotifText}>
              <Text style={styles.enableNotifTitle}>الإشعارات معطلة</Text>
              <Text style={styles.enableNotifSub}>اضغطي لتفعيل الأذان والرسائل</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Reminders list */}
        <Text style={styles.sectionTitle}>التذكيرات اليومية</Text>
        {reminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderCard}>
            <View style={styles.reminderLeft}>
              <Ionicons name="alarm-outline" size={22} color={colors.primary} />
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderLabel}>{reminder.label}</Text>
                <Text style={styles.reminderTime}>{reminder.time}</Text>
              </View>
            </View>
            <Switch
              value={reminder.enabled}
              onValueChange={() => toggleReminder(reminder.id)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={reminder.enabled ? colors.primary : colors.textMuted}
            />
          </View>
        ))}

        {/* Reschedule Adhan */}
        <TouchableOpacity
          style={styles.rescheduleBtn}
          onPress={() => {
            scheduleAllAdhan();
            speak(getPhrase('atAdhan'));
          }}
        >
          <Ionicons name="refresh-outline" size={20} color={colors.primary} />
          <Text style={styles.rescheduleBtnText}>تحديث مواعيد الأذان</Text>
        </TouchableOpacity>
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
  scrollContent: { padding: 16, gap: 14 },
  loveCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  loveLabel: { fontSize: 13, fontFamily: 'Tajawal-Regular', color: 'rgba(255,255,255,0.65)', textAlign: 'right' },
  loveText: { fontSize: 20, fontFamily: 'Tajawal-Bold', color: colors.gold, textAlign: 'right', lineHeight: 32 },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  listenText: { fontSize: 15, fontFamily: 'Tajawal-Medium', color: colors.primary },
  enableNotifCard: {
    backgroundColor: '#fff3f3',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  enableNotifText: { flex: 1 },
  enableNotifTitle: { fontSize: 16, fontFamily: 'Tajawal-Bold', color: colors.error },
  enableNotifSub: { fontSize: 13, fontFamily: 'Tajawal-Regular', color: colors.textSecondary },
  sectionTitle: { fontSize: 20, fontFamily: 'Tajawal-Bold', color: colors.textPrimary, textAlign: 'right' },
  reminderCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  reminderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderInfo: { gap: 2 },
  reminderLabel: { fontSize: 17, fontFamily: 'Tajawal-Medium', color: colors.textPrimary },
  reminderTime: { fontSize: 13, fontFamily: 'Tajawal-Regular', color: colors.textMuted },
  rescheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginTop: 4,
  },
  rescheduleBtnText: { fontSize: 17, fontFamily: 'Tajawal-Medium', color: colors.primary },
});
