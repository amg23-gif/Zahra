import { Platform } from 'react-native';

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  baseUrl: string;
}

export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    name: 'Mishary Alafasy',
    arabicName: 'مشاري العفاسي',
    baseUrl: 'https://server8.mp3quran.net/afs/',
  },
  {
    id: 'makkah',
    name: 'Makkah Imam',
    arabicName: 'إمام الحرم المكي',
    baseUrl: 'https://server8.mp3quran.net/mosa_mhmd/',
  },
  {
    id: 'madinah',
    name: 'Madinah Imam',
    arabicName: 'إمام الحرم المدني',
    baseUrl: 'https://server8.mp3quran.net/harm/',
  },
  {
    id: 'minshawi',
    name: 'Mohamed Seddiq Minshawi',
    arabicName: 'محمد صديق المنشاوي',
    baseUrl: 'https://server8.mp3quran.net/minsh/',
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Husary',
    arabicName: 'محمود خليل الحصري',
    baseUrl: 'https://server8.mp3quran.net/husary/',
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit',
    arabicName: 'عبد الباسط عبد الصمد',
    baseUrl: 'https://server8.mp3quran.net/basit/',
  },
];

export type ReciterId = string;

export function getSurahAudioUrl(reciterId: ReciterId, surahNumber: number): string {
  const reciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0]!;
  const padded = String(surahNumber).padStart(3, '0');
  return reciter.baseUrl + padded + '.mp3';
}

export async function isSurahDownloaded(reciterId: ReciterId, surahNumber: number): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const FileSystem = await import('expo-file-system');
    const QURAN_DIR = FileSystem.documentDirectory + 'quran-audio/';
    const path = QURAN_DIR + reciterId + '_' + surahNumber + '.mp3';
    const info = await FileSystem.getInfoAsync(path);
    return info.exists;
  } catch {
    return false;
  }
}

export async function downloadSurah(
  reciterId: ReciterId,
  surahNumber: number,
  onProgress?: (p: number) => void
): Promise<string> {
  const FileSystem = await import('expo-file-system');
  const QURAN_DIR = FileSystem.documentDirectory + 'quran-audio/';

  const dirInfo = await FileSystem.getInfoAsync(QURAN_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(QURAN_DIR, { intermediates: true });
  }

  const url = getSurahAudioUrl(reciterId, surahNumber);
  const localPath = QURAN_DIR + reciterId + '_' + surahNumber + '.mp3';

  const downloadResumable = FileSystem.createDownloadResumable(
    url,
    localPath,
    {},
    (progress) => {
      const pct = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
      onProgress?.(pct);
    }
  );

  const result = await downloadResumable.downloadAsync();
  return result?.uri ?? localPath;
}

export async function playSurah(
  reciterId: ReciterId,
  surahNumber: number,
  onFinish?: () => void
): Promise<import('expo-av').Audio.Sound> {
  const { Audio } = await import('expo-av');

  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
  });

  const isDownloaded = await isSurahDownloaded(reciterId, surahNumber);
  let uri: string;

  if (isDownloaded) {
    const FileSystem = await import('expo-file-system');
    const QURAN_DIR = FileSystem.documentDirectory + 'quran-audio/';
    uri = QURAN_DIR + reciterId + '_' + surahNumber + '.mp3';
  } else {
    uri = getSurahAudioUrl(reciterId, surahNumber);
  }

  const { sound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true, volume: 1.0 },
    (status) => {
      if (status.isLoaded && status.didJustFinish) {
        onFinish?.();
      }
    }
  );

  return sound;
}

export async function stopAudio(): Promise<void> {
  // Handled by individual sound instances
}
