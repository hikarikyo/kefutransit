import type {
  PlaceSuggestResponse,
  PlaceReverseResponse,
  GuidancePlanResponse,
  Strategy,
} from './types';

/** Transit API ベースURL */
const BASE_URL = 'https://api.transit.ls8h.com';

/**
 * 場所オートコンプリート検索
 * @param query - 検索クエリ文字列
 * @param limit - 最大結果数（デフォルト10）
 */
export async function suggestPlaces(
  query: string,
  limit: number = 10
): Promise<PlaceSuggestResponse> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`${BASE_URL}/api/v1/places/suggest?${params}`);
  if (!res.ok) {
    throw new Error(`サジェスト検索に失敗しました: ${res.status}`);
  }
  return res.json();
}

/**
 * 逆ジオコーディング（現在地周辺の駅・場所を検索）
 * @param lat - 緯度
 * @param lon - 経度
 * @param limit - 最大結果数（デフォルト5）
 * @param radiusMeters - 検索半径（デフォルト500m）
 */
export async function reversePlaces(
  lat: number,
  lon: number,
  limit: number = 5,
  radiusMeters: number = 500
): Promise<PlaceReverseResponse> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    limit: String(limit),
    radiusMeters: String(radiusMeters),
  });
  const res = await fetch(`${BASE_URL}/api/v1/places/reverse?${params}`);
  if (!res.ok) {
    throw new Error(`周辺検索に失敗しました: ${res.status}`);
  }
  return res.json();
}

/** Guidance Plan 検索オプション */
export interface SearchOptions {
  date?: string;
  time?: string;
  type?: 'departure' | 'arrival' | 'first' | 'last';
  strategy?: Strategy;
  numItineraries?: number;
  maxTransfers?: number;
}

/**
 * Guidance Plan 経路検索
 * @param from - 出発地（endpoint文字列: 駅IDまたはgeo:lat,lon）
 * @param to - 到着地（endpoint文字列）
 * @param fromLabel - 出発地の表示名
 * @param toLabel - 到着地の表示名
 * @param options - 検索オプション
 */
export async function searchGuidancePlan(
  from: string,
  to: string,
  fromLabel?: string,
  toLabel?: string,
  options: SearchOptions = {}
): Promise<GuidancePlanResponse> {
  const params = new URLSearchParams({ from, to });
  if (fromLabel) params.set('fromLabel', fromLabel);
  if (toLabel) params.set('toLabel', toLabel);
  if (options.date) params.set('date', options.date);
  if (options.time) params.set('time', options.time);
  if (options.type) params.set('type', options.type);
  if (options.strategy) params.set('strategy', options.strategy);
  if (options.numItineraries) params.set('numItineraries', String(options.numItineraries));
  if (options.maxTransfers !== undefined) params.set('maxTransfers', String(options.maxTransfers));

  const res = await fetch(`${BASE_URL}/api/v1/guidance/plan?${params}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const message = errorData?.error?.message || errorData?.error || `経路検索に失敗しました: ${res.status}`;
    throw new Error(String(message));
  }
  return res.json();
}
