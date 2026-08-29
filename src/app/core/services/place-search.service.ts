import { Injectable } from '@angular/core';

export interface PlaceSuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

@Injectable({ providedIn: 'root' })
export class PlaceSearchService {
  private readonly endpoint = 'https://nominatim.openstreetmap.org/search';
  private readonly cache = new Map<string, PlaceSuggestion[]>();

  async search(query: string, limit = 5): Promise<PlaceSuggestion[]> {
    const trimmed = query.trim();
    if (trimmed.length < 3) return [];

    const cacheKey = `${trimmed.toLowerCase()}|${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      q: trimmed,
      format: 'json',
      addressdetails: '0',
      limit: String(limit),
    });

    const response = await fetch(`${this.endpoint}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Geocoder respondió ${response.status}`);
    }
    const data = (await response.json()) as NominatimResult[];
    const suggestions: PlaceSuggestion[] = data.map((r) => ({
      displayName: r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
    }));

    this.cache.set(cacheKey, suggestions);
    return suggestions;
  }
}
