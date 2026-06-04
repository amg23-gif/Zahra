import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/src/theme/colors';
import {
  playSurah,
  stopAudio,
  downloadSurah,
  isSurahDownloaded,
  ReciterId,
} from '@/src/lib/offline-audio';
import { Audio } from 'expo-av';

interface AudioPlayerProps {
  surahNumber: number;
  surahName: string;
  reciterId: ReciterId;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function AudioPlayer({
  surahNumber,
  surahName,
  reciterId,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    checkDownloaded();
    return () => {
      stopAudio();
    };
  }, [surahNumber, reciterId]);

  const checkDownloaded = async () => {
    const dl = await isSurahDownloaded(reciterId, surahNumber);
    setDownloaded(dl);
  };

  const handlePlayPause = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isPlaying) {
      await stopAudio();
      setIsPlaying(false);
      setSound(null);
    } else {
      setIsLoading(true);
      try {
        const s = await playSurah(reciterId, surahNumber, () => {
          setIsPlaying(false);
          setSound(null);
          if (hasNext) onNext?.();
        });
        setSound(s);
        setIsPlaying(true);
      } catch (e) {
        console.warn('Playback error:', e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = async () => {
    if (downloading || downloaded) return;
    setDownloading(true);
    try {
      await downloadSurah(reciterId, surahNumber, setDownloadProgress);
      setDownloaded(true);
    } catch (e) {
      console.warn('Download error:', e);
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.surahName}>{surahName}</Text>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={onPrevious}
          disabled={!hasPrevious}
          style={[styles.ctrl, !hasPrevious && styles.disabled]}
        >
          <Ionicons name="play-skip-back" size={28} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn}>
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={36}
              color={colors.white}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          disabled={!hasNext}
          style={[styles.ctrl, !hasNext && styles.disabled]}
        >
          <Ionicons name="play-skip-forward" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {Platform.OS !== 'web' && (
        <TouchableOpacity
          onPress={handleDownload}
          disabled={downloaded || downloading}
          style={styles.downloadBtn}
        >
          {downloading ? (
            <Text style={styles.downloadText}>
              جاري التنزيل... {Math.round(downloadProgress * 100)}%
            </Text>
          ) : downloaded ? (
            <Text style={[styles.downloadText, { color: colors.success }]}>
              محفوظة بدون نت ✓
            </Text>
          ) : (
            <Text style={styles.downloadText}>
              تنزيل للاستماع بدون نت
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  surahName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  ctrl: {
    padding: 8,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabled: {
    opacity: 0.35,
  },
  downloadBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  downloadText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
