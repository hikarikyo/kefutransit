/**
 * サービス日midnight秒を HH:MM 文字列に変換
 * 86400超（翌日扱い）や負値に対応
 */
export function secsToTimeString(secs: number): string {
  // 負値の場合は前日なので24時間分加算して表示
  let adjustedSecs = secs;
  while (adjustedSecs < 0) adjustedSecs += 86400;

  const hours = Math.floor(adjustedSecs / 3600);
  const minutes = Math.floor((adjustedSecs % 3600) / 60);

  // 24時以降は翌日表示
  const displayHours = hours % 24;
  return `${displayHours}:${String(minutes).padStart(2, '0')}`;
}

/**
 * 秒数を「○時間○分」の所要時間文字列に変換
 */
export function secsToDuration(secs: number): string {
  const absSecs = Math.abs(secs);
  const hours = Math.floor(absSecs / 3600);
  const minutes = Math.floor((absSecs % 3600) / 60);

  if (hours === 0) return `${minutes}分`;
  if (minutes === 0) return `${hours}時間`;
  return `${hours}時間${minutes}分`;
}

/**
 * 秒数を短い所要時間文字列に変換（分のみ）
 */
export function secsToMinutes(secs: number): string {
  const minutes = Math.round(Math.abs(secs) / 60);
  return `${minutes}分`;
}

/**
 * YYYYMMDD 形式の日付文字列を「○月○日(曜日)」形式に変換
 */
export function formatDate(yyyymmdd: string): string {
  const year = parseInt(yyyymmdd.slice(0, 4), 10);
  const month = parseInt(yyyymmdd.slice(4, 6), 10);
  const day = parseInt(yyyymmdd.slice(6, 8), 10);
  const date = new Date(year, month - 1, day);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日(${weekday})`;
}

/**
 * 現在の日時をAPIパラメータ形式で返す
 */
export function getCurrentDateTime(): { date: string; time: string } {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  return { date, time };
}

/**
 * Date オブジェクトを YYYYMMDD 形式に変換
 */
export function dateToYYYYMMDD(date: Date): string {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Date オブジェクトを HH:MM 形式に変換
 */
export function dateToHHMM(date: Date): string {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}
