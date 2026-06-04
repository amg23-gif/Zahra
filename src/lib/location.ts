import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
}

const LOCATION_KEY = 'zahra_location';

export async function requestAndGetLocation(): Promise<UserLocation> {
  // Try cached first
  const cached = await AsyncStorage.getItem(LOCATION_KEY);
  if (cached) {
    const parsed = JSON.parse(cached) as UserLocation;
    // Refresh in background
    refreshLocation();
    return parsed;
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    // Default: Casablanca, Morocco
    return { latitude: 33.5731, longitude: -7.5898, city: 'الدار البيضاء' };
  }

  return await fetchLocation();
}

async function fetchLocation(): Promise<UserLocation> {
  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
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
    return { latitude: 33.5731, longitude: -7.5898, city: 'الدار البيضاء' };
  }
}

async function refreshLocation(): Promise<void> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') {
      await fetchLocation();
    }
  } catch {}
}
