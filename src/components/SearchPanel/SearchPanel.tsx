'use client';

import { useState, useCallback } from 'react';
import type { Place } from '@/lib/types';
import { getCurrentDateTime } from '@/lib/timeUtils';
import StationInput from './StationInput';
import SearchTypeSelector from './SearchTypeSelector';
import DateTimePicker from './DateTimePicker';
import styles from './SearchPanel.module.css';

type SearchType = 'departure' | 'arrival' | 'first' | 'last';

export interface SearchParams {
  from: Place;
  to: Place;
  type: SearchType;
  date: string;
  time: string;
}

interface SearchPanelProps {
  onSearch: (params: SearchParams) => void;
  isSearching: boolean;
  /** 外部から出発地をセット */
  externalFrom?: Place | null;
  /** 外部から到着地をセット */
  externalTo?: Place | null;
  /** 外部セットを消費したことを通知 */
  onExternalConsumed?: () => void;
}

export default function SearchPanel({
  onSearch,
  isSearching,
  externalFrom,
  externalTo,
  onExternalConsumed,
}: SearchPanelProps) {
  const now = getCurrentDateTime();
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [searchType, setSearchType] = useState<SearchType>('departure');
  const [date, setDate] = useState(now.date);
  const [time, setTime] = useState(now.time);

  /** 外部からのセットを反映 */
  const actualFrom = externalFrom !== undefined ? (externalFrom ?? from) : from;
  const actualTo = externalTo !== undefined ? (externalTo ?? to) : to;

  /** 出発地セット */
  const handleFromSelect = useCallback((place: Place) => {
    setFrom(place);
    onExternalConsumed?.();
  }, [onExternalConsumed]);

  /** 到着地セット */
  const handleToSelect = useCallback((place: Place) => {
    setTo(place);
    onExternalConsumed?.();
  }, [onExternalConsumed]);

  /** 出発↔到着入れ替え */
  const handleSwap = useCallback(() => {
    const tmpFrom = actualFrom;
    const tmpTo = actualTo;
    setFrom(tmpTo);
    setTo(tmpFrom);
    onExternalConsumed?.();
  }, [actualFrom, actualTo, onExternalConsumed]);

  /** 検索実行 */
  const handleSearch = useCallback(() => {
    if (!actualFrom || !actualTo) return;
    onSearch({
      from: actualFrom,
      to: actualTo,
      type: searchType,
      date,
      time,
    });
  }, [actualFrom, actualTo, searchType, date, time, onSearch]);

  /** 現在時刻にリセット */
  const handleSetNow = useCallback(() => {
    const n = getCurrentDateTime();
    setDate(n.date);
    setTime(n.time);
  }, []);

  const canSearch = actualFrom && actualTo && !isSearching;

  return (
    <div className={`${styles.panel} glass`}>
      <div className={styles.stationInputs}>
        <StationInput
          label="出発"
          iconColor="#5B8CFF"
          value={actualFrom}
          onSelect={handleFromSelect}
          onClear={() => { setFrom(null); onExternalConsumed?.(); }}
          placeholder="出発地を検索"
        />

        <button
          className={`${styles.swapButton} pressable`}
          onClick={handleSwap}
          aria-label="出発地と到着地を入れ替え"
          title="入れ替え"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" />
          </svg>
        </button>

        <div className={styles.divider} />

        <StationInput
          label="到着"
          iconColor="#FF6B6B"
          value={actualTo}
          onSelect={handleToSelect}
          onClear={() => { setTo(null); onExternalConsumed?.(); }}
          placeholder="到着地を検索"
        />
      </div>

      <div className={styles.options}>
        <SearchTypeSelector value={searchType} onChange={setSearchType} />
        <DateTimePicker
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
          onSetNow={handleSetNow}
        />
      </div>

      <button
        className={`${styles.searchButton} pressable`}
        onClick={handleSearch}
        disabled={!canSearch}
      >
        {isSearching ? (
          <span className={styles.searchSpinner} />
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            ルートを検索
          </>
        )}
      </button>
    </div>
  );
}
