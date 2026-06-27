'use client';

import styles from './NearbyStations.module.css';
import { useState, useCallback } from 'react';
import { getCurrentPosition } from '@/lib/geolocation';
import { reversePlaces } from '@/lib/api';
import type { Place } from '@/lib/types';

interface NearbyStationsProps {
  /** 駅が選択された時のコールバック */
  onSelectStation: (place: Place) => void;
}

/** 現在地周辺の駅・停留所を表示するコンポーネント */
export default function NearbyStations({ onSelectStation }: NearbyStationsProps) {
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  /** 現在地から周辺駅を取得 */
  const handleLoadNearby = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pos = await getCurrentPosition();
      const result = await reversePlaces(pos.lat, pos.lon, 10, 500);
      setNearbyPlaces(result.places);
      setHasLoaded(true);
      if (result.places.length === 0) {
        setError('周辺に駅・停留所が見つかりませんでした');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '位置情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** 種別アイコン */
  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'station': return '🚉';
      case 'stop': return '🚏';
      case 'place': return '📍';
      default: return '📍';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>📍 現在地付近</h3>
        <button
          className={`${styles.loadButton} pressable`}
          onClick={handleLoadNearby}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.spinner} />
          ) : hasLoaded ? (
            '更新'
          ) : (
            '周辺の駅を探す'
          )}
        </button>
      </div>

      {error && (
        <p className={styles.error}>{error}</p>
      )}

      {nearbyPlaces.length > 0 && (
        <div className={styles.list}>
          {nearbyPlaces.map((place, index) => (
            <button
              key={place.id}
              className={`${styles.item} pressable`}
              onClick={() => onSelectStation(place)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className={styles.itemIcon}>{getKindIcon(place.kind)}</span>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{place.name}</span>
                {place.distanceMeters !== undefined && (
                  <span className={styles.itemDistance}>
                    {place.distanceMeters < 1000
                      ? `${Math.round(place.distanceMeters)}m`
                      : `${(place.distanceMeters / 1000).toFixed(1)}km`}
                  </span>
                )}
              </div>
              <span className={styles.itemAction}>出発</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
