'use client';

import type { GuidanceOption, TransitLeg, Strategy } from '@/lib/types';
import { secsToTimeString, secsToDuration } from '@/lib/timeUtils';
import styles from './JourneyCard.module.css';

interface JourneyCardProps {
  option: GuidanceOption;
  isExpanded: boolean;
  onClick: () => void;
}

/** selectedFor の日本語ラベル */
function getStrategyLabel(strategy: Strategy): string {
  switch (strategy) {
    case 'fastest': return '最速';
    case 'fewestTransfers': return '乗換少';
    case 'lowestFare': return '最安';
    case 'shortestWalk': return '徒歩少';
    case 'balanced': return 'おすすめ';
    default: return '';
  }
}

/** selectedFor のアイコン */
function getStrategyIcon(strategy: Strategy): string {
  switch (strategy) {
    case 'fastest': return '⚡';
    case 'fewestTransfers': return '🔄';
    case 'lowestFare': return '💰';
    case 'shortestWalk': return '🚶';
    case 'balanced': return '⭐';
    default: return '';
  }
}

export default function JourneyCard({ option, isExpanded, onClick }: JourneyCardProps) {
  const { journey, metrics, recommended, selectedFor } = option;
  const departureTime = secsToTimeString(journey.departureSecs);
  const arrivalTime = secsToTimeString(journey.arrivalSecs);
  const duration = secsToDuration(metrics.durationSecs);

  /** 乗車区間（transitのみ）の路線カラーを取得 */
  const transitLegs = journey.legs.filter((leg): leg is TransitLeg => leg.kind === 'transit');

  return (
    <div
      className={`${styles.card} ${recommended ? styles.recommended : ''} ${isExpanded ? styles.expanded : ''} pressable`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
    >
      {/* バッジ */}
      <div className={styles.badges}>
        {selectedFor && (
          <span className={`${styles.badge} ${styles[`badge_${selectedFor}`] || ''}`}>
            {getStrategyIcon(selectedFor)} {getStrategyLabel(selectedFor)}
          </span>
        )}
      </div>

      {/* メイン情報 */}
      <div className={styles.main}>
        <div className={styles.timeRow}>
          <span className={styles.time}>{departureTime}</span>
          <span className={styles.arrow}>→</span>
          <span className={styles.time}>{arrivalTime}</span>
          <span className={styles.duration}>{duration}</span>
        </div>

        {/* 路線カラーバー */}
        <div className={styles.routeBar}>
          {transitLegs.map((leg, i) => (
            <div
              key={i}
              className={styles.routeSegment}
              style={{
                backgroundColor: leg.color ? `#${leg.color}` : 'var(--color-text-muted)',
                flex: leg.arrivalSecs - leg.departureSecs,
              }}
              title={leg.routeName}
            />
          ))}
        </div>

        {/* 路線名 */}
        <div className={styles.routeNames}>
          {transitLegs.map((leg, i) => (
            <span key={i} className={styles.routeName}>
              <span
                className={styles.routeDot}
                style={{ backgroundColor: leg.color ? `#${leg.color}` : 'var(--color-text-muted)' }}
              />
              {leg.routeName}
            </span>
          ))}
        </div>
      </div>

      {/* メタ情報 */}
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          🔄 乗換{journey.transferCount}回
        </span>
        {metrics.fare && (
          <span className={styles.metaItem}>
            ¥{metrics.fare.ticket.toLocaleString()}
            {metrics.fare.ic && metrics.fare.ic !== metrics.fare.ticket && (
              <span className={styles.icFare}>(IC ¥{metrics.fare.ic.toLocaleString()})</span>
            )}
          </span>
        )}
        {metrics.walkSecs > 0 && (
          <span className={styles.metaItem}>
            🚶 徒歩{Math.round(metrics.walkSecs / 60)}分
          </span>
        )}
      </div>

      {/* 展開インジケータ */}
      <div className={`${styles.expandIndicator} ${isExpanded ? styles.expandedIndicator : ''}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}
