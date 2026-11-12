// =====================================================================
//  הגדרות מסך הלובי — כל מה שצריך לשנות נמצא כאן
// =====================================================================
export const CONFIG = {
  // --- טקסטים בכותרת ---
  WELCOME_TEXT: 'ברוכים הבאים',
  BUILDING_ADDRESS: 'רחוב הדוגמה 12, רמלה',
  // לוגו: שם קובץ בתוך assets/ (למשל 'logo.png'). ריק = מוצג הטקסט LOGO_TEXT
  LOGO_IMAGE: '',
  LOGO_TEXT: 'לוגו הבניין',

  // --- מיקום (רמלה) ---
  LOCATION_NAME: 'רמלה והסביבה',
  LATITUDE: 31.9286,
  LONGITUDE: 34.8706,
  ELEVATION: 80,
  TIMEZONE: 'Asia/Jerusalem',

  // --- זמני שבת ---
  CANDLE_LIGHTING_MINUTES: 20, // דקות לפני השקיעה
  HAVDALAH_DEGREES: 8.5,       // צאת שבת / חג

  // --- ברכות שבת וחג ---
  SHABBAT_BANNER: 'שבת שלום ומבורך',
  HOLIDAY_BANNER: 'חג שמח',
  SHABBAT_NOTICE: {
    category: 'שבת שלום',
    title: 'שבת שלום לכל דיירי הבניין',
    body: 'מאחלים לכם שבת של מנוחה, שלווה ושמחה.',
  },
  HOLIDAY_NOTICE: {
    category: 'חג שמח',
    title: 'חג שמח לכל דיירי הבניין',
    body: 'מאחלים לכם חג של מנוחה, שלווה ושמחה.',
  },

  // --- מצב לילה (כשזה לא שבת) ---
  NIGHT_START: '23:00',
  NIGHT_END: '06:00',

  // --- Google Sheets (פרסום באינטרנט כ-CSV). ריק = שימוש ב-data/content.json ---
  NOTICES_CSV_URL: '',
  PHOTOS_CSV_URL: '',

  // --- תמונות (קבצים בתוך assets/photos/) ---
  // תמונות הבניין כאן משמשות רק אם אין גיליון וגם data/content.json לא נטען
  DEFAULT_BUILDING_PHOTOS: ['building-1.jpg', 'building-2.jpg', 'building-3.jpg'],
  LANDSCAPE_PHOTO: 'beach.jpg',
  CANDLES_PHOTO: 'candles.jpg',

  // --- תזמונים (במילישניות) ---
  NOTICE_ROTATE_MS: 12000,
  PHOTO_ROTATE_MS: 15000,
  CONTENT_REFRESH_MS: 5 * 60 * 1000,
  WEATHER_REFRESH_MS: 15 * 60 * 1000,
  NEWS_REFRESH_MS: 10 * 60 * 1000,
  VERSION_CHECK_MS: 5 * 60 * 1000,
  NIGHTLY_RELOAD: '04:00',
  TICKER_SPEED_PX_PER_SEC: 80,
};
