import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => changeLanguage('es')}
        className={`text-xl leading-none transition-opacity rounded-sm px-0.5 ${current === 'es' ? 'opacity-100 ring-2 ring-primary ring-offset-1' : 'opacity-50 hover:opacity-80'}`}
        title="Español"
        aria-label="Español"
      >
        🇪🇸
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`text-xl leading-none transition-opacity rounded-sm px-0.5 ${current === 'en' ? 'opacity-100 ring-2 ring-primary ring-offset-1' : 'opacity-50 hover:opacity-80'}`}
        title="English"
        aria-label="English"
      >
        🇬🇧
      </button>
    </div>
  );
}
