// Islamic utilities - dates, adhkar, etc.

export interface IslamicDate {
  day: number;
  month: number;
  monthName: string;
  year: number;
  display: string;
}

const HIJRI_MONTHS = [
  'محرم','صفر','ربيع الأول','ربيع الثاني',
  'جمادى الأولى','جمادى الثانية','رجب','شعبان',
  'رمضان','شوال','ذو القعدة','ذو الحجة',
];

export function getIslamicDate(): IslamicDate {
  const today = new Date();
  // Simple approximation — for production use hijri-js or similar
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
    monthName: HIJRI_MONTHS[hijriMonth - 1] || '',
    year: hijriYear,
    display: `${hijriDay} ${HIJRI_MONTHS[hijriMonth - 1]} ${hijriYear} هـ`,
  };
}

export function getDayName(): string {
  const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  return days[new Date().getDay()];
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 16) return 'afternoon';
  if (h >= 16 && h < 20) return 'evening';
  return 'night';
}

export const DAILY_WORDS: string[] = [
  '"وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ" — الطلاق',
  '"إِنَّ مَعَ الْعُسْرِ يُسْرًا" — الشرح',
  '"وَقُل رَّبِّ زِدْنِي عِلْمًا" — طه',
  '"حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ" — آل عمران',
  '"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً" — البقرة',
  '"اللَّهُ لَطِيفٌ بِعِبَادِهِ" — الشورى',
  '"وَاذْكُر رَّبَّكَ كَثِيرًا" — آل عمران',
  '"الصَّبْرُ مِفْتَاحُ الْفَرَج" — حديث شريف',
  '"فَإِنَّ مَعَ الْعُسْرِ يُسْرًا" — الشرح',
  '"رَبِّ اشْرَحْ لِي صَدْرِي" — طه',
  '"وَلَذِكْرُ اللَّهِ أَكْبَرُ" — العنكبوت',
  '"إِنَّ اللَّهَ مَعَ الصَّابِرِينَ" — البقرة',
];

export function getDailyWord(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_WORDS[dayOfYear % DAILY_WORDS.length];
}
