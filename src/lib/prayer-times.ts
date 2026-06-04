import { Coordinates, CalculationMethod, PrayerTimes, Prayer, Qibla } from 'adhan';

export interface PrayerTime {
  name: string;
  arabicName: string;
  icon: string;
  time: Date;
  prayer: Prayer;
}

export interface DailyPrayers {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  qiblaDirection: number;
}

export function calculatePrayers(latitude: number, longitude: number, date?: Date): DailyPrayers {
  const coords = new Coordinates(latitude, longitude);
  const d = date ?? new Date();
  const params = CalculationMethod.MuslimWorldLeague();
  const prayerTimes = new PrayerTimes(coords, d, params);
  const qibla = Qibla(coords);

  return {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    qiblaDirection: qibla,
  };
}

export function getPrayerList(latitude: number, longitude: number): PrayerTime[] {
  const prayers = calculatePrayers(latitude, longitude);
  return [
    { name: 'Fajr', arabicName: 'الفجر', icon: '🌙', time: prayers.fajr, prayer: Prayer.Fajr },
    { name: 'Dhuhr', arabicName: 'الظهر', icon: '☀️', time: prayers.dhuhr, prayer: Prayer.Dhuhr },
    { name: 'Asr', arabicName: 'العصر', icon: '🌤️', time: prayers.asr, prayer: Prayer.Asr },
    { name: 'Maghrib', arabicName: 'المغرب', icon: '🌅', time: prayers.maghrib, prayer: Prayer.Maghrib },
    { name: 'Isha', arabicName: 'العشاء', icon: '🌙', time: prayers.isha, prayer: Prayer.Isha },
  ];
}

export function getNextPrayer(latitude: number, longitude: number): PrayerTime | null {
  const now = new Date();
  const list = getPrayerList(latitude, longitude);
  return list.find((p) => p.time > now) ?? null;
}

export function formatPrayerTime(date: Date): string {
  return date.toLocaleTimeString('ar-MA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function minutesUntil(date: Date): number {
  const now = new Date();
  return Math.max(0, Math.floor((date.getTime() - now.getTime()) / 60000));
}
