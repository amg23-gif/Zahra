import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
}

const LOCATION_KEY = 'zahra_location';
const DEFAULT_LOCATION: UserLocation = { latitude: 33.5731, longitude: -7.5898, city: 'الدار البيضاء' };

export async function requestAndGetLocation(): Promise<UserLocation> {
  if (Platform.OS === 'web') return DEFAULT_LOCATION;

  try {
    const cached = await AsyncStorage.getItem(LOCATION_KEY);
    if (cached) {
      refreshLocationInBackground();
      return JSON.parse(cached) as UserLocation;
    }
    return await fetchLocation();
  } catch {
    return DEFAULT_LOCATION;
  }
}

async function fetchLocation(): Promise<UserLocation> {
  try {
    const Location = await import('expo-location');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return DEFAULT_LOCATION;

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const result: UserLocation = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };

    try {
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geo?.city) result.city = geo.city;
    } catch {}

    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(result));
    return result;
  } catch {
    return DEFAULT_LOCATION;
  }
}

async function refreshLocationInBackground(): Promise<void> {
  try {
    await fetchLocation();
  } catch {}
}
