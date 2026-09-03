import { computed, effect, Injectable, signal } from '@angular/core';
import { TRANSLATIONS, TranslationKey } from './translations';

export type Lang = 'es' | 'en';

export const LANGS: readonly Lang[] = ['es', 'en'];

const STORAGE_KEY = 'tripsync.lang';

/** Claves con variante singular/plural (`.one` / `.other`). */
export type PluralKey = 'common.activities' | 'common.days';

function isLang(value: string | null): value is Lang {
  return value === 'es' || value === 'en';
}

function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return 'es';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // localStorage bloqueado (modo privado): seguimos con el idioma del navegador.
  }
  const nav = window.navigator?.language ?? '';
  return nav.toLowerCase().startsWith('en') ? 'en' : 'es';
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/**
 * Estado de idioma de la app. `t()` lee la señal `lang`, así que llamarlo
 * desde una plantilla la vuelve a evaluar sola al cambiar de idioma
 * (funciona con OnPush sin tocar nada más).
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _lang = signal<Lang>(detectInitialLang());

  readonly lang = this._lang.asReadonly();

  /** Locale para DatePipe y `toLocaleDateString`. */
  readonly dateLocale = computed(() => (this._lang() === 'es' ? 'es' : 'en-US'));

  constructor() {
    effect(() => {
      const lang = this._lang();
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
        document.title = TRANSLATIONS[lang]['meta.title'];
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Sin persistencia: el idioma vale para esta sesión.
      }
    });
  }

  setLang(lang: Lang) {
    this._lang.set(lang);
  }

  toggle() {
    this._lang.update((lang) => (lang === 'es' ? 'en' : 'es'));
  }

  /** Arrow function para poder exponerla directamente en las plantillas. */
  readonly t = (key: TranslationKey, params?: Record<string, string | number>): string =>
    interpolate(TRANSLATIONS[this._lang()][key] ?? key, params);

  /** Variante plural: `tp('common.days', 3)` → "3 días" / "3 days". */
  readonly tp = (key: PluralKey, count: number): string =>
    this.t(`${key}.${count === 1 ? 'one' : 'other'}` as TranslationKey, { count });
}
