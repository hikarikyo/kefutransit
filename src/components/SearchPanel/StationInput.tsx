'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { suggestPlaces } from '@/lib/api';
import type { Place } from '@/lib/types';
import styles from './StationInput.module.css';

interface StationInputProps {
  /** ラベル（「出発」「到着」等） */
  label: string;
  /** アイコンの色 */
  iconColor: string;
  /** 選択済みの場所 */
  value: Place | null;
  /** 場所が選択されたときのコールバック */
  onSelect: (place: Place) => void;
  /** クリアされたときのコールバック */
  onClear: () => void;
  /** プレースホルダー */
  placeholder?: string;
}

export default function StationInput({
  label,
  iconColor,
  value,
  onSelect,
  onClear,
  placeholder = '駅・バス停・住所を検索',
}: StationInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** デバウンス付き検索 */
  const debouncedSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await suggestPlaces(q, 8);
        setSuggestions(result.places);
        setIsOpen(result.places.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  }, []);

  /** 入力ハンドラ */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setFocusedIndex(-1);
    debouncedSearch(val);
  };

  /** 候補選択 */
  const handleSelect = (place: Place) => {
    onSelect(place);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  /** クリア */
  const handleClear = () => {
    onClear();
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  /** キーボード操作 */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
          handleSelect(suggestions[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  /** 外側クリックで閉じる */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** モードアイコン */
  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'station': return '🚉';
      case 'stop': return '🚏';
      case 'place': return '📍';
      case 'address': return '🏠';
      default: return '📍';
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputRow}>
        <span className={styles.icon} style={{ color: iconColor }}>●</span>
        {value ? (
          <div className={styles.selectedValue}>
            <span className={styles.selectedName}>{value.name}</span>
            {value.description && (
              <span className={styles.selectedDesc}>{value.description}</span>
            )}
            <button
              className={`${styles.clearButton} pressable`}
              onClick={handleClear}
              aria-label="クリア"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
              placeholder={placeholder}
              aria-label={label}
              autoComplete="off"
            />
            {isLoading && <span className={styles.spinner} />}
          </>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className={styles.dropdown} role="listbox">
          {suggestions.map((place, index) => (
            <li
              key={place.id}
              className={`${styles.suggestion} ${index === focusedIndex ? styles.focused : ''}`}
              onClick={() => handleSelect(place)}
              onMouseEnter={() => setFocusedIndex(index)}
              role="option"
              aria-selected={index === focusedIndex}
            >
              <span className={styles.suggestionIcon}>{getKindIcon(place.kind)}</span>
              <div className={styles.suggestionInfo}>
                <span className={styles.suggestionName}>{place.name}</span>
                {(place.description || place.feedName) && (
                  <span className={styles.suggestionDesc}>
                    {place.description || place.feedName}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
