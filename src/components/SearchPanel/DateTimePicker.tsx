'use client';

import { useState, useMemo } from 'react';
import { formatDate, dateToYYYYMMDD, dateToHHMM } from '@/lib/timeUtils';
import styles from './DateTimePicker.module.css';

interface DateTimePickerProps {
  date: string; // YYYYMMDD
  time: string; // HH:MM
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onSetNow: () => void;
}

export default function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  onSetNow,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  /** 表示用の文字列 */
  const displayText = useMemo(() => {
    const dateStr = formatDate(date);
    return `${dateStr} ${time}`;
  }, [date, time]);

  /** date input用のYYYY-MM-DD形式 */
  const dateInputValue = useMemo(() => {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  }, [date]);

  return (
    <div className={styles.container}>
      <button
        className={`${styles.trigger} pressable`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.icon}>📅</span>
        <span className={styles.text}>{displayText}</span>
        <span className={`${styles.chevron} ${isOpen ? styles.open : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.row}>
            <label className={styles.label}>日付</label>
            <input
              type="date"
              className={styles.input}
              value={dateInputValue}
              onChange={(e) => {
                const d = new Date(e.target.value);
                if (!isNaN(d.getTime())) {
                  onDateChange(dateToYYYYMMDD(d));
                }
              }}
            />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>時刻</label>
            <input
              type="time"
              className={styles.input}
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
            />
          </div>
          <button
            className={`${styles.nowButton} pressable`}
            onClick={() => {
              onSetNow();
              setIsOpen(false);
            }}
          >
            現在時刻に設定
          </button>
        </div>
      )}
    </div>
  );
}
