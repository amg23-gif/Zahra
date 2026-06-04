import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const QURAN_DIR = FileSystem.documentDirectory + 'quran-audio/';

const RECITERS = {
  alafasy: { name: 'الشيخ العفاسي', baseUrl: 'https://server8.mp3quran.net/afs/' },
  mecca: { name: 'الحرم المكي', baseUrl: 'https://server8.mp3quran.net/mosa_mhmd/' },
  medina: { name: 'الحرم المدني', baseUrl: 'https://server8.mp3quran.net/harm/' },
  naqshbandi: { name: 'النقشبندي', baseUrl: 'https://server8.mp3quran.net/nqsh/' },
};

export type ReciterId = keyof typeof RECITERS;

export const RECITERS_LIST = Object.entries(RECITERS).map(([id, r]) => ({
  id: id as ReciterId,
  name: r.name,
}));

export async function ensureQuranDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(QURAN_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(QURAN_DIR, { intermediates: true });
  }
}

export function getSurahAudioUrl(reciterId: ReciterId, surahNumber: number): string {
  const padded = String(surahNumber).padStart(3, '0');
  return RECITERS[reciterId].baseUrl + padded + '.mp3';
}

export function getSurahLocalPath(reciterId: ReciterId, surahNumber: number): string {
  return QURAN_DIR + reciterId + '_' + surahNumber + '.mp3';
}

export async function isSurahDownloaded(reciterId: ReciterId, surahNumber: number): Promise<boolean> {
  const path = getSurahLocalPath(reciterId, surahNumber);
  const info = await FileSystem.getInfoAsync(path);
  return info.exists;
}

export async function downloadSurah(
  reciterId: ReciterId,
  surahNumber: number,
  onProgress?: (p: number) => void
): Promise<string> {
  await ensureQuranDir();
  const url = getSurahAudioUrl(reciterId, surahNumber);
  const localPath = getSurahLocalPath(reciterId, surahNumber);

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
  if (!result) throw new Error('Download failed');
  return result.uri;
}

export async function deleteSurah(reciterId: ReciterId, surahNumber: number): Promise<void> {
  const path = getSurahLocalPath(reciterId, surahNumber);
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    await FileSystem.deleteAsync(path);
  }
}

let currentSound: Audio.Sound | null = null;

export async function playSurah(
  reciterId: ReciterId,
  surahNumber: number,
  onFinish?: () => void
): Promise<Audio.Sound> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  if (currentSound) {
    await currentSound.unloadAsync();
    currentSound = null;
  }

  const downloaded = await isSurahDownloaded(reciterId, surahNumber);
  const uri = downloaded
    ? getSurahLocalPath(reciterId, surahNumber)
    : getSurahAudioUrl(reciterId, surahNumber);

  const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
  currentSound = sound;

  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      onFinish?.();
    }
  });

  return sound;
}

export async function stopAudio(): Promise<void> {
  if (currentSound) {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
    currentSound = null;
  }
}
