import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ZahraStore {
  lastSurah: number;
  lastReciter: string;
  tasbihCount: number;
  setLastSurah: (n: number) => void;
  setLastReciter: (id: string) => void;
  setTasbihCount: (n: number) => void;
}

export const useZahraStore = create<ZahraStore>((set) => ({
  lastSurah: 1,
  lastReciter: 'alafasy',
  tasbihCount: 0,
  setLastSurah: (n) => {
    set({ lastSurah: n });
    AsyncStorage.setItem('zahra_last_surah', String(n));
  },
  setLastReciter: (id) => {
    set({ lastReciter: id });
    AsyncStorage.setItem('zahra_last_reciter', id);
  },
  setTasbihCount: (n) => set({ tasbihCount: n }),
}));
