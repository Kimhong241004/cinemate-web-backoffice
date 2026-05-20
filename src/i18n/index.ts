import { en } from './en';
import { km } from './km';

export const translations = {
  en,
  km,
};

export type Language = 'en' | 'km';
export type TranslationKeys = typeof en;

export { en, km };
