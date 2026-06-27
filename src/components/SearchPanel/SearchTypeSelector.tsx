'use client';

import styles from './SearchTypeSelector.module.css';

type SearchType = 'departure' | 'arrival' | 'first' | 'last';

interface SearchTypeSelectorProps {
  value: SearchType;
  onChange: (type: SearchType) => void;
}

const TYPES: { value: SearchType; label: string }[] = [
  { value: 'departure', label: '出発' },
  { value: 'arrival', label: '到着' },
  { value: 'first', label: '始発' },
  { value: 'last', label: '終電' },
];

export default function SearchTypeSelector({ value, onChange }: SearchTypeSelectorProps) {
  return (
    <div className={styles.container} role="radiogroup" aria-label="検索タイプ">
      {TYPES.map((type) => (
        <button
          key={type.value}
          className={`${styles.option} ${value === type.value ? styles.active : ''} pressable`}
          onClick={() => onChange(type.value)}
          role="radio"
          aria-checked={value === type.value}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
