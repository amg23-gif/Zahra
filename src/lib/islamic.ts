export interface IslamicDate {
  day: number;
  month: number;
  monthName: string;
  year: number;
  display: string;
}

const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

export function getIslamicDate(): IslamicDate {
  const today = new Date();
  const gregorianYear = today.getFullYear();
  const gregorianMonth = today.getMonth() + 1;
  const gregorianDay = today.getDate();

  let hijriYear = gregorianYear - 579;
  let hijriMonth = gregorianMonth + 4;
  let hijriDay = gregorianDay + 13;

  if (hijriDay > 30) { hijriDay -= 30; hijriMonth++; }
  if (hijriMonth > 12) { hijriMonth -= 12; hijriYear++; }

  return {
    day: hijriDay,
    month: hijriMonth,
    monthName: HIJRI_MONTHS[hijriMonth - 1] ?? '',
    year: hijriYear,
    display: `${hijriDay} ${HIJRI_MONTHS[hijriMonth - 1] ?? ''} ${hijriYear} هـ`,
  };
}

export function getDayName(): string {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[new Date().getDay()] ?? '';
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 16) return 'afternoon';
  if (h >= 16 && h < 20) return 'evening';
  return 'night';
}

export const DAILY_WORDS: string[] = [
  '"وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ"',
  '"إِنَّ مَعَ الْعُسْرِ يُسْرًا"',
  '"حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ"',
  '"اللَّهُ لَطِيفٌ بِعِبَادِهِ"',
  '"وَاذْكُر رَّبَّكَ كَثِيرًا"',
  '"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً"',
  '"الصَّبْرُ مِفْتَاحُ الْفَرَج"',
  '"بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"',
  '"وَقُل رَّبِّ زِدْنِي عِلْمًا"',
  '"رَبِّ اشْرَحْ لِي صَدْرِي"',
  '"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ"',
  '"لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ"',
  '"اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ"',
  '"رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ"',
];

export function getDailyWord(): string {
  const day = new Date().getDate();
  return DAILY_WORDS[day % DAILY_WORDS.length] ?? DAILY_WORDS[0] ?? '';
}
