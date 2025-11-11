const CONFIG = {
  BASE_URL: "https://story-api.dicoding.dev/v1",
  DEFAULT_LANGUAGE: "id-ID",
  CACHE_NAME: "StoryApp-V1",
  DATABASE_NAME: "story-app-database",
  DATABASE_VERSION: 1,
  OBJECT_STORE_NAME: "stories",
  PUSH_NOTIFICATION: {
    VAPID_PUBLIC_KEY:
     "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"
  },
  NOTIFICATION_ENDPOINTS: {
    SUBSCRIBE: "/notifications/subscribe",
    UNSUBSCRIBE: "/notifications/subscribe",
  },
  
};

export default CONFIG;