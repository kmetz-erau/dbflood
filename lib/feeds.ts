import { FORECAST_POINTS, STATIONS } from './config';
import { mergeAlerts } from './alerts';
import type { Alert, DashboardData, Feed, Gauge, RainPoint } from './types';

const now = () => new Date().toISOString();
async function json(url: string): Promise<any> {
  const response = await fetch(url, { headers: { 'User-Agent': 'DaytonaFloodWatch/1.0 (public flood information dashboard)', Accept: 'application/json' }, signal: AbortSignal.timeout(9000), next: { revalidate: 180 } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
async function feed<T>(source: string, load: () => Promise<T[]>): Promise<Feed<T>> {
  try { const data = await load(); return { source, fetchedAt: now(), status: data.length ? 'ok' : 'empty', data }; }
  catch (error) { return { source, fetchedAt: now(), status: 'unavailable', data: [], error: error instanceof Error ? error.message : 'Unknown feed error' }; }
}
export async function getAlerts(): Promise<Feed<Alert>> {
  return feed('National Weather Service (Volusia County)', async () => {
    // The county zone captures countywide alerts; sampled community points
    // capture applicable coastal/marine and geographically specific alerts.
    // Partial endpoint failure is allowed, but total failure is not "no alerts".
    const endpoints = [
      'https://api.weather.gov/alerts/active?zone=FLC127',
      ...FORECAST_POINTS.map(p => `https://api.weather.gov/alerts/active?point=${p.lat},${p.lon}`),
    ];
    const responses = await Promise.allSettled(endpoints.map(url => json(url)));
    const successful = responses.filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled');
    if (!successful.length) throw new Error('All NWS alert endpoints failed');
    return mergeAlerts(successful.map(r => Array.isArray(r.value.features) ? r.value.features : []));
  });
}
export async function getGauges(): Promise<Feed<Gauge>> {
  return feed('NOAA CO-OPS', async () => {
    const results = await Promise.allSettled(STATIONS.map(async station => {
      const query = new URLSearchParams({ product: 'water_level', application: 'DaytonaFloodWatch', date: 'latest', datum: 'MLLW', station: station.id, time_zone: 'gmt', units: 'english', format: 'json' });
      const response = await json(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${query}`);
      const obs = response.data?.[0];
      if (!obs || !Number.isFinite(Number(obs.v))) return null;
      return { id: station.id, name: response.metadata?.name ?? station.name, lat: Number(response.metadata?.lat ?? station.lat), lon: Number(response.metadata?.lon ?? station.lon), waterLevelFt: Number(obs.v), observedAt: String(obs.t) + ' UTC', datum: 'MLLW' } satisfies Gauge;
    }));
    return results.filter((r): r is PromiseFulfilledResult<Gauge | null> => r.status === 'fulfilled').map(r => r.value).filter((v): v is Gauge => v !== null);
  });
}
export async function getRainfall(): Promise<Feed<RainPoint>> {
  return feed('Open-Meteo forecast', async () => {
    const query = new URLSearchParams({ latitude: FORECAST_POINTS.map(p => p.lat).join(','), longitude: FORECAST_POINTS.map(p => p.lon).join(','), hourly: 'precipitation', forecast_days: '2', timezone: 'America/New_York' });
    const response = await json(`https://api.open-meteo.com/v1/forecast?${query}`);
    const forecasts = Array.isArray(response) ? response : [response];
    const hourLocal = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit' }).format(new Date()).replace(' ', 'T');
    return FORECAST_POINTS.flatMap((p, i) => {
      const item = forecasts[i]; const times: string[] = item?.hourly?.time ?? []; const values: number[] = item?.hourly?.precipitation ?? [];
      if (!times.length) return [];
      const idx = Math.max(0, times.findIndex(t => t >= hourLocal));
      return [{ name: p.name, lat: p.lat, lon: p.lon, hourlyRainMm: Number(values[idx] ?? 0), next6hMm: values.slice(idx, idx + 6).reduce((sum, n) => sum + Number(n || 0), 0), observedAt: times[idx] + ' local (forecast)' }];
    });
  });
}
export async function getDashboard(): Promise<DashboardData> {
  const [alerts, gauges, rainfall] = await Promise.all([getAlerts(), getGauges(), getRainfall()]);
  return { alerts, gauges, rainfall, generatedAt: now() };
}
