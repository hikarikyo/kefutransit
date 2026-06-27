import type { FavoriteStation, FavoriteRoute, Place } from './types';

const FAVORITE_STATIONS_KEY = 'kefutransit_favorite_stations';
const FAVORITE_ROUTES_KEY = 'kefutransit_favorite_routes';

/** お気に入り駅を取得 */
export function getFavoriteStations(): FavoriteStation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITE_STATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** お気に入り駅を追加 */
export function addFavoriteStation(place: Place): FavoriteStation[] {
  const stations = getFavoriteStations();
  // 既に存在する場合は追加しない
  if (stations.some((s) => s.id === place.id)) return stations;
  const newStation: FavoriteStation = {
    id: place.id,
    endpoint: place.endpoint,
    name: place.name,
    kind: place.kind,
    addedAt: Date.now(),
  };
  const updated = [newStation, ...stations].slice(0, 20); // 最大20件
  localStorage.setItem(FAVORITE_STATIONS_KEY, JSON.stringify(updated));
  return updated;
}

/** お気に入り駅を削除 */
export function removeFavoriteStation(id: string): FavoriteStation[] {
  const stations = getFavoriteStations().filter((s) => s.id !== id);
  localStorage.setItem(FAVORITE_STATIONS_KEY, JSON.stringify(stations));
  return stations;
}

/** 駅がお気に入りかチェック */
export function isFavoriteStation(id: string): boolean {
  return getFavoriteStations().some((s) => s.id === id);
}

/** お気に入り経路を取得 */
export function getFavoriteRoutes(): FavoriteRoute[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITE_ROUTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** お気に入り経路を追加 */
export function addFavoriteRoute(
  from: { endpoint: string; name: string },
  to: { endpoint: string; name: string }
): FavoriteRoute[] {
  const routes = getFavoriteRoutes();
  const id = `${from.endpoint}__${to.endpoint}`;
  // 既に存在する場合は追加しない
  if (routes.some((r) => r.id === id)) return routes;
  const newRoute: FavoriteRoute = {
    id,
    from,
    to,
    addedAt: Date.now(),
  };
  const updated = [newRoute, ...routes].slice(0, 20); // 最大20件
  localStorage.setItem(FAVORITE_ROUTES_KEY, JSON.stringify(updated));
  return updated;
}

/** お気に入り経路を削除 */
export function removeFavoriteRoute(id: string): FavoriteRoute[] {
  const routes = getFavoriteRoutes().filter((r) => r.id !== id);
  localStorage.setItem(FAVORITE_ROUTES_KEY, JSON.stringify(routes));
  return routes;
}

/** 経路がお気に入りかチェック */
export function isFavoriteRoute(fromEndpoint: string, toEndpoint: string): boolean {
  const id = `${fromEndpoint}__${toEndpoint}`;
  return getFavoriteRoutes().some((r) => r.id === id);
}
