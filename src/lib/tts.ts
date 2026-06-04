import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

let isSpeaking = false;

export async function speak(text: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    if (isSpeaking) {
      await Speech.stop();
    }
    isSpeaking = true;
    await new Promise<void>((resolve) => {
      Speech.speak(text, {
        language: 'ar',
        pitch: 1.05,
        rate: 0.85,
        onDone: () => { isSpeaking = false; resolve(); },
        onError: () => { isSpeaking = false; resolve(); },
      });
    });
  } catch {
    isSpeaking = false;
  }
}

export async function speakAndWait(text: string): Promise<void> {
  return speak(text);
}

export function stopSpeaking(): void {
  if (Platform.OS !== 'web') {
    Speech.stop().catch(() => {});
    isSpeaking = false;
  }
}
