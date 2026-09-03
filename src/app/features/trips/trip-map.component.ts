import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { I18nService } from '../../core/i18n/i18n.service';
import { Activity } from '../../core/models/trip.model';
import { ItineraryStore } from './itinerary.store';

interface PinPoint {
  activity: Activity;
  dayNumber: number;
  dayDate: string;
}

export const DAY_COLORS = [
  '#f97316', '#3b82f6', '#10b981', '#8b5cf6',
  '#ec4899', '#f59e0b', '#06b6d4', '#ef4444',
];

@Component({
  selector: 'app-trip-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="background:white; border:1.5px solid #e2e8f0; border-radius:18px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.04);">
      <!-- Header -->
      <div style="padding:14px 18px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
        <h3 style="font-size:15px; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:7px; margin:0; font-family:'Outfit',sans-serif;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {{ t('map.title') }}
        </h3>
        @if (pinCount() === 0) {
          <span style="font-size:12px; color:#94a3b8; font-family:'Outfit',sans-serif;">
            {{ t('map.emptyHint') }}
          </span>
        }
      </div>

      <!-- Map canvas -->
      <div #mapContainer style="height:300px; width:100%;"></div>

      <!-- Legend -->
      @if (store.days().length > 0) {
        <div style="padding:10px 18px; display:flex; gap:12px; flex-wrap:wrap; border-top:1px solid #f1f5f9;">
          @for (day of store.days(); track day.id; let i = $index) {
            <div style="display:flex; align-items:center; gap:5px;">
              <span [style.background]="getDayColor(i)"
                style="width:10px; height:10px; border-radius:50%; flex-shrink:0; display:inline-block;">
              </span>
              <span style="font-size:12px; color:#64748b; font-family:'Outfit',sans-serif;">
                {{ t('map.dayShort', { number: i + 1 }) }}
              </span>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class TripMapComponent implements AfterViewInit {
  protected readonly store = inject(ItineraryStore);
  private readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly t = this.i18n.t;
  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;

  protected readonly points = computed<PinPoint[]>(() => {
    const days = this.store.days();
    const dayIndex = new Map(days.map((d, idx) => [d.id, { idx, day: d }] as const));
    const map = this.store.activitiesByDay();
    const result: PinPoint[] = [];
    for (const day of days) {
      const acts = map.get(day.id) ?? [];
      for (const a of acts) {
        if (a.latitude != null && a.longitude != null) {
          const meta = dayIndex.get(day.id)!;
          result.push({ activity: a, dayNumber: meta.idx + 1, dayDate: meta.day.day_date });
        }
      }
    }
    return result;
  });

  protected readonly pinCount = computed(() => this.points().length);

  protected getDayColor(index: number): string {
    return DAY_COLORS[index % DAY_COLORS.length];
  }

  constructor() {
    effect(() => {
      this.points();
      // Los popups llevan texto traducido: se redibujan al cambiar de idioma.
      this.i18n.lang();
      if (this.map) this.renderPins();
    });
    this.destroyRef.onDestroy(() => this.disposeMap());
  }

  ngAfterViewInit() {
    queueMicrotask(() => this.initMap());
  }

  private initMap() {
    if (this.map) return;
    this.map = L.map(this.mapContainer().nativeElement, {
      center: [40.4168, -3.7038],
      zoom: 4,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);
    this.renderPins();
  }

  private renderPins() {
    if (!this.map || !this.markersLayer) return;
    this.markersLayer.clearLayers();

    const pts = this.points();
    if (pts.length === 0) return;

    const latLngs: L.LatLngTuple[] = [];
    for (const p of pts) {
      const color = DAY_COLORS[(p.dayNumber - 1) % DAY_COLORS.length];
      const icon = L.divIcon({
        className: '',
        html: this.pinHtml(p.dayNumber, color),
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -36],
      });
      const marker = L.marker([p.activity.latitude!, p.activity.longitude!], { icon });
      marker.bindPopup(this.popupHtml(p, color));
      marker.addTo(this.markersLayer);
      latLngs.push([p.activity.latitude!, p.activity.longitude!]);
    }

    if (latLngs.length === 1) {
      this.map.setView(latLngs[0], 13);
    } else {
      this.map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40], maxZoom: 10 });
    }
  }

  private pinHtml(num: number, color: string) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
      <text x="14" y="18" text-anchor="middle" font-size="9" font-weight="bold" fill="${color}" font-family="Outfit,sans-serif">${num}</text>
    </svg>`;
  }

  private popupHtml(p: PinPoint, color: string) {
    const escape = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const title = escape(p.activity.title);
    const location = p.activity.location ? escape(p.activity.location) : '';
    const date = new Date(p.dayDate + 'T12:00:00').toLocaleDateString(this.i18n.dateLocale(), {
      day: 'numeric',
      month: 'long',
    });
    return `
      <div style="font-family:'Outfit',sans-serif; min-width:160px; padding:4px 2px;">
        <strong style="font-size:14px; color:#0f172a;">${title}</strong>
        <div style="margin-top:6px; display:flex; align-items:center; gap:4px;">
          <span style="width:10px; height:10px; border-radius:50%; background:${color}; display:inline-block; flex-shrink:0;"></span>
          <span style="font-size:12px; color:#64748b;">${this.i18n.t('map.dayShort', {
            number: p.dayNumber,
          })} — ${date}</span>
        </div>
        ${location ? `<div style="font-size:12px; color:#94a3b8; margin-top:3px;">📍 ${location}</div>` : ''}
      </div>
    `;
  }

  private disposeMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markersLayer = null;
    }
  }
}
