'use client';

import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  /** メッセージ */
  message?: string;
}

/** ローディングスピナーコンポーネント */
export default function LoadingSpinner({ message = '検索中...' }: LoadingSpinnerProps) {
  return (
    <div className={styles.container}>
      <div className={styles.train}>
        <span className={styles.trainEmoji}>🚃</span>
        <div className={styles.track}>
          <div className={styles.trackLine} />
          <div className={styles.trackDots}>
            <span className={styles.trackDot} />
            <span className={styles.trackDot} />
            <span className={styles.trackDot} />
          </div>
        </div>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
