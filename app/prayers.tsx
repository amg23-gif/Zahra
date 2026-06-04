import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { requestAndGetLocation, UserLocation } from '@/src/lib/location';
import {
  getPrayerList,
  PrayerTime,
  formatPrayerTime,
  minutesUntil,
  calculatePrayers,
} from '@/src/lib/prayer-times';
import { scheduleAllAdhan } from '@/src/lib/adhan';
import { useAdhan } from '@/src/components/AdhanProvider';

export default function PrayersScreen() {
  const insets = useSafeAreaInsets();
  const { notificationsEnabled, enableNotifications } = useAdhan();
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [qibla, setQibla] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    loadPrayers();
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  async function loadPrayers() {
    try {
      const loc = await requestAndGetLocation();
      setLocation(loc);
      const list = getPrayerList(loc.latitude, loc.longitude);
      setPrayers(list);
      const data = calculatePrayers(loc.latitude, loc.longitude);
      setQibla(Math.round(data.qiblaDirection));
    } finally {
      setLoading(false);
    }
  }

  const nextPrayer = prayers.find((p) => p.time > now);

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مواقيت الصلاة</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>جاري تحديد الموقع...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 },
          ]}
        >
          {/* City */}
          {location?.city && (
            <View style={styles.cityRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.cityText}>{location.city}</Text>
            </View>
          )}

          {/* Qibla direction */}
          <View style={styles.qiblaCard}>
            <Ionicons name="compass-outline" size={28} color={colors.gold} />
            <Text style={styles.qiblaText}>اتجاه القبلة: {qibla}°</Text>
          </View>

          {/* Prayers list */}
          {prayers.map((prayer) => {
            const isNext = nextPrayer?.prayer === prayer.prayer;
            const isPassed = prayer.time <= now;
            const mins = isNext ? minutesUntil(prayer.time) : 0;

            return (
              <View
                key={prayer.name}
                style={[
                  styles.prayerCard,
                  isNext && styles.nextCard,
                  isPassed && styles.passedCard,
                ]}
              >
                <View style={styles.prayerLeft}>
                  <Text style={[styles.prayerName, isNext && styles.nextText]}>
                    {prayer.arabicName}
                  </Text>
                  {isNext && (
                    <Text style={styles.countdown}>
                      بعد {mins} دقيقة
                    </Text>
                  )}
                </View>
                <Text style={[styles.prayerTime, isNext && styles.nextText]}>
                  {formatPrayerTime(prayer.time)}
                </Text>
              </View>
            );
          })}

          {/* Notifications toggle */}
          <TouchableOpacity
            style={[styles.notifBtn, notificationsEnabled && styles.notifEnabled]}
            onPress={notificationsEnabled ? scheduleAllAdhan : enableNotifications}
          >
            <Ionicons
              name={notificationsEnabled ? 'notifications' : 'notifications-outline'}
              size={22}
              color={notificationsEnabled ? colors.white : colors.primary}
            />
            <Text style={[styles.notifText, notificationsEnabled && { color: colors.white }]}>
              {notificationsEnabled ? 'الأذان مفعّل' : 'تفعيل الأذان'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Tajawal-Bold',
    color: colors.white,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 16, fontFamily: 'Tajawal-Regular', color: colors.textSecondary },
  scrollContent: { padding: 20, gap: 12 },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 4,
  },
  cityText: { fontSize: 15, fontFamily: 'Tajawal-Regular', color: colors.textSecondary },
  qiblaCard: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  qiblaText: { fontSize: 18, fontFamily: 'Tajawal-Bold', color: colors.textPrimary },
  prayerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  nextCard: { backgroundColor: colors.primary },
  passedCard: { opacity: 0.5 },
  prayerLeft: { gap: 2 },
  prayerName: { fontSize: 22, fontFamily: 'Tajawal-Bold', color: colors.textPrimary },
  prayerTime: { fontSize: 22, fontFamily: 'Tajawal-Bold', color: colors.textPrimary },
  nextText: { color: colors.white },
  countdown: { fontSize: 13, fontFamily: 'Tajawal-Regular', color: colors.goldLight },
  notifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  notifEnabled: { backgroundColor: colors.primary },
  notifText: { fontSize: 18, fontFamily: 'Tajawal-Bold', color: colors.primary },
});
