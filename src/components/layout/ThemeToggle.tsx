import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-3 rounded-2xl glass hover:bg-primary/10 transition-all interactive-scale shadow-lg"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600 fill-indigo-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
