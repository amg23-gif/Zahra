import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Platform } from 'react-native';
import {
  scheduleAllAdhan,
  registerBackgroundAdhanTask,
  requestNotificationPermission,
} from '@/src/lib/adhan';

interface AdhanContextValue {
  notificationsEnabled: boolean;
  enableNotifications: () => Promise<void>;
}

const AdhanContext = createContext<AdhanContextValue>({
  notificationsEnabled: false,
  enableNotifications: async () => {},
});

export function AdhanProvider({ children }: { children: ReactNode }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    initAdhan();
  }, []);

  async function initAdhan() {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      await scheduleAllAdhan();
      await registerBackgroundAdhanTask();
    }
  }

  async function enableNotifications() {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      await scheduleAllAdhan();
      await registerBackgroundAdhanTask();
    }
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
