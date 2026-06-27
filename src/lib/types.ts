// Transit API 型定義

/** 場所サジェストのレスポンス */
export interface PlaceSuggestResponse {
  places: Place[];
  coverage: {
    sources: ('transit' | 'osm' | 'geocoder')[];
    kinds: ('station' | 'stop' | 'place' | 'address')[];
    notices: { severity: 'info' | 'warning'; message: string }[];
  };
}

export interface Place {
  id: string;
  endpoint: string;
  name: string;
  kind: 'station' | 'stop' | 'place' | 'address';
  source: 'transit' | 'osm' | 'geocoder';
  lat: number;
  lon: number;
  score: number;
  weight: number;
  nameKana?: string;
  nameEn?: string;
  description?: string;
  feedId?: string;
  feedName?: string;
  distanceMeters?: number;
}

/** 逆ジオコーディングレスポンス */
export interface PlaceReverseResponse {
  places: Place[];
  coverage: {
    sources: ('transit' | 'osm' | 'geocoder')[];
    kinds: ('station' | 'stop' | 'place' | 'address')[];
    notices: { severity: 'info' | 'warning'; message: string }[];
  };
}

/** Guidance Plan レスポンス */
export interface GuidancePlanResponse {
  date: string;
  type: 'departure' | 'arrival' | 'first' | 'last';
  timezone: string;
  from: { id: string; name: string };
  to: { id: string; name: string };
  live: {
    mode: 'manual' | 'liveQuery';
    tracking: 'none' | 'origin' | 'destination' | 'both';
    refreshAfterSecs: number;
    anchorSecs: number;
  };
  osm: {
    status: 'notApplicable' | 'network' | 'estimated';
    regionId?: string;
    attribution?: string;
  };
  coverage: {
    feeds: CoverageFeed[];
    transitModes: TransitMode[];
    notices: CoverageNotice[];
  };
  decision: {
    strategy: Strategy;
    recommendedOptionId?: string;
    primaryFactors: DecisionFactor[];
    tradeoffs: DecisionFactor[];
  };
  options: GuidanceOption[];
}

export interface CoverageFeed {
  feedId: string;
  name: string;
  transitModes?: TransitMode[];
  serviceEnd?: string;
  stale?: boolean;
}

export interface CoverageNotice {
  severity: 'info' | 'warning';
  code: string;
  message: string;
  action?: string;
  modes?: TransitMode[];
  walk?: boolean;
}

export type TransitMode = 'tram' | 'subway' | 'rail' | 'bus' | 'ferry' | 'cableTram' | 'aerialLift' | 'funicular' | 'trolleybus' | 'monorail' | 'air';

export type Strategy = 'balanced' | 'fastest' | 'fewestTransfers' | 'lowestFare' | 'shortestWalk';

export interface DecisionFactor {
  kind: 'arrivalTime' | 'duration' | 'transferBurden' | 'fare' | 'walkingBurden' | 'waitingBurden' | 'reliability' | 'directness';
  effect: 'advantage' | 'tradeoff' | 'risk';
  magnitude: 'small' | 'medium' | 'large';
  deltaSecs?: number;
  deltaCount?: number;
  deltaAmount?: number;
}

export interface GuidanceOption {
  id: string;
  rank: number;
  score: number;
  recommended: boolean;
  selectedFor: Strategy;
  confidence: 'high' | 'medium' | 'low';
  metrics: {
    durationSecs: number;
    transitSecs: number;
    walkSecs: number;
    waitSecs: number;
    transferCount: number;
    headwayLegCount: number;
    fare?: Fare;
  };
  load: {
    overall: 'low' | 'medium' | 'high';
    walking: 'low' | 'medium' | 'high';
    waiting: 'low' | 'medium' | 'high';
    transfer: 'low' | 'medium' | 'high';
    uncertainty: 'low' | 'medium' | 'high';
  };
  decisionFactors: DecisionFactor[];
  nextAction?: {
    kind: 'walk' | 'wait' | 'board';
    from: LegStop;
    to?: LegStop;
    departureSecs: number;
    timeBudgetSecs: number;
    routeName?: string;
  };
  map?: {
    bounds: { minLat: number; minLon: number; maxLat: number; maxLon: number };
    points: MapPoint[];
    segments: MapSegment[];
  };
  journey: Journey;
}

export interface Journey {
  departureSecs: number;
  arrivalSecs: number;
  durationSecs: number;
  transferCount: number;
  fare?: Fare;
  accessWalkSecs?: number;
  egressWalkSecs?: number;
  legs: Leg[];
}

export interface Fare {
  currency: string;
  ticket: number;
  ic?: number;
}

export type Leg = TransitLeg | WalkLeg;

export interface TransitLeg {
  kind: 'transit';
  routeName: string;
  mode: string;
  color?: string;
  headsign?: string;
  tripId: string;
  from: LegStop;
  to: LegStop;
  departureSecs: number;
  arrivalSecs: number;
  headwayBased: boolean;
}

export interface WalkLeg {
  kind: 'walk';
  from: LegStop;
  to: LegStop;
  departureSecs: number;
  arrivalSecs: number;
}

export interface LegStop {
  id: string;
  name: string;
  platformCode?: string;
}

export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  role: 'origin' | 'destination' | 'stop' | 'transfer';
}

export interface MapSegment {
  kind: 'walk' | 'transit';
  fromPointId: string;
  toPointId: string;
  routeName?: string;
  color?: string;
  geometrySource: string;
  polyline: { lat: number; lon: number }[];
}

/** お気に入り駅 */
export interface FavoriteStation {
  id: string;
  endpoint: string;
  name: string;
  kind: 'station' | 'stop' | 'place' | 'address';
  addedAt: number;
}

/** お気に入り経路 */
export interface FavoriteRoute {
  id: string;
  from: { endpoint: string; name: string };
  to: { endpoint: string; name: string };
  addedAt: number;
}
