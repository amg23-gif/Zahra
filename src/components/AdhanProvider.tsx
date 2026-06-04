import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdhanContextValue {
  notificationsEnabled: boolean;
  enableNotifications: () => Promise<void>;
}

const AdhanContext = createContext<AdhanContextValue>({
  notificationsEnabled: false,
  enableNotifications: async () => {},
});

const NOTIF_KEY = 'zahra_notif_enabled';

export function AdhanProvider({ children }: { children: ReactNode }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    initAdhan();
  }, []);

  async function initAdhan() {
    try {
      const saved = await AsyncStorage.getItem(NOTIF_KEY);
      if (saved === 'true') {
        setNotificationsEnabled(true);
        await scheduleAdhan();
      }
    } catch {}
  }

  async function scheduleAdhan() {
    try {
      const Notifications = await import('expo-notifications');
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      const { requestAndGetLocation } = await import('@/src/lib/location');
      const { calculatePrayers } = await import('@/src/lib/prayer-times');

      const loc = await requestAndGetLocation();
      const prayers = calculatePrayers(loc.latitude, loc.longitude);
      await Notifications.cancelAllScheduledNotificationsAsync();

      const prayerList = [
        { name: 'الفجر', time: prayers.fajr },
        { name: 'الظهر', time: prayers.dhuhr },
        { name: 'العصر', time: prayers.asr },
        { name: 'المغرب', time: prayers.maghrib },
        { name: 'العشاء', time: prayers.isha },
      ];

      const now = new Date();
      for (const prayer of prayerList) {
        if (prayer.time <= now) continue;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `🕌 ${prayer.name}`,
            body: `يا زهرة، حان وقت ${prayer.name}، ربي يتقبل منك`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: prayer.time,
          },
        });
      }
    } catch {}
  }

  async function enableNotifications() {
    if (Platform.OS === 'web') return;
    try {
      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setNotificationsEnabled(granted);
      await AsyncStorage.setItem(NOTIF_KEY, String(granted));
      if (granted) await scheduleAdhan();
    } catch {}
  }

  return (
    <AdhanContext.Provider value={{ notificationsEnabled, enableNotifications }}>
      {children}
    </AdhanContext.Provider>
  );
}

export function useAdhan() {
  return useContext(AdhanContext);
}
