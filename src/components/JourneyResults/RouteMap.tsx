'use client';

import dynamic from 'next/dynamic';
import type { GuidanceOption } from '@/lib/types';
import styles from './RouteMap.module.css';

// Leafletはwindowオブジェクトに依存するため、SSRを無効化してクライアントサイドのみでロードする
const RouteMapClient = dynamic(() => import('./RouteMapClient'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingContainer}>
      <span className={styles.spinner} />
      <p>地図を読み込んでいます...</p>
    </div>
  ),
});

interface RouteMapProps {
  mapData: NonNullable<GuidanceOption['map']>;
}

export default function RouteMap({ mapData }: RouteMapProps) {
  return (
    <div className={styles.container}>
      <RouteMapClient mapData={mapData} />
    </div>
  );
}
