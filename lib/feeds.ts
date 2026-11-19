import { FORECAST_POINTS, STATIONS } from './config';
import { mergeAlerts } from './alerts';
import type { NwsAlertFeature } from './alerts';
import type { Alert, DashboardData, Feed, Gauge, RainPoint } from './types';

interface NwsResponse { features?: NwsAlertFeature[] }
interface NoaaResponse {
  data?: { v?: string; t?: string }[];
  metadata?: { name?: string; lat?: number; lon?: number };
  error?: { message?: string };
}
interface OpenMeteoResponse { hourly?: { time?: string[]; precipitation?: number[] } }

const now = () => new Date().toISOString();
async function json<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'DaytonaFloodWatch/1.0 (public flood information dashboard)', Accept: 'application/json' },
    signal: AbortSignal.timeout(9000),
    next: { revalidate: 180 },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as T;
}
async function feed<T>(source: string, load: () => Promise<T[]>): Promise<Feed<T>> {
  try {
    const data = await load();
    return { source, fetchedAt: now(), status: data.length ? 'ok' : 'empty', data };
  } catch (error) {
    return { source, fetchedAt: now(), status: 'unavailable', data: [], error: error instanceof Error ? error.message : 'Unknown feed error' };
  }
}
export async function getAlerts(): Promise<Feed<Alert>> {
  return feed('National Weather Service (Volusia County)', async () => {
    // County zone plus sampled community points; deduplicate overlapping alerts.
    const endpoints = [
      'https://api.weather.gov/alerts/active?zone=FLC127',
      ...FORECAST_POINTS.map(p => `https://api.weather.gov/alerts/active?point=${p.lat},${p.lon}`),
    ];
    const responses = await Promise.allSettled(endpoints.map(url => json<NwsResponse>(url)));
    const successful = responses.filter((r): r is PromiseFulfilledResult<NwsResponse> => r.status === 'fulfilled');
    if (!successful.length) throw new Error('All NWS alert endpoints failed');
    return mergeAlerts(successful.map(r => Array.isArray(r.value.features) ? r.value.features : []));
  });
}
export async function getGauges(): Promise<Feed<Gauge>> {
  return feed('NOAA CO-OPS', async () => {
    const results = await Promise.allSettled(STATIONS.map(async station => {
      const query = new URLSearchParams({ product: 'water_level', application: 'DaytonaFloodWatch', date: 'latest', datum: 'MLLW', station: station.id, time_zone: 'gmt', units: 'english', format: 'json' });
      const response = await json<NoaaResponse>(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${query}`);
      const obs = response.data?.[0];
      if (!obs || obs.v == null || obs.v.trim() === '' || !Number.isFinite(Number(obs.v)) || !obs.t) return null;
      return {
        id: station.id, name: response.metadata?.name ?? station.name,
        lat: Number(response.metadata?.lat ?? station.lat), lon: Number(response.metadata?.lon ?? station.lon),
        waterLevelFt: Number(obs.v), observedAt: `${obs.t} UTC`, datum: 'MLLW',
      } satisfies Gauge;
    }));
    const successful = results.filter((r): r is PromiseFulfilledResult<Gauge | null> => r.status === 'fulfilled');
    if (!successful.length) throw new Error('All NOAA gauge requests failed');
    return successful.map(r => r.value).filter((v): v is Gauge => v !== null);
  });
}
export async function getRainfall(): Promise<Feed<RainPoint>> {
  return feed('Open-Meteo forecast', async () => {
    const query = new URLSearchParams({
      latitude: FORECAST_POINTS.map(p => p.lat).join(','),
      longitude: FORECAST_POINTS.map(p => p.lon).join(','),
      hourly: 'precipitation', forecast_days: '2', timezone: 'America/New_York',
    });
    const response = await json<OpenMeteoResponse | OpenMeteoResponse[]>(`https://api.open-meteo.com/v1/forecast?${query}`);
    const forecasts = Array.isArray(response) ? response : [response];
    const hourLocal = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    }).format(new Date()).replace(' ', 'T');
    return FORECAST_POINTS.flatMap((p, i) => {
      const item = forecasts[i];
      const times = item?.hourly?.time ?? [];
      const values = item?.hourly?.precipitation ?? [];
      if (!times.length) return [];
      const nextIndex = times.findIndex(t => t >= hourLocal);
      if (nextIndex === -1 || !Number.isFinite(Number(values[nextIndex]))) return [];
      const sixHours = values.slice(nextIndex, nextIndex + 6);
      return [{
        name: p.name, lat: p.lat, lon: p.lon,
        hourlyRainMm: Number(values[nextIndex]),
        next6hMm: sixHours.reduce((sum, n) => sum + (Number.isFinite(Number(n)) ? Number(n) : 0), 0),
        observedAt: `${times[nextIndex]} local (forecast)`,
      }];
    });
  });
}
export async function getDashboard(): Promise<DashboardData> {
  const [alerts, gauges, rainfall] = await Promise.all([getAlerts(), getGauges(), getRainfall()]);
  return { alerts, gauges, rainfall, generatedAt: now() };
}
