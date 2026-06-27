'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FavoriteStation, FavoriteRoute } from '@/lib/types';
import {
  getFavoriteStations,
  getFavoriteRoutes,
  removeFavoriteStation,
  removeFavoriteRoute,
} from '@/lib/favorites';
import styles from './Favorites.module.css';

interface FavoritesProps {
  /** お気に入り駅が選択された時（出発地にセット） */
  onSelectStation: (endpoint: string, name: string) => void;
  /** お気に入り経路が選択された時（出発・到着にセット） */
  onSelectRoute: (from: { endpoint: string; name: string }, to: { endpoint: string; name: string }) => void;
  /** お気に入り更新トリガー */
  refreshKey?: number;
}

/** お気に入り駅・経路の表示コンポーネント */
export default function Favorites({ onSelectStation, onSelectRoute, refreshKey }: FavoritesProps) {
  const [stations, setStations] = useState<FavoriteStation[]>([]);
  const [routes, setRoutes] = useState<FavoriteRoute[]>([]);
  const [activeTab, setActiveTab] = useState<'routes' | 'stations'>('routes');

  /** データ読み込み */
  useEffect(() => {
    setStations(getFavoriteStations());
    setRoutes(getFavoriteRoutes());
  }, [refreshKey]);

  /** お気に入り駅を削除 */
  const handleRemoveStation = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeFavoriteStation(id);
    setStations(updated);
  }, []);

  /** お気に入り経路を削除 */
  const handleRemoveRoute = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeFavoriteRoute(id);
    setRoutes(updated);
  }, []);

  /* データが無い場合は表示しない */
  if (stations.length === 0 && routes.length === 0) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>⭐ お気に入り</h3>

      {/* タブ */}
      {stations.length > 0 && routes.length > 0 && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'routes' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('routes')}
          >
            経路 ({routes.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'stations' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('stations')}
          >
            駅 ({stations.length})
          </button>
        </div>
      )}

      {/* 経路リスト */}
      {(activeTab === 'routes' || stations.length === 0) && routes.length > 0 && (
        <div className={styles.list}>
          {routes.map((route) => (
            <button
              key={route.id}
              className={`${styles.item} pressable`}
              onClick={() => onSelectRoute(route.from, route.to)}
            >
              <span className={styles.routeIcon}>🔀</span>
              <div className={styles.routeInfo}>
                <span className={styles.routeFrom}>{route.from.name}</span>
                <span className={styles.routeArrow}>→</span>
                <span className={styles.routeTo}>{route.to.name}</span>
              </div>
              <button
                className={`${styles.removeButton} pressable`}
                onClick={(e) => handleRemoveRoute(route.id, e)}
                aria-label="削除"
              >
                ✕
              </button>
            </button>
          ))}
        </div>
      )}

      {/* 駅リスト */}
      {(activeTab === 'stations' || routes.length === 0) && stations.length > 0 && (
        <div className={styles.list}>
          {stations.map((station) => (
            <button
              key={station.id}
              className={`${styles.item} pressable`}
              onClick={() => onSelectStation(station.endpoint, station.name)}
            >
              <span className={styles.stationIcon}>
                {station.kind === 'station' ? '🚉' : station.kind === 'stop' ? '🚏' : '📍'}
              </span>
              <span className={styles.stationName}>{station.name}</span>
              <button
                className={`${styles.removeButton} pressable`}
                onClick={(e) => handleRemoveStation(station.id, e)}
                aria-label="削除"
              >
                ✕
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
