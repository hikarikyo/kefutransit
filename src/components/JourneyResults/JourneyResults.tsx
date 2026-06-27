'use client';

import { useState, useCallback } from 'react';
import type { GuidancePlanResponse } from '@/lib/types';
import { formatDate } from '@/lib/timeUtils';
import {
  addFavoriteRoute,
  removeFavoriteRoute,
  isFavoriteRoute,
} from '@/lib/favorites';
import JourneyCard from './JourneyCard';
import JourneyDetail from './JourneyDetail';
import styles from './JourneyResults.module.css';

interface JourneyResultsProps {
  result: GuidancePlanResponse;
}

export default function JourneyResults({ result }: JourneyResultsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(
    isFavoriteRoute(
      result.from.id,
      result.to.id
    )
  );

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  /** お気に入り経路のトグル */
  const handleToggleFavorite = useCallback(() => {
    if (isFav) {
      removeFavoriteRoute(`${result.from.id}__${result.to.id}`);
      setIsFav(false);
    } else {
      addFavoriteRoute(
        { endpoint: result.from.id, name: result.from.name },
        { endpoint: result.to.id, name: result.to.name }
      );
      setIsFav(true);
    }
  }, [isFav, result]);

  return (
    <div className={styles.container}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <div className={styles.routeHeader}>
          <h2 className={styles.routeTitle}>
            {result.from.name} → {result.to.name}
          </h2>
          <button
            className={`${styles.favButton} pressable`}
            onClick={handleToggleFavorite}
            aria-label={isFav ? 'お気に入りから削除' : 'お気に入りに追加'}
            title={isFav ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            {isFav ? '★' : '☆'}
          </button>
        </div>
        <p className={styles.routeMeta}>
          {formatDate(result.date)} ・ {result.type === 'departure' ? '出発' : result.type === 'arrival' ? '到着' : result.type === 'first' ? '始発' : '終電'}
        </p>
        {/* カバレッジ通知 */}
        {result.coverage.notices.length > 0 && (
          <div className={styles.notices}>
            {result.coverage.notices.map((notice, i) => (
              <div key={i} className={`${styles.notice} ${styles[`notice_${notice.severity}`]}`}>
                {notice.severity === 'warning' ? '⚠️' : 'ℹ️'} {notice.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 結果カード */}
      <div className={styles.cards}>
        {result.options.map((option, index) => (
          <div
            key={option.id}
            className={styles.cardWrapper}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <JourneyCard
              option={option}
              isExpanded={expandedId === option.id}
              onClick={() => handleToggle(option.id)}
            />
            {expandedId === option.id && (
              <div className={styles.detailWrapper}>
                <JourneyDetail journey={option.journey} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
