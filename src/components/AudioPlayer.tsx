import React, { useState, useEffect, useRef } from 'react';
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
import colors from '@/constants/colors';
import { downloadSurah, isSurahDownloaded, playSurah, ReciterId } from '@/src/lib/offline-audio';
import type { Audio } from 'expo-av';

const C = colors.light;

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
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    checkDownloaded();
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, [surahNumber, reciterId]);

  const checkDownloaded = async () => {
    if (Platform.OS === 'web') return;
    const dl = await isSurahDownloaded(reciterId, surahNumber);
    setDownloaded(dl);
  };

  const handlePlayPause = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isPlaying) {
      await soundRef.current?.stopAsync();
      await soundRef.current?.unloadAsync();
      soundRef.current = null;
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        const s = await playSurah(reciterId, surahNumber, () => {
          setIsPlaying(false);
          soundRef.current = null;
          if (hasNext) onNext?.();
        });
        soundRef.current = s;
        setIsPlaying(true);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = async () => {
    if (downloading || downloaded || Platform.OS === 'web') return;
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDownloading(true);
    try {
      await downloadSurah(reciterId, surahNumber, (p) => setDownloadProgress(p));
      setDownloaded(true);
    } catch {
      // ignore
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
          style={[styles.navBtn, !hasPrevious && styles.disabled]}
        >
          <Ionicons name="play-skip-forward" size={28} color={C.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn} activeOpacity={0.8}>
          {isLoading ? (
            <ActivityIndicator color={C.white} size="small" />
          ) : (
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color={C.white} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          disabled={!hasNext}
          style={[styles.navBtn, !hasNext && styles.disabled]}
        >
          <Ionicons name="play-skip-back" size={28} color={C.primary} />
        </TouchableOpacity>
      </View>

      {Platform.OS !== 'web' && (
        <TouchableOpacity
          onPress={handleDownload}
          disabled={downloaded || downloading}
          style={styles.downloadBtn}
        >
          {downloading ? (
            <View style={styles.downloadRow}>
              <ActivityIndicator size="small" color={C.primary} />
              <Text style={styles.downloadText}>
                {Math.round(downloadProgress * 100)}٪
              </Text>
            </View>
          ) : (
            <View style={styles.downloadRow}>
              <Ionicons
                name={downloaded ? 'checkmark-circle' : 'cloud-download-outline'}
                size={20}
                color={downloaded ? C.success : C.primary}
              />
              <Text style={[styles.downloadText, downloaded && { color: C.success }]}>
                {downloaded ? 'محفوظة بدون نت' : 'تنزيل بدون نت'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  surahName: {
    fontSize: 22,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 12,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: { opacity: 0.35 },
  downloadBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: C.secondary,
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadText: {
    fontSize: 14,
    color: C.primary,
    fontWeight: '600',
  },
  success: { color: C.success },
});
