import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { speak } from '@/src/lib/tts';

const C = colors.light;

interface BigButtonProps {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  speakOnPress?: string;
  testID?: string;
}

export function BigButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  speakOnPress,
  testID,
}: BigButtonProps) {
  const handlePress = async () => {
    if (disabled || loading) return;
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (speakOnPress) {
      speak(speakOnPress);
    }
    onPress();
  };

  const bg =
    variant === 'gold' ? C.gold :
    variant === 'danger' ? C.destructive :
    variant === 'secondary' ? C.secondary :
    C.primary;

  const textColor =
    variant === 'secondary' ? C.foreground : C.white;

  return (
    <TouchableOpacity
      testID={testID}
      onPress={handlePress}
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[styles.button, { backgroundColor: bg }, disabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
  disabled: {
    opacity: 0.5,
  },
});
