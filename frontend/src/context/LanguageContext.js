import { createContext, useContext, useState, useEffect } from 'react';
import parse from 'html-react-parser';
import translations from '../translations';

const LanguageContext = createContext();

const getNested = (obj, path) =>
  path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

const interpolate = (str, vars = {}) => {
  return str.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    return vars[key.trim()] !== undefined ? vars[key.trim()] : '';
  });
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const t = (key, vars = {}) => {
    const rawString = getNested(translations[language], key) || key;
    return interpolate(rawString, vars);
  };

  const tWithHtml = (key, vars = {}) => {
    return parse(t(key, vars));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tWithHtml }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
