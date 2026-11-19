'use client';
import { useEffect, useRef } from 'react';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DAYTONA } from '@/lib/config';
import type { Alert, DashboardData } from '@/lib/types';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
export type Layers = { gauges: boolean; alerts: boolean; rain: boolean; radar: boolean };
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
  // NOAA/NWS NEXRAD-derived radar mosaic, distributed by Iowa Environmental Mesonet.
  // This is observed radar reflectivity, not a rainfall total or flood forecast.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const applyRadar = () => {
      if (!map.isStyleLoaded()) return;
      if (!map.getSource('nexrad-radar')) {
        map.addSource('nexrad-radar', {
          type: 'raster',
          tiles: ['https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: 'Radar: NOAA/NWS NEXRAD via Iowa Environmental Mesonet',
        });
      }
      if (!map.getLayer('nexrad-radar-layer')) {
        map.addLayer({
          id: 'nexrad-radar-layer', type: 'raster', source: 'nexrad-radar',
          paint: { 'raster-opacity': 0.65, 'raster-fade-duration': 0 },
        });
      }
      map.setLayoutProperty('nexrad-radar-layer', 'visibility', layers.radar ? 'visible' : 'none');
    };
    if (map.isStyleLoaded()) applyRadar();
    else map.on('load', applyRadar);
    return () => { map.off('load', applyRadar); };
  }, [layers.radar]);
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const markers: maplibregl.Marker[] = [];
    if (data && layers.gauges) data.gauges.data.forEach(g => {
      const el = document.createElement('button'); el.className = 'map-pin gauge-pin'; el.type = 'button'; el.setAttribute('aria-label', `${g.name}: ${g.waterLevelFt} feet`); el.textContent = '≈';
      markers.push(new maplibregl.Marker({ element: el }).setLngLat([g.lon, g.lat]).setPopup(new maplibregl.Popup({ offset: 22 }).setHTML(`<strong>${escapeHtml(g.name)}</strong><br>${g.waterLevelFt.toFixed(2)} ft above MLLW<br><small>${escapeHtml(g.observedAt)}</small><br><small>NOAA · not a street flood depth</small>`)).addTo(map));
    });
    if (data && layers.rain) data.rainfall.data.forEach(p => {
      const el = document.createElement('button'); el.className = 'map-pin rain-pin'; el.type = 'button'; el.setAttribute('aria-label', `${p.name}: forecast ${(p.next6hMm / 25.4).toFixed(2)} in`); el.textContent = '☂';
      markers.push(new maplibregl.Marker({ element: el }).setLngLat([p.lon, p.lat]).setPopup(new maplibregl.Popup({ offset: 22 }).setHTML(`<strong>${escapeHtml(p.name)}</strong><br>Next 6 hours: ${(p.next6hMm / 25.4).toFixed(2)} in forecast<br><small>Open-Meteo · forecast, not observed</small>`)).addTo(map));
    });
    const alertsById = new Map((data?.alerts.data ?? []).map(a => [a.id, a]));
    const polygons: Feature<Geometry, { id: string; event: string }>[] = data && layers.alerts
      ? data.alerts.data.flatMap(a => a.polygon ? [{ type: 'Feature' as const, geometry: a.polygon, properties: { id: a.id, event: a.event } }] : [])
      : [];
    const alertCollection: FeatureCollection<Geometry, { id: string; event: string }> = { type: 'FeatureCollection', features: polygons };
    const openAlert = (alert: Alert, lngLat: maplibregl.LngLatLike) => {
      const panel = document.createElement('div');
      panel.className = 'alert-popup';
      const heading = document.createElement('strong'); heading.textContent = alert.event;
      const area = document.createElement('p'); area.textContent = alert.area;
      const headline = document.createElement('p'); headline.textContent = alert.headline;
      const description = document.createElement('p'); description.textContent = alert.description;
      const instruction = document.createElement('p'); instruction.textContent = alert.instruction ? `Instructions: ${alert.instruction}` : '';
      const link = document.createElement('a'); link.href = /^https:\/\//.test(alert.url) ? alert.url : 'https://www.weather.gov/';
      link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'View official NWS alert';
      panel.append(heading, area, headline, description, instruction, link);
      new maplibregl.Popup({ maxWidth: '360px' }).setLngLat(lngLat).setDOMContent(panel).addTo(map);
    };
    const onAlertClick = (event: maplibregl.MapLayerMouseEvent) => {
      const id = event.features?.[0]?.properties?.id;
      const alert = typeof id === 'string' ? alertsById.get(id) : undefined;
      if (alert) openAlert(alert, event.lngLat);
    };
    const onAlertEnter = () => { map.getCanvas().style.cursor = 'pointer'; };
    const onAlertLeave = () => { map.getCanvas().style.cursor = ''; };
    const render = () => {
      if (!map.getStyle()) return;
      if (map.getLayer('alert-fill')) map.removeLayer('alert-fill');
      if (map.getLayer('alert-outline')) map.removeLayer('alert-outline');
      if (map.getSource('alert-polygons')) map.removeSource('alert-polygons');
      map.addSource('alert-polygons', { type: 'geojson', data: alertCollection });
      map.addLayer({ id: 'alert-fill', type: 'fill', source: 'alert-polygons', paint: { 'fill-color': '#fb923c', 'fill-opacity': 0.20 } });
      map.addLayer({ id: 'alert-outline', type: 'line', source: 'alert-polygons', paint: { 'line-color': '#fb923c', 'line-width': 2 } });
      map.on('click', 'alert-fill', onAlertClick);
      map.on('mouseenter', 'alert-fill', onAlertEnter);
      map.on('mouseleave', 'alert-fill', onAlertLeave);
    };
    if (map.isStyleLoaded()) render(); else map.once('load', render);
    return () => { markers.forEach(m => m.remove()); map.off('load', render); if (map.getLayer('alert-fill')) { map.off('click', 'alert-fill', onAlertClick); map.off('mouseenter', 'alert-fill', onAlertEnter); map.off('mouseleave', 'alert-fill', onAlertLeave); } map.getCanvas().style.cursor = '';  if (map.getStyle()) { if (map.getLayer('alert-fill')) map.removeLayer('alert-fill'); if (map.getLayer('alert-outline')) map.removeLayer('alert-outline'); if (map.getSource('alert-polygons')) map.removeSource('alert-polygons'); } };
  }, [data, layers]);
  return <div ref={root} className="map-canvas" aria-label="Interactive map of Daytona Beach and surrounding communities" />;
}
function escapeHtml(s: string) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c); }
