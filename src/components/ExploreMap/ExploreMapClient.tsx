'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Place } from '@/lib/types';
import { reversePlaces } from '@/lib/api';
import { getCurrentPosition } from '@/lib/geolocation';
import 'leaflet/dist/leaflet.css';
import styles from './ExploreMap.module.css';

interface ExploreMapClientProps {
  onSelectOrigin: (place: Place) => void;
  onSelectDestination: (place: Place) => void;
}

/** カスタムのバス停アイコン */
const createStopIcon = () => {
  return L.divIcon({
    html: '<div style="font-size: 24px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🚏</div>',
    className: 'custom-leaflet-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

const createStationIcon = () => {
  return L.divIcon({
    html: '<div style="font-size: 24px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🚉</div>',
    className: 'custom-leaflet-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

export default function ExploreMapClient({ onSelectOrigin, onSelectDestination }: ExploreMapClientProps) {
  const [places, setPlaces] = useState<Map<string, Place>>(new Map());
  const [center, setCenter] = useState<[number, number]>([35.6812, 139.7671]); // デフォルト東京駅
  const [isLocating, setIsLocating] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  // 初回ロード時に現在地を取得
  useEffect(() => {
    getCurrentPosition()
      .then((pos) => {
        setCenter([pos.lat, pos.lon]);
        setIsLocating(false);
      })
      .catch(() => {
        // 失敗した場合はデフォルトのまま
        setIsLocating(false);
      });
  }, []);

  // マップ操作時に周辺のバス停を取得
  const fetchPlaces = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await reversePlaces(lat, lon, 30, 2000); // 半径2km、最大30件
      setPlaces((prev) => {
        const next = new Map(prev);
        // 新しいプレイスをマージ（既存のものを上書き・追加）
        res.places.forEach((p) => {
          if (p.kind === 'station' || p.kind === 'stop') {
            next.set(p.id, p);
          }
        });
        return next;
      });
    } catch (err) {
      console.error('周辺のバス停取得に失敗しました', err);
    }
  }, []);

  // 初期位置が決まったら一度フェッチ
  useEffect(() => {
    if (!isLocating) {
      fetchPlaces(center[0], center[1]);
    }
  }, [isLocating, center, fetchPlaces]);

  if (isLocating) {
    return (
      <div className={styles.loadingContainer}>
        <span className={styles.spinner} />
        <p>現在地を取得しています...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ width: '100%', height: '100%', borderRadius: 'inherit', zIndex: 1 }}
      zoomControl={true}
      attributionControl={false}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapEvents onMoveEnd={fetchPlaces} />

      {Array.from(places.values()).map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lon]}
          icon={place.kind === 'station' ? createStationIcon() : createStopIcon()}
        >
          <Popup>
            <div className={styles.popupContent}>
              <div className={styles.popupTitle}>{place.name}</div>
              <div className={styles.popupMeta}>
                {place.kind === 'station' ? '駅' : 'バス停'}
                {place.feedName && ` ・ ${place.feedName}`}
              </div>
              <div className={styles.popupActions}>
                <button
                  className="pressable"
                  style={{ background: 'var(--color-primary)', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '12px' }}
                  onClick={() => {
                    onSelectOrigin(place);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  ここを出発地に
                </button>
                <button
                  className="pressable"
                  style={{ background: 'var(--color-bg-card)', color: 'var(--color-primary)', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--color-primary)', fontWeight: 'bold', fontSize: '12px' }}
                  onClick={() => {
                    onSelectDestination(place);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  ここを目的地に
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

/** マップのイベントをフックする用コンポーネント */
function MapEvents({ onMoveEnd }: { onMoveEnd: (lat: number, lon: number) => void }) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target as L.Map;
      const center = map.getCenter();
      onMoveEnd(center.lat, center.lng);
    },
  });
  return null;
}
