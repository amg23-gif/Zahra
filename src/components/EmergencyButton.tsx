import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  View,
  Linking,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';
import { speak } from '@/src/lib/tts';

const C = colors.light;
const EMERGENCY_CONTACTS_KEY = 'zahra_emergency_contacts';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

interface EmergencyButtonProps {
  style?: object;
}

export function EmergencyButton({ style }: EmergencyButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const pulse = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = async () => {
    pulse();
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    speak('يا زهرة، اضغطي على اسم من تريدين الاتصال به');
    const saved = await AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY);
    const list: EmergencyContact[] = saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
    setContacts(list);
    setModalVisible(true);
  };

  const callContact = async (contact: EmergencyContact) => {
    setModalVisible(false);
    speak(`جاري الاتصال بـ ${contact.name}`);
    setTimeout(() => {
      Linking.openURL(`tel:${contact.phone}`);
    }, 800);
  };

  return (
    <>
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <TouchableOpacity onPress={handlePress} style={styles.emergencyBtn} activeOpacity={0.8}>
          <Ionicons name="call" size={30} color={C.white} />
          <Text style={styles.emergencyText}>اتصال بالعائلة</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>اتصلي بمن تريدين</Text>
            <Text style={styles.modalSub}>اضغطي على الاسم</Text>

            {contacts.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.contactBtn}
                onPress={() => callContact(c)}
                activeOpacity={0.75}
              >
                <Ionicons name="person-circle" size={40} color={C.primary} />
                <View>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactPhone}>{c.phone}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const DEFAULT_CONTACTS: EmergencyContact[] = [
  { id: '1', name: 'الابن', phone: '0600000001' },
  { id: '2', name: 'البنت', phone: '0600000002' },
  { id: '3', name: 'الطوارئ', phone: '15' },
];

const styles = StyleSheet.create({
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.destructive,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
    shadowColor: C.destructive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyText: {
    color: C.white,
    fontSize: 20,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: C.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
    gap: 12,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: C.foreground,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 16,
    color: C.mutedForeground,
    textAlign: 'center',
    marginBottom: 8,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.secondary,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  contactName: {
    fontSize: 20,
    fontWeight: '700',
    color: C.foreground,
  },
  contactPhone: {
    fontSize: 15,
    color: C.mutedForeground,
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: C.muted,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 18,
    fontWeight: '600',
    color: C.mutedForeground,
  },
});
