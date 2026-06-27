'use client';

import dynamic from 'next/dynamic';
import type { Place } from '@/lib/types';
import styles from './ExploreMap.module.css';

const ExploreMapClient = dynamic(() => import('./ExploreMapClient'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingContainer}>
      <span className={styles.spinner} />
      <p>地図を読み込んでいます...</p>
    </div>
  ),
});

interface ExploreMapProps {
  onSelectOrigin: (place: Place) => void;
  onSelectDestination: (place: Place) => void;
}

export default function ExploreMap({ onSelectOrigin, onSelectDestination }: ExploreMapProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>🗺️ 地図から探す</h2>
        <p className={styles.desc}>地図を動かすと周辺のバス停や駅が見つかります</p>
      </div>
      <div className={styles.mapContainer}>
        <ExploreMapClient
          onSelectOrigin={onSelectOrigin}
          onSelectDestination={onSelectDestination}
        />
      </div>
    </div>
  );
}
