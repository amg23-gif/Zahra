import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { calculatePrayers } from './prayer-times';
import { requestAndGetLocation } from './location';
import { getPhrase } from './darija';

export const ADHAN_TASK = 'ZAHRA_ADHAN_BACKGROUND';

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowCriticalAlerts: true,
    },
  });
  return status === 'granted';
}

export async function scheduleAllAdhan(): Promise<void> {
  if (Platform.OS === 'web') return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  // Cancel all existing adhan notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  const location = await requestAndGetLocation();
  const prayers = calculatePrayers(location.latitude, location.longitude);

  const prayerList = [
    { name: 'الفجر', time: prayers.fajr },
    { name: 'الظهر', time: prayers.dhuhr },
    { name: 'العصر', time: prayers.asr },
    { name: 'المغرب', time: prayers.maghrib },
    { name: 'العشاء', time: prayers.isha },
  ];

  for (const prayer of prayerList) {
    const prayerTime = new Date(prayer.time);
    const now = new Date();

    if (prayerTime <= now) continue;

    // Schedule adhan notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🕌 ${prayer.name}`,
        body: getPhrase('atAdhan'),
        sound: 'adhan.wav',
        data: { type: 'adhan', prayer: prayer.name },
      },
      trigger: {
        date: prayerTime,
      } as Notifications.DateTriggerInput,
    });

    // Schedule 10-minute warning before adhan
    const warnTime = new Date(prayerTime.getTime() - 10 * 60 * 1000);
    if (warnTime > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ قريباً — ${prayer.name}`,
          body: getPhrase('beforeAdhan'),
          sound: undefined,
          data: { type: 'before_adhan', prayer: prayer.name },
        },
        trigger: {
          date: warnTime,
        } as Notifications.DateTriggerInput,
      });
    }
  }
}

// Background fetch to reschedule daily
if (Platform.OS !== 'web') {
  TaskManager.defineTask(ADHAN_TASK, async () => {
    try {
      await scheduleAllAdhan();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

export async function registerBackgroundAdhanTask(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await BackgroundFetch.registerTaskAsync(ADHAN_TASK, {
      minimumInterval: 60 * 60 * 6, // every 6 hours
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (e) {
    console.warn('Background task registration failed:', e);
  }
}
