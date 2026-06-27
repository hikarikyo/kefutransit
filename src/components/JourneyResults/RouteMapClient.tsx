'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GuidanceOption } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

interface RouteMapClientProps {
  mapData: NonNullable<GuidanceOption['map']>;
}

/** マップの表示領域を自動調整するコンポーネント */
function MapBounds({ bounds }: { bounds: { minLat: number; minLon: number; maxLat: number; maxLon: number } }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds([
        [bounds.minLat, bounds.minLon],
        [bounds.maxLat, bounds.maxLon],
      ], { padding: [20, 20] });
    }
  }, [map, bounds]);
  return null;
}

export default function RouteMapClient({ mapData }: RouteMapClientProps) {
  const { bounds, points, segments } = mapData;

  // デフォルトの中心（boundsがない場合のフォールバック）
  const center: [number, number] = points.length > 0
    ? [points[0].lat, points[0].lon]
    : [35.6812, 139.7671];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ width: '100%', height: '100%', borderRadius: 'inherit', zIndex: 1 }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {bounds && <MapBounds bounds={bounds} />}

      {/* セグメント（経路の線）の描画 */}
      {segments.map((segment, index) => {
        const positions: [number, number][] = segment.polyline.map((p) => [p.lat, p.lon]);
        const isWalk = segment.kind === 'walk';
        
        return (
          <Polyline
            key={`segment-${index}`}
            positions={positions}
            pathOptions={{
              color: isWalk ? '#8b9bb4' : (segment.color ? `#${segment.color}` : '#5B8CFF'),
              weight: isWalk ? 4 : 5,
              dashArray: isWalk ? '6, 6' : undefined,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        );
      })}

      {/* ポイント（停留所・駅など）の描画 */}
      {points.map((point, index) => {
        const isEndpoint = point.role === 'origin' || point.role === 'destination';
        const color = point.role === 'origin' ? '#38D39F' : point.role === 'destination' ? '#FF5B5B' : '#ffffff';
        const borderColor = point.role === 'origin' || point.role === 'destination' ? '#ffffff' : '#5B8CFF';
        const radius = isEndpoint ? 7 : 5;

        return (
          <CircleMarker
            key={`point-${index}`}
            center={[point.lat, point.lon]}
            radius={radius}
            pathOptions={{
              color: borderColor,
              fillColor: color,
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ fontWeight: 600, fontSize: '14px', margin: '4px 0' }}>{point.name}</div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
