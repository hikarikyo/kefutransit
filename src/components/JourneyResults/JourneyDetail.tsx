'use client';

import type { GuidanceOption, Journey, Leg, TransitLeg, WalkLeg } from '@/lib/types';
import { secsToTimeString, secsToMinutes } from '@/lib/timeUtils';
import RouteMap from './RouteMap';
import styles from './JourneyDetail.module.css';

interface JourneyDetailProps {
  journey: Journey;
  mapData?: GuidanceOption['map'];
}

/** モードアイコン */
function getModeEmoji(mode: string): string {
  switch (mode) {
    case 'rail': return '🚃';
    case 'subway': return '🚇';
    case 'bus': return '🚌';
    case 'tram': return '🚊';
    case 'ferry': return '⛴️';
    case 'monorail': return '🚝';
    case 'funicular': return '🚠';
    case 'aerialLift': return '🚡';
    case 'air': return '✈️';
    default: return '🚃';
  }
}

export default function JourneyDetail({ journey, mapData }: JourneyDetailProps) {
  return (
    <div className={styles.container}>
      {/* 経路マップ（データがある場合のみ） */}
      {mapData && (
        <RouteMap mapData={mapData} />
      )}

      {/* タイムライン */}
      <div className={styles.timeline}>
        {journey.legs.map((leg, index) => (
          <div key={index}>
            {leg.kind === 'transit' ? (
              <TransitLegView leg={leg} />
            ) : (
              <WalkLegView leg={leg} />
            )}
            {/* 乗換待ち時間 */}
            {index < journey.legs.length - 1 && (() => {
              const nextLeg = journey.legs[index + 1];
              const waitSecs = nextLeg.departureSecs - leg.arrivalSecs;
              if (waitSecs > 0 && leg.kind === 'transit' && nextLeg.kind === 'transit') {
                return (
                  <div className={styles.waitTime}>
                    <span className={styles.waitIcon}>⏳</span>
                    <span>乗換 {secsToMinutes(waitSecs)}</span>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 乗車区間 */
function TransitLegView({ leg }: { leg: TransitLeg }) {
  const color = leg.color ? `#${leg.color}` : 'var(--color-text-muted)';
  const departureTime = secsToTimeString(leg.departureSecs);
  const arrivalTime = secsToTimeString(leg.arrivalSecs);
  const duration = secsToMinutes(leg.arrivalSecs - leg.departureSecs);

  return (
    <div className={styles.transitLeg}>
      {/* 出発駅 */}
      <div className={styles.stop}>
        <div className={styles.timeCol}>
          <span className={styles.stopTime}>{departureTime}</span>
          <span className={styles.timeLabel}>発</span>
        </div>
        <div className={styles.lineCol}>
          <div className={styles.dot} style={{ borderColor: color }} />
          <div className={styles.line} style={{ backgroundColor: color }} />
        </div>
        <div className={styles.infoCol}>
          <span className={styles.stopName}>{leg.from.name}</span>
          {leg.from.platformCode && (
            <span className={styles.platform}>{leg.from.platformCode}番線</span>
          )}
        </div>
      </div>

      {/* 路線情報 */}
      <div className={styles.routeInfo}>
        <div className={styles.lineCol}>
          <div className={styles.line} style={{ backgroundColor: color }} />
        </div>
        <div className={styles.routeDetail}>
          <span className={styles.routeEmoji}>{getModeEmoji(leg.mode)}</span>
          <div className={styles.routeText}>
            <span className={styles.routeName} style={{ color }}>{leg.routeName}</span>
            {leg.headsign && <span className={styles.headsign}>{leg.headsign}</span>}
            <span className={styles.legDuration}>{duration}</span>
          </div>
        </div>
      </div>

      {/* 到着駅 */}
      <div className={styles.stop}>
        <div className={styles.timeCol}>
          <span className={styles.stopTime}>{arrivalTime}</span>
          <span className={styles.timeLabel}>着</span>
        </div>
        <div className={styles.lineCol}>
          <div className={styles.line} style={{ backgroundColor: color }} />
          <div className={styles.dot} style={{ borderColor: color }} />
        </div>
        <div className={styles.infoCol}>
          <span className={styles.stopName}>{leg.to.name}</span>
          {leg.to.platformCode && (
            <span className={styles.platform}>{leg.to.platformCode}番線</span>
          )}
        </div>
      </div>
    </div>
  );
}

/** 徒歩区間 */
function WalkLegView({ leg }: { leg: WalkLeg }) {
  const duration = secsToMinutes(leg.arrivalSecs - leg.departureSecs);

  return (
    <div className={styles.walkLeg}>
      <div className={styles.stop}>
        <div className={styles.timeCol}>
          <span className={styles.stopTime}>{secsToTimeString(leg.departureSecs)}</span>
        </div>
        <div className={styles.lineCol}>
          <div className={styles.dot} style={{ borderColor: 'var(--color-text-muted)' }} />
          <div className={`${styles.line} ${styles.walkLine}`} />
        </div>
        <div className={styles.infoCol}>
          <span className={styles.walkInfo}>
            🚶 徒歩 {duration}
          </span>
          <span className={styles.walkFrom}>
            {leg.from.name} → {leg.to.name}
          </span>
        </div>
      </div>
    </div>
  );
}
