const MYMEMORY_LANGUAGES = {
  hi: "hi",
  mr: "mr",
  ta: "ta",
  te: "te",
  bn: "bn",
  pa: "pa",
  gu: "gu",
  ml: "ml",
  kn: "kn",
  ur: "ur",
  ar: "ar",
  zh: "zh",
  fr: "fr",
  de: "de",
  es: "es",
  pt: "pt",
  ru: "ru",
  ja: "ja",
  ko: "ko",
};

export async function translateToEnglish(text, sourceLang) {
  if (sourceLang === "en") return text;

  const langCode = MYMEMORY_LANGUAGES[sourceLang] || sourceLang;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langCode}|en`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
  } catch {
  }
  return text;
}

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi (हिन्दी)" },
  { code: "mr", label: "Marathi (मराठी)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "te", label: "Telugu (తెలుగు)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "pa", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "gu", label: "Gujarati (ગુજરાતી)" },
  { code: "ml", label: "Malayalam (മലയാളം)" },
  { code: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ur", label: "Urdu (اردو)" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
];
