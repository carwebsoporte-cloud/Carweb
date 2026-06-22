'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { OBDCode } from '@/lib/types';
import { searchCodes } from '@/lib/api';
import { getDict } from '@/lib/i18n';
import { useLocale, useLocalizedHref } from './LocaleProvider';
import SeverityBadge from './SeverityBadge';

export default function SearchBox() {
  const locale = useLocale();
  const t = getDict(locale).searchBox;
  const localizedHref = useLocalizedHref();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OBDCode[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      const data = await searchCodes(query, locale);
      setResults(data);
      setIsOpen(data.length > 0);
      setSelectedIndex(-1);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(localizedHref(`/buscar?q=${encodeURIComponent(query.trim().toUpperCase())}`));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      router.push(localizedHref(`/code/${results[selectedIndex].code}`));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative group">
        {/* Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] rounded-2xl blur-md opacity-30 group-focus-within:opacity-60 transition-opacity duration-300" />

        <div className="relative flex items-center glass-strong rounded-2xl overflow-hidden">
          {/* Icono */}
          <div className="pl-5 text-neon" aria-hidden="true">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder={t.placeholder}
            className="flex-1 px-4 py-4 bg-transparent text-white placeholder-slate-500 focus:outline-none uppercase"
            autoComplete="off"
            aria-label={t.ariaLabel}
            role="combobox"
            aria-expanded={isOpen && results.length > 0}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
          />

          <button
            type="submit"
            className="m-1.5 px-6 py-2.5 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#00d4ff]/40 shrink-0"
          >
            {t.button}
          </button>
        </div>

        {/* Autocomplete */}
        {isOpen && results.length > 0 && (
          <ul
            id="search-suggestions"
            role="listbox"
            aria-label="Sugerencias de códigos"
            className="absolute left-0 right-0 top-full mt-2 glass-strong rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50"
            onMouseLeave={() => setSelectedIndex(-1)}
          >
            {results.map((item, index) => (
              <li key={item.code} className="cursor-pointer" role="option" aria-selected={index === selectedIndex}>
                <a
                  href={localizedHref(`/code/${item.code}`)}
                  className={`flex items-center justify-between px-4 py-3 transition-colors border-b border-white/5 last:border-b-0 ${
                    index === selectedIndex ? 'bg-neon/10' : 'hover:bg-white/5'
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-neon font-mono font-bold">{item.code}</span>
                    <span className="text-slate-300 text-sm truncate">{item.title}</span>
                  </div>
                  <SeverityBadge severity={item.severity} size="sm" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
