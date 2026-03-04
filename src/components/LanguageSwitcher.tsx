import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/i18n';

function SpainFlag() {
  return (
    <svg viewBox="0 0 30 20" className="w-7 h-5 rounded-sm" aria-hidden="true">
      <rect width="30" height="20" fill="#c60b1e" />
      <rect y="5" width="30" height="10" fill="#ffc400" />
    </svg>
  );
}

function UKFlag() {
  return (
    <svg viewBox="0 0 60 30" className="w-7 h-5 rounded-sm" aria-hidden="true">
      <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  );
}

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => changeLanguage('es')}
        className={`transition-all rounded-sm p-0.5 border-2 ${current === 'es' ? 'border-primary shadow-md scale-110' : 'border-transparent opacity-60 hover:opacity-90 hover:scale-105'}`}
        title="Español"
        aria-label="Español"
      >
        <SpainFlag />
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`transition-all rounded-sm p-0.5 border-2 ${current === 'en' ? 'border-primary shadow-md scale-110' : 'border-transparent opacity-60 hover:opacity-90 hover:scale-105'}`}
        title="English"
        aria-label="English"
      >
        <UKFlag />
      </button>
    </div>
  );
}
