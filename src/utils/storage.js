export const setLanguage = (lang) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('friendly_lang', lang);
  }
};

export const getLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('friendly_lang') || 'en';
  }
  return 'en';
};
