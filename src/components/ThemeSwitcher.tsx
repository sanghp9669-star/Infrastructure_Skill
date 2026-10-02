import React from 'react';
import { Sun, Moon, Compass, Waves, Check } from 'lucide-react';
import { AppTheme } from '../types/skills';

interface ThemeSwitcherProps {
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  currentTheme,
  onThemeChange
}) => {
  const themes: { id: AppTheme; label: string; icon: React.ReactNode; tooltip: string }[] = [
    {
      id: 'light',
      label: 'Sáng',
      icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
      tooltip: 'Giao diện Sáng (White Mode - Chuẩn)'
    },
    {
      id: 'dark',
      label: 'Tối',
      icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
      tooltip: 'Giao diện Tối (Dark Mode - Dịu mắt)'
    },
    {
      id: 'blue',
      label: 'Navy',
      icon: <Waves className="w-3.5 h-3.5 text-sky-400" />,
      tooltip: 'Giao diện Xanh Doanh Nghiệp (Blue NOC Mode)'
    }
  ];

  return (
    <div
      className="inline-flex items-center p-1 rounded-xl border transition-colors bg-slate-100/90 border-slate-200/80 shadow-2xs"
      role="group"
      aria-label="Theme switcher"
    >
      {themes.map(t => {
        const isActive = currentTheme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onThemeChange(t.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              isActive
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
            title={t.tooltip}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
