# زهرة — رفيق إيماني يومي

تطبيق جوال مخصص للأم زهرة، يجمع بين مواقيت الصلاة والقرآن الكريم والأذكار والمسبحة، مع صوت دافئ بالدارجة المغربية.

---

## المميزات

- مواقيت الصلاة بدون نت (adhan-js) + اتجاه القبلة
- الأذان — 5 إشعارات يومية مجدولة + تنبيه قبل 10 دقائق
- القرآن الكريم — 114 سورة، 4 مؤذنين، تنزيل للاستماع بدون نت
- الأذكار — صباح / مساء / نوم / بعد الصلاة
- المسبحة — عداد 33/99/مفتوح مع اهتزاز
- ترحيب صوتي بالدارجة المغربية باسم "زهرة" خلال 700ms من فتح التطبيق

---

## الأصول المطلوبة يدوياً

### 1. خط Tajawal

نزّل من: https://fonts.google.com/specimen/Tajawal

ضع الملفات التالية في `assets/fonts/`:
- Tajawal-Regular.ttf
- Tajawal-Medium.ttf
- Tajawal-Bold.ttf
- Tajawal-ExtraBold.ttf

### 2. صوت الأذان

ضع ملف `adhan.wav` في مجلد `assets/`

### 3. صور التطبيق

ضع في `assets/images/`:
- icon.png (1024×1024)
- splash.png (1284×2778)
- adaptive-icon.png (1024×1024)

---

## التشغيل المحلي

```bash
npm install
npm start
```

افتح Expo Go على هاتفك وامسح QR Code.

---

## بناء APK (Android)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

## بناء AAB للإنتاج (Google Play)

```bash
eas build -p android --profile production
```

## بناء iOS

```bash
eas build -p ios --profile production
```

---

## النشر على GitHub

1. أنشئ مستودعاً جديداً على github.com باسم `zahra-app`
2. افتح الطرفية في مجلد المشروع ونفّذ:

```
Initialize repo, add files, commit, then push to your GitHub remote.
```

---

## النشر على Google Play

1. افتح play.google.com/console
2. أنشئ تطبيقاً جديداً — اسمه "زهرة"
3. في Production → Releases ارفع ملف AAB
4. أكمل البيانات باللغة العربية وأرسل للمراجعة

---

## متغيرات البيئة (اختياري)

أنشئ ملف `.env.local` في جذر المشروع:

```
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_key_here
```

إذا أضفت مفتاح ElevenLabs، يستخدم التطبيق صوت Sara العربي ويخزّن MP3 في ذاكرة الهاتف.

---

## البنية التقنية

```
zahra-app/
├── app/
│   ├── _layout.tsx       — Root layout + RTL + خط Tajawal
│   ├── index.tsx         — الشاشة الرئيسية + ترحيب صوتي
│   ├── prayers.tsx       — مواقيت الصلاة + القبلة
│   ├── quran.tsx         — القرآن 114 سورة
│   ├── adhkar.tsx        — الأذكار
│   ├── tasbih.tsx        — المسبحة
│   └── reminds.tsx       — الرسل اليومي
├── src/
│   ├── lib/
│   │   ├── adhan.ts          — جدولة إشعارات الأذان
│   │   ├── darija.ts         — 12 مجموعة عبارات (6-8 عبارات/مجموعة)
│   │   ├── prayer-times.ts   — حساب أوقات الصلاة
│   │   ├── location.ts       — الموقع الجغرافي
│   │   ├── tts.ts            — النطق (expo-speech + ElevenLabs)
│   │   ├── offline-audio.ts  — تنزيل وتشغيل القرآن
│   │   ├── islamic.ts        — التاريخ الهجري + الكلمة اليومية
│   │   └── quran-data.ts     — بيانات 114 سورة
│   ├── components/
│   │   ├── BigButton.tsx     — زر كبير 68dp+
│   │   ├── AudioPlayer.tsx   — مشغّل القرآن
│   │   └── AdhanProvider.tsx — سياق الإشعارات
│   └── theme/
│       └── colors.ts         — الألوان الزيتونية والذهبية
├── assets/
│   ├── fonts/            — خط Tajawal (أضفه يدوياً)
│   ├── images/           — أيقونة + splash (أضفها يدوياً)
│   └── adhan.wav         — صوت الأذان (أضفه يدوياً)
├── app.json
├── eas.json
└── package.json
```

---

## التقنيات المستخدمة

- Expo SDK 51 + React Native + TypeScript
- expo-router (file-based routing)
- adhan-js (حساب أوقات الصلاة بدون نت)
- expo-notifications (إشعارات الأذان)
- expo-av (تشغيل القرآن)
- expo-location (تحديد الموقع)
- expo-speech (النطق بالعربية)
- expo-file-system (تخزين السور)
- expo-haptics (الاهتزاز)
- expo-background-fetch + expo-task-manager (الخلفية)
- Zustand + React Query (إدارة الحالة)
- I18nManager.forceRTL(true) (واجهة عربية RTL)
