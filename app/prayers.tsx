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
import colors from '@/constants/colors';
import { requestAndGetLocation, UserLocation } from '@/src/lib/location';
import { getPrayerList, PrayerTime, formatPrayerTime, minutesUntil, calculatePrayers } from '@/src/lib/prayer-times';
import { speak } from '@/src/lib/tts';
import { useAdhan } from '@/src/components/AdhanProvider';
import { VoiceGuide } from '@/src/components/VoiceGuide';

const C = colors.light;

export default function PrayersScreen() {
  const insets = useSafeAreaInsets();
  const { notificationsEnabled, enableNotifications } = useAdhan();
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [qibla, setQibla] = useState(0);
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

      // Announce next prayer
      const next = list.find((p) => p.time > new Date());
      if (next) {
        const mins = minutesUntil(next.time);
        setTimeout(() => {
          speak(`يا زهرة، الصلاة القادمة هي ${next.arabicName} بعد ${mins} دقيقة`);
        }, 800);
      }
    } finally {
      setLoading(false);
    }
  }

  const nextPrayer = prayers.find((p) => p.time > now);
  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={28} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مواقيت الصلاة</Text>
        <VoiceGuide
          message="يا زهرة، هذه مواقيت الصلوات الخمس. اضغطي على اسم الصلاة لتسمعي وقتها"
          autoSpeak
          delay={800}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} size="large" />
          <Text style={styles.loadingText}>جاري تحديد الموقع...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding, paddingTop: 16, paddingHorizontal: 16, gap: 10 }}>
          {location?.city && (
            <View style={styles.cityRow}>
              <Ionicons name="location" size={18} color={C.primary} />
              <Text style={styles.cityText}>{location.city}</Text>
            </View>
          )}

          <View style={styles.qiblaCard}>
            <Ionicons name="compass" size={32} color={C.gold} />
            <View>
              <Text style={styles.qiblaLabel}>اتجاه القبلة</Text>
              <Text style={styles.qiblaValue}>{qibla}°</Text>
            </View>
          </View>

          {prayers.map((prayer) => {
            const isNext = nextPrayer?.prayer === prayer.prayer;
            const isPassed = prayer.time <= now;
            const mins = isNext ? minutesUntil(prayer.time) : 0;

            return (
              <TouchableOpacity
                key={prayer.name}
                style={[styles.prayerCard, isNext && styles.nextCard, isPassed && styles.passedCard]}
                onPress={() => {
                  const msg = isPassed
                    ? `صلاة ${prayer.arabicName} مضت`
                    : isNext
                    ? `صلاة ${prayer.arabicName} بعد ${mins} دقيقة، الله يتقبل منك يا زهرة`
                    : `صلاة ${prayer.arabicName} الساعة ${formatPrayerTime(prayer.time)}`;
                  speak(msg);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.prayerLeft}>
                  <Text style={styles.prayerEmoji}>{prayer.icon}</Text>
                  <View>
                    <Text style={[styles.prayerName, isNext && styles.nextText]}>{prayer.arabicName}</Text>
                    {isNext && <Text style={styles.countdown}>بعد {mins} دقيقة</Text>}
                    {isPassed && <Text style={styles.passedText}>مضت</Text>}
                  </View>
                </View>
                <View style={styles.prayerRight}>
                  <Text style={[styles.prayerTime, isNext && styles.nextText]}>
                    {formatPrayerTime(prayer.time)}
                  </Text>
                  <Ionicons name="volume-medium-outline" size={18} color={isNext ? C.white : C.mutedForeground} />
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.notifBtn, notificationsEnabled && styles.notifEnabled]}
            onPress={() => {
              speak(notificationsEnabled ? 'الأذان مفعّل يا زهرة' : 'جاري تفعيل الأذان يا زهرة');
              if (!notificationsEnabled) enableNotifications();
            }}
          >
            <Ionicons
              name={notificationsEnabled ? 'notifications' : 'notifications-outline'}
              size={26}
              color={notificationsEnabled ? C.white : C.primary}
            />
            <Text style={[styles.notifText, notificationsEnabled && { color: C.white }]}>
              {notificationsEnabled ? '✓ الأذان مفعّل' : 'تفعيل الأذان'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 16, fontFamily: 'Tajawal_400Regular', color: C.mutedForeground },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 4 },
  cityText: { fontSize: 15, fontFamily: 'Tajawal_500Medium', color: C.mutedForeground },
  qiblaCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qiblaLabel: { fontSize: 14, fontFamily: 'Tajawal_400Regular', color: C.mutedForeground },
  qiblaValue: { fontSize: 20, fontFamily: 'Tajawal_700Bold', color: C.primary },
  prayerCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  nextCard: { backgroundColor: C.primary, shadowColor: C.primary, shadowOpacity: 0.3, elevation: 6 },
  passedCard: { opacity: 0.5 },
  prayerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prayerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prayerEmoji: { fontSize: 28 },
  prayerName: { fontSize: 20, fontFamily: 'Tajawal_700Bold', color: C.foreground },
  nextText: { color: C.white },
  countdown: { fontSize: 14, fontFamily: 'Tajawal_500Medium', color: C.gold, marginTop: 2 },
  passedText: { fontSize: 13, fontFamily: 'Tajawal_400Regular', color: C.mutedForeground },
  prayerTime: { fontSize: 18, fontFamily: 'Tajawal_700Bold', color: C.foreground },
  notifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.secondary,
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    borderWidth: 2,
    borderColor: C.primary,
  },
  notifEnabled: { backgroundColor: C.primary, borderColor: C.primary },
  notifText: { fontSize: 18, fontFamily: 'Tajawal_700Bold', color: C.primary },
});
