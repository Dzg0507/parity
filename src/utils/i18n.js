// INTERNATIONALIZATION SYSTEM
// This is going to make the app GLOBALLY ACCESSIBLE! 🌍

import { storage } from './storage';

// 1. I18N MANAGER
export class I18nManager {
  constructor() {
    this.translations = new Map();
    this.currentLocale = 'en';
    this.fallbackLocale = 'en';
    this.pluralRules = new Map();
  }

  // Set locale
  async setLocale(locale) {
    this.currentLocale = locale;
    await storage.setItem('current_locale', locale);
  }

  // Get locale
  async getLocale() {
    const stored = await storage.getItem('current_locale');
    return stored || this.currentLocale;
  }

  // Add translations
  async addTranslations(locale, translations) {
    const existing = this.translations.get(locale) || {};
    const merged = { ...existing, ...translations };
    this.translations.set(locale, merged);
    await this.storeTranslations(locale, merged);
  }

  // Get translation
  t(key, params = {}, locale = null) {
    const targetLocale = locale || this.currentLocale;
    const translation = this.getTranslation(key, targetLocale);
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in locale: ${targetLocale}`);
      return key;
    }

    return this.interpolate(translation, params);
  }

  // Get translation with fallback
  getTranslation(key, locale) {
    const keys = key.split('.');
    let translation = this.translations.get(locale);
    
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        // Try fallback locale
        if (locale !== this.fallbackLocale) {
          return this.getTranslation(key, this.fallbackLocale);
        }
        return null;
      }
    }
    
    return translation;
  }

  // Interpolate parameters
  interpolate(text, params) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] || match;
    });
  }

  // Store translations
  async storeTranslations(locale, translations) {
    await storage.setItem(`translations_${locale}`, JSON.stringify(translations));
  }

  // Load translations
  async loadTranslations(locale) {
    const stored = await storage.getItem(`translations_${locale}`);
    if (stored) {
      const translations = JSON.parse(stored);
      this.translations.set(locale, translations);
      return translations;
    }
    return null;
  }

  // Get available locales
  getAvailableLocales() {
    return Array.from(this.translations.keys());
  }

  // Get translation coverage
  getTranslationCoverage(locale) {
    const translations = this.translations.get(locale);
    const fallback = this.translations.get(this.fallbackLocale);
    
    if (!translations || !fallback) return 0;
    
    const totalKeys = this.countKeys(fallback);
    const translatedKeys = this.countKeys(translations);
    
    return (translatedKeys / totalKeys) * 100;
  }

  // Count keys in object
  countKeys(obj) {
    let count = 0;
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        count += this.countKeys(obj[key]);
      } else {
        count++;
      }
    }
    return count;
  }
}

export const i18nManager = new I18nManager();

// 2. TRANSLATION LOADER
export class TranslationLoader {
  constructor() {
    this.i18nManager = i18nManager;
  }

  // Load default translations
  async loadDefaultTranslations() {
    const translations = {
      en: {
        common: {
          save: 'Save',
          cancel: 'Cancel',
          delete: 'Delete',
          edit: 'Edit',
          back: 'Back',
          next: 'Next',
          previous: 'Previous',
          done: 'Done',
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
          warning: 'Warning',
          info: 'Info',
        },
        auth: {
          login: 'Login',
          logout: 'Logout',
          register: 'Register',
          email: 'Email',
          password: 'Password',
          confirmPassword: 'Confirm Password',
          forgotPassword: 'Forgot Password?',
          resetPassword: 'Reset Password',
        },
        sessions: {
          newSession: 'New Session',
          soloPrep: 'Solo Prep',
          jointUnpack: 'Joint Unpack',
          journal: 'Journal',
          prompts: 'Prompts',
          briefing: 'Briefing',
        },
        ai: {
          coach: 'AI Coach',
          recommendations: 'Recommendations',
          analytics: 'Analytics',
          insights: 'Insights',
        },
        gamification: {
          points: 'Points',
          level: 'Level',
          achievements: 'Achievements',
          badges: 'Badges',
          streak: 'Streak',
        },
      },
      es: {
        common: {
          save: 'Guardar',
          cancel: 'Cancelar',
          delete: 'Eliminar',
          edit: 'Editar',
          back: 'Atrás',
          next: 'Siguiente',
          previous: 'Anterior',
          done: 'Hecho',
          loading: 'Cargando...',
          error: 'Error',
          success: 'Éxito',
          warning: 'Advertencia',
          info: 'Información',
        },
        auth: {
          login: 'Iniciar Sesión',
          logout: 'Cerrar Sesión',
          register: 'Registrarse',
          email: 'Correo Electrónico',
          password: 'Contraseña',
          confirmPassword: 'Confirmar Contraseña',
          forgotPassword: '¿Olvidaste tu Contraseña?',
          resetPassword: 'Restablecer Contraseña',
        },
        sessions: {
          newSession: 'Nueva Sesión',
          soloPrep: 'Preparación Individual',
          jointUnpack: 'Desempaque Conjunto',
          journal: 'Diario',
          prompts: 'Preguntas',
          briefing: 'Informe',
        },
        ai: {
          coach: 'Entrenador IA',
          recommendations: 'Recomendaciones',
          analytics: 'Analíticas',
          insights: 'Perspectivas',
        },
        gamification: {
          points: 'Puntos',
          level: 'Nivel',
          achievements: 'Logros',
          badges: 'Insignias',
          streak: 'Racha',
        },
      },
      fr: {
        common: {
          save: 'Enregistrer',
          cancel: 'Annuler',
          delete: 'Supprimer',
          edit: 'Modifier',
          back: 'Retour',
          next: 'Suivant',
          previous: 'Précédent',
          done: 'Terminé',
          loading: 'Chargement...',
          error: 'Erreur',
          success: 'Succès',
          warning: 'Avertissement',
          info: 'Information',
        },
        auth: {
          login: 'Se Connecter',
          logout: 'Se Déconnecter',
          register: 'S\'inscrire',
          email: 'Email',
          password: 'Mot de Passe',
          confirmPassword: 'Confirmer le Mot de Passe',
          forgotPassword: 'Mot de Passe Oublié?',
          resetPassword: 'Réinitialiser le Mot de Passe',
        },
        sessions: {
          newSession: 'Nouvelle Session',
          soloPrep: 'Préparation Solo',
          jointUnpack: 'Déballage Conjoint',
          journal: 'Journal',
          prompts: 'Questions',
          briefing: 'Briefing',
        },
        ai: {
          coach: 'Coach IA',
          recommendations: 'Recommandations',
          analytics: 'Analytiques',
          insights: 'Aperçus',
        },
        gamification: {
          points: 'Points',
          level: 'Niveau',
          achievements: 'Réalisations',
          badges: 'Badges',
          streak: 'Série',
        },
      },
    };

    for (const [locale, translation] of Object.entries(translations)) {
      await this.i18nManager.addTranslations(locale, translation);
    }
  }
}

export const translationLoader = new TranslationLoader();

// 3. PLURALIZATION
export class Pluralization {
  constructor() {
    this.rules = new Map();
    this.initializeRules();
  }

  // Initialize pluralization rules
  initializeRules() {
    // English rules
    this.rules.set('en', (n) => {
      if (n === 1) return 'one';
      return 'other';
    });

    // Spanish rules
    this.rules.set('es', (n) => {
      if (n === 1) return 'one';
      return 'other';
    });

    // French rules
    this.rules.set('fr', (n) => {
      if (n < 2) return 'one';
      return 'other';
    });
  }

  // Get plural form
  getPluralForm(locale, count) {
    const rule = this.rules.get(locale);
    if (!rule) return 'other';
    
    return rule(count);
  }

  // Format plural text
  formatPlural(locale, count, forms) {
    const form = this.getPluralForm(locale, count);
    const text = forms[form] || forms.other || '';
    
    return text.replace('{{count}}', count);
  }
}

export const pluralization = new Pluralization();

// 4. DATE AND TIME FORMATTING
export class DateTimeFormatting {
  constructor() {
    this.formatters = new Map();
    this.initializeFormatters();
  }

  // Initialize formatters
  initializeFormatters() {
    // English formatters
    this.formatters.set('en', {
      date: new Intl.DateTimeFormat('en-US'),
      time: new Intl.DateTimeFormat('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      datetime: new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    });

    // Spanish formatters
    this.formatters.set('es', {
      date: new Intl.DateTimeFormat('es-ES'),
      time: new Intl.DateTimeFormat('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      datetime: new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    });

    // French formatters
    this.formatters.set('fr', {
      date: new Intl.DateTimeFormat('fr-FR'),
      time: new Intl.DateTimeFormat('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      datetime: new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    });
  }

  // Format date
  formatDate(locale, date) {
    const formatter = this.formatters.get(locale);
    if (!formatter) return date.toLocaleDateString();
    
    return formatter.date.format(date);
  }

  // Format time
  formatTime(locale, date) {
    const formatter = this.formatters.get(locale);
    if (!formatter) return date.toLocaleTimeString();
    
    return formatter.time.format(date);
  }

  // Format datetime
  formatDateTime(locale, date) {
    const formatter = this.formatters.get(locale);
    if (!formatter) return date.toLocaleString();
    
    return formatter.datetime.format(date);
  }
}

export const dateTimeFormatting = new DateTimeFormatting();

// 5. NUMBER FORMATTING
export class NumberFormatting {
  constructor() {
    this.formatters = new Map();
    this.initializeFormatters();
  }

  // Initialize formatters
  initializeFormatters() {
    // English formatters
    this.formatters.set('en', {
      number: new Intl.NumberFormat('en-US'),
      currency: new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }),
      percent: new Intl.NumberFormat('en-US', { 
        style: 'percent' 
      }),
    });

    // Spanish formatters
    this.formatters.set('es', {
      number: new Intl.NumberFormat('es-ES'),
      currency: new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR' 
      }),
      percent: new Intl.NumberFormat('es-ES', { 
        style: 'percent' 
      }),
    });

    // French formatters
    this.formatters.set('fr', {
      number: new Intl.NumberFormat('fr-FR'),
      currency: new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'EUR' 
      }),
      percent: new Intl.NumberFormat('fr-FR', { 
        style: 'percent' 
      }),
    });
  }

  // Format number
  formatNumber(locale, number) {
    const formatter = this.formatters.get(locale);
    if (!formatter) return number.toString();
    
    return formatter.number.format(number);
  }

  // Format currency
  formatCurrency(locale, amount, currency = 'USD') {
    const formatter = this.formatters.get(locale);
    if (!formatter) return `${currency} ${amount}`;
    
    return formatter.currency.format(amount);
  }

  // Format percent
  formatPercent(locale, value) {
    const formatter = this.formatters.get(locale);
    if (!formatter) return `${(value * 100).toFixed(2)}%`;
    
    return formatter.percent.format(value);
  }
}

export const numberFormatting = new NumberFormatting();

// 6. I18N HOOKS
export class I18nHooks {
  constructor() {
    this.i18nManager = i18nManager;
  }

  // React hook for translations
  useTranslation() {
    return {
      t: (key, params) => this.i18nManager.t(key, params),
      locale: this.i18nManager.currentLocale,
      setLocale: (locale) => this.i18nManager.setLocale(locale),
    };
  }

  // React hook for pluralization
  usePluralization() {
    return {
      formatPlural: (count, forms) => 
        pluralization.formatPlural(this.i18nManager.currentLocale, count, forms),
    };
  }

  // React hook for date formatting
  useDateTimeFormatting() {
    return {
      formatDate: (date) => 
        dateTimeFormatting.formatDate(this.i18nManager.currentLocale, date),
      formatTime: (date) => 
        dateTimeFormatting.formatTime(this.i18nManager.currentLocale, date),
      formatDateTime: (date) => 
        dateTimeFormatting.formatDateTime(this.i18nManager.currentLocale, date),
    };
  }

  // React hook for number formatting
  useNumberFormatting() {
    return {
      formatNumber: (number) => 
        numberFormatting.formatNumber(this.i18nManager.currentLocale, number),
      formatCurrency: (amount, currency) => 
        numberFormatting.formatCurrency(this.i18nManager.currentLocale, amount, currency),
      formatPercent: (value) => 
        numberFormatting.formatPercent(this.i18nManager.currentLocale, value),
    };
  }
}

export const i18nHooks = new I18nHooks();

export default {
  i18nManager,
  translationLoader,
  pluralization,
  dateTimeFormatting,
  numberFormatting,
  i18nHooks,
};
