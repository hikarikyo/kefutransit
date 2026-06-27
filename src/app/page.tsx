'use client';

import { useState, useCallback } from 'react';
import type { Place, GuidancePlanResponse } from '@/lib/types';
import { searchGuidancePlan } from '@/lib/api';
import type { SearchParams } from '@/components/SearchPanel/SearchPanel';
import SearchPanel from '@/components/SearchPanel/SearchPanel';
import JourneyResults from '@/components/JourneyResults/JourneyResults';
import NearbyStations from '@/components/NearbyStations/NearbyStations';
import Favorites from '@/components/Favorites/Favorites';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import styles from './page.module.css';

/** メインページコンポーネント */
export default function Home() {
  const [result, setResult] = useState<GuidancePlanResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favRefresh, setFavRefresh] = useState(0);

  /* 外部から出発・到着を制御するためのState */
  const [externalFrom, setExternalFrom] = useState<Place | null | undefined>(undefined);
  const [externalTo, setExternalTo] = useState<Place | null | undefined>(undefined);

  /** 経路検索実行 */
  const handleSearch = useCallback(async (params: SearchParams) => {
    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const data = await searchGuidancePlan(
        params.from.endpoint,
        params.to.endpoint,
        params.from.name,
        params.to.name,
        {
          date: params.date,
          time: params.time,
          type: params.type,
          numItineraries: 5,
        }
      );
      setResult(data);
      setFavRefresh((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
    } finally {
      setIsSearching(false);
    }
  }, []);

  /** 周辺駅を出発地にセット */
  const handleNearbySelect = useCallback((place: Place) => {
    setExternalFrom(place);
    setExternalTo(undefined);
  }, []);

  /** お気に入り駅を出発地にセット */
  const handleFavStationSelect = useCallback((endpoint: string, name: string) => {
    const fakePlace: Place = {
      id: endpoint,
      endpoint,
      name,
      kind: 'station',
      source: 'transit',
      lat: 0,
      lon: 0,
      score: 0,
      weight: 0,
    };
    setExternalFrom(fakePlace);
    setExternalTo(undefined);
  }, []);

  /** お気に入り経路を出発・到着にセット */
  const handleFavRouteSelect = useCallback(
    (from: { endpoint: string; name: string }, to: { endpoint: string; name: string }) => {
      const fromPlace: Place = {
        id: from.endpoint,
        endpoint: from.endpoint,
        name: from.name,
        kind: 'station',
        source: 'transit',
        lat: 0,
        lon: 0,
        score: 0,
        weight: 0,
      };
      const toPlace: Place = {
        id: to.endpoint,
        endpoint: to.endpoint,
        name: to.name,
        kind: 'station',
        source: 'transit',
        lat: 0,
        lon: 0,
        score: 0,
        weight: 0,
      };
      setExternalFrom(fromPlace);
      setExternalTo(toPlace);
    },
    []
  );

  /** 外部セットが消費されたことを通知 */
  const handleExternalConsumed = useCallback(() => {
    setExternalFrom(undefined);
    setExternalTo(undefined);
  }, []);

  return (
    <main className={styles.main}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>
            <span className={styles.logoIcon}>🚃</span>
            KefuTransit
          </h1>
          <p className={styles.tagline}>乗り換え検索</p>
        </div>
      </header>

      <div className={styles.content}>
        {/* 検索パネル */}
        <section className={styles.section}>
          <SearchPanel
            onSearch={handleSearch}
            isSearching={isSearching}
            externalFrom={externalFrom}
            externalTo={externalTo}
            onExternalConsumed={handleExternalConsumed}
          />
        </section>

        {/* ローディング */}
        {isSearching && (
          <section className={styles.section}>
            <LoadingSpinner />
          </section>
        )}

        {/* エラー */}
        {error && !isSearching && (
          <section className={styles.section}>
            <div className={styles.errorCard}>
              <span className={styles.errorIcon}>😔</span>
              <p className={styles.errorMessage}>{error}</p>
              <p className={styles.errorHint}>条件を変えて再検索してみてください</p>
            </div>
          </section>
        )}

        {/* 検索結果 */}
        {result && !isSearching && (
          <section className={styles.section}>
            <JourneyResults result={result} />
          </section>
        )}

        {/* 検索結果がない時にホーム画面コンテンツを表示 */}
        {!result && !isSearching && !error && (
          <>
            {/* 現在地付近 */}
            <section className={styles.section}>
              <NearbyStations onSelectStation={handleNearbySelect} />
            </section>

            {/* お気に入り */}
            <section className={styles.section}>
              <Favorites
                onSelectStation={handleFavStationSelect}
                onSelectRoute={handleFavRouteSelect}
                refreshKey={favRefresh}
              />
            </section>
          </>
        )}
      </div>

      {/* フッター */}
      <footer className={styles.footer}>
        <p>
          交通データは各事業者のGTFS/ODPT等に基づきます
        </p>
        <p>
          Powered by{' '}
          <a href="https://api.transit.ls8h.com/" target="_blank" rel="noopener noreferrer">
            Transit API
          </a>
        </p>
      </footer>
    </main>
  );
}
