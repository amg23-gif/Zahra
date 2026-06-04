import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { speak } from '@/src/lib/tts';

const C = colors.light;

interface VoiceGuideProps {
  message: string;
  autoSpeak?: boolean;
  delay?: number;
  style?: object;
}

export function VoiceGuide({ message, autoSpeak = true, delay = 600, style }: VoiceGuideProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (autoSpeak && message) {
      const timer = setTimeout(() => speak(message), delay);
      return () => clearTimeout(timer);
    }
  }, [message, autoSpeak, delay]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    speak(message);
  };

  return (
    <Animated.View style={[{ transform: [{ scale: pulseAnim }] }, style]}>
      <TouchableOpacity onPress={handlePress} style={styles.btn} activeOpacity={0.7}>
        <Ionicons name="volume-high" size={22} color={C.white} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
});
