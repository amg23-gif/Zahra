import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const AUDIO_DIR = FileSystem.cacheDirectory + 'zahra-tts/';

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(AUDIO_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
  }
}

// TTS via expo-speech (AR) or ElevenLabs (if key available)
export async function speak(text: string): Promise<void> {
  const elevenlabsKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

  if (elevenlabsKey && Platform.OS !== 'web') {
    try {
      await speakWithElevenLabs(text, elevenlabsKey);
      return;
    } catch {
      // Fallback to expo-speech
    }
  }

  await Speech.speak(text, {
    language: 'ar',
    pitch: 1.0,
    rate: 0.9,
  });
}

export async function speakWithElevenLabs(text: string, apiKey: string): Promise<void> {
  await ensureDir();

  const hash = btoa(text).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  const filePath = AUDIO_DIR + hash + '.mp3';

  const info = await FileSystem.getInfoAsync(filePath);
  if (!info.exists) {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) throw new Error('ElevenLabs error');

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    await FileSystem.writeAsStringAsync(filePath, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  // Play the cached mp3
  const { Audio } = await import('expo-av');
  const { sound } = await Audio.Sound.createAsync({ uri: filePath });
  await sound.playAsync();
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      sound.unloadAsync();
    }
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
