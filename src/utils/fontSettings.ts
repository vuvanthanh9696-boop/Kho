import { FontSettings, DEFAULT_FONT_SETTINGS, FONT_FAMILY_MAP, FontFamilyOption } from '../types';

const STORAGE_KEY = 'docuflow_font_settings';

export function getStoredFontSettings(): FontSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FONT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      fontSize: typeof parsed.fontSize === 'number' && parsed.fontSize >= 12 && parsed.fontSize <= 24 ? parsed.fontSize : DEFAULT_FONT_SETTINGS.fontSize,
      fontFamily: (['times', 'arial', 'system'].includes(parsed.fontFamily) ? parsed.fontFamily : DEFAULT_FONT_SETTINGS.fontFamily) as FontFamilyOption,
    };
  } catch {
    return DEFAULT_FONT_SETTINGS;
  }
}

export function applyFontSettings(settings: FontSettings): void {
  const root = document.documentElement;
  const familyValue = FONT_FAMILY_MAP[settings.fontFamily] || FONT_FAMILY_MAP.times;

  // Set font size on root element (scales all rem units across the entire app)
  root.style.fontSize = `${settings.fontSize}px`;
  root.style.setProperty('--app-base-size', `${settings.fontSize}px`);
  root.style.setProperty('--app-font-family', familyValue);

  // Directly set on body and root to override any Tailwind utility defaults
  if (document.body) {
    document.body.style.fontFamily = familyValue;
  }
}

export function saveFontSettings(settings: FontSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applyFontSettings(settings);
  } catch (err) {
    console.error('Failed to save font settings', err);
  }
}
