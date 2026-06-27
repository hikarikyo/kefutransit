/** 現在地の座標 */
export interface GeoPosition {
  lat: number;
  lon: number;
}

/**
 * ブラウザの Geolocation API で現在地を取得
 * @param timeout - タイムアウト（ミリ秒、デフォルト10秒）
 */
export function getCurrentPosition(timeout: number = 10000): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('位置情報がサポートされていません'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('位置情報の使用が許可されていません'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('位置情報を取得できません'));
            break;
          case error.TIMEOUT:
            reject(new Error('位置情報の取得がタイムアウトしました'));
            break;
          default:
            reject(new Error('位置情報の取得に失敗しました'));
        }
      },
      {
        enableHighAccuracy: false,
        timeout,
        maximumAge: 60000, // 1分間キャッシュ
      }
    );
  });
}
