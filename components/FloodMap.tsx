'use client';
import { useEffect, useRef } from 'react';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DAYTONA } from '@/lib/config';
import type { DashboardData } from '@/lib/types';
export type Layers = { gauges: boolean; alerts: boolean; rain: boolean };
export default function FloodMap({ data, layers }: { data: DashboardData | null; layers: Layers }) {
  const root = useRef<HTMLDivElement>(null); const mapRef = useRef<MapLibreMap | null>(null);
  useEffect(() => {
    if (!root.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: root.current, style: process.env.NEXT_PUBLIC_MAP_STYLE || 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', center: [DAYTONA.lon, DAYTONA.lat], zoom: DAYTONA.zoom, attributionControl: false });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const markers: maplibregl.Marker[] = [];
    if (data && layers.gauges) data.gauges.data.forEach(g => {
      const el = document.createElement('button'); el.className = 'map-pin gauge-pin'; el.type = 'button'; el.setAttribute('aria-label', `${g.name}: ${g.waterLevelFt} feet`); el.textContent = '≈';
      markers.push(new maplibregl.Marker({ element: el }).setLngLat([g.lon, g.lat]).setPopup(new maplibregl.Popup({ offset: 22 }).setHTML(`<strong>${escapeHtml(g.name)}</strong><br>${g.waterLevelFt.toFixed(2)} ft above MLLW<br><small>${escapeHtml(g.observedAt)}</small><br><small>NOAA · not a street flood depth</small>`)).addTo(map));
    });
    if (data && layers.rain) data.rainfall.data.forEach(p => {
      const el = document.createElement('button'); el.className = 'map-pin rain-pin'; el.type = 'button'; el.setAttribute('aria-label', `${p.name}: forecast ${p.next6hMm.toFixed(1)} mm`); el.textContent = '☂';
      markers.push(new maplibregl.Marker({ element: el }).setLngLat([p.lon, p.lat]).setPopup(new maplibregl.Popup({ offset: 22 }).setHTML(`<strong>${escapeHtml(p.name)}</strong><br>Next 6 hours: ${p.next6hMm.toFixed(1)} mm forecast<br><small>Open-Meteo · forecast, not observed</small>`)).addTo(map));
    });
    const polygons = data && layers.alerts ? data.alerts.data.flatMap(a => a.polygon ? [{ type: 'Feature' as const, geometry: a.polygon, properties: { event: a.event } }] : []) : [];
    const render = () => {
      if (!map.getStyle()) return;
      if (map.getLayer('alert-fill')) map.removeLayer('alert-fill');
      if (map.getLayer('alert-outline')) map.removeLayer('alert-outline');
      if (map.getSource('alert-polygons')) map.removeSource('alert-polygons');
      map.addSource('alert-polygons', { type: 'geojson', data: { type: 'FeatureCollection', features: polygons } });
      map.addLayer({ id: 'alert-fill', type: 'fill', source: 'alert-polygons', paint: { 'fill-color': '#fb923c', 'fill-opacity': 0.20 } });
      map.addLayer({ id: 'alert-outline', type: 'line', source: 'alert-polygons', paint: { 'line-color': '#fb923c', 'line-width': 2 } });
    };
    if (map.isStyleLoaded()) render(); else map.once('load', render);
    return () => { markers.forEach(m => m.remove()); map.off('load', render); if (map.getStyle()) { if (map.getLayer('alert-fill')) map.removeLayer('alert-fill'); if (map.getLayer('alert-outline')) map.removeLayer('alert-outline'); if (map.getSource('alert-polygons')) map.removeSource('alert-polygons'); } };
  }, [data, layers]);
  return <div ref={root} className="map-canvas" aria-label="Interactive map of Daytona Beach and surrounding communities" />;
}
function escapeHtml(s: string) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c); }
