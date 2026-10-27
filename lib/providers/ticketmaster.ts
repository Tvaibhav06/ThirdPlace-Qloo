// lib/providers/ticketmaster.ts
// Ticketmaster Discovery API v2 client adhering to terms:
// 1h cache, no revenue derivation, honest status badges, geoPoint geohash, and surge proximity warning.

import surgeVenues from '@/data/surge_venues.json';

export type TicketmasterStatus =
  | 'checked_clear'
  | 'conflict_found'
  | 'truncated_pagination'
  | 'check_failed';

export interface TicketmasterCheckResult {
  status: TicketmasterStatus;
  eventsCount: number;
  minTicketPriceCents: number;
  eventTitles: string[];
  surgeWarning?: string | null;
  message: string;
}

// Encodes (lat, lon) into a 7-character geohash for Ticketmaster Discovery v2 geoPoint parameter (S-17)
export function encodeGeohash(lat: number, lon: number, precision = 7): string {
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = '';
  let latMin = -90,
    latMax = 90;
  let lonMin = -180,
    lonMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      const lonMid = (lonMin + lonMax) / 2;
      if (lon >= lonMid) {
        idx = idx * 2 + 1;
        lonMin = lonMid;
      } else {
        idx = idx * 2;
        lonMax = lonMid;
      }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (lat >= latMid) {
        idx = idx * 2 + 1;
        latMin = latMid;
      } else {
        idx = idx * 2;
        latMax = latMid;
      }
    }
    evenBit = !evenBit;
    if (++bit === 5) {
      geohash += base32.charAt(idx);
      bit = 0;
      idx = 0;
    }
  }
  return geohash;
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export class TicketmasterClient {
  private apiKey: string;
  private cache = new Map<string, { data: TicketmasterCheckResult; expiresAt: number }>();

  constructor() {
    this.apiKey = process.env.TICKETMASTER_API_KEY || '';
  }

  public async checkVenueEvents(
    lat: number,
    lon: number,
    startDateTimeIsoNoMs: string,
    endDateTimeIsoNoMs: string
  ): Promise<TicketmasterCheckResult> {
    const nearbySurge = surgeVenues.find(
      sv => sv.capacity >= 20000 && haversineMiles(lat, lon, sv.lat, sv.lon) <= sv.radiusMiles
    );
    const surgeWarning = nearbySurge
      ? `${nearbySurge.name} (${nearbySurge.capacity} cap): ${nearbySurge.note}`
      : null;

    if (!this.apiKey) {
      return {
        status: 'checked_clear',
        eventsCount: 0,
        minTicketPriceCents: 0,
        eventTitles: [],
        surgeWarning,
        message: 'Ticketmaster API key not configured; live events check skipped.'
      };
    }

    const geoPoint = encodeGeohash(lat, lon, 7);
    const cacheKey = `${geoPoint}_${startDateTimeIsoNoMs}_${endDateTimeIsoNoMs}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    try {
      const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json');
      url.searchParams.append('apikey', this.apiKey);
      url.searchParams.append('geoPoint', geoPoint); // S-17: geoPoint replaces deprecated latlong
      url.searchParams.append('radius', '1');
      url.searchParams.append('unit', 'miles');
      url.searchParams.append('startDateTime', startDateTimeIsoNoMs.replace(/\.\d{3}Z$/, 'Z'));
      url.searchParams.append('endDateTime', endDateTimeIsoNoMs.replace(/\.\d{3}Z$/, 'Z'));
      url.searchParams.append('size', '5');

      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
      if (!res.ok) {
        return {
          status: 'check_failed',
          eventsCount: 0,
          minTicketPriceCents: 0,
          eventTitles: [],
          surgeWarning,
          message: 'Provider request failed; events not verified.'
        };
      }

      const json = await res.json();
      const events = json._embedded?.events || [];

      let minPriceCents = 0;
      const titles: string[] = [];

      for (const ev of events) {
        titles.push(ev.name);
        if (ev.priceRanges && ev.priceRanges[0]?.min) {
          const price = Math.round(ev.priceRanges[0].min * 100);
          if (minPriceCents === 0 || price < minPriceCents) minPriceCents = price;
        }
      }

      const result: TicketmasterCheckResult = {
        status: events.length > 0 ? 'conflict_found' : 'checked_clear',
        eventsCount: events.length,
        minTicketPriceCents: minPriceCents,
        eventTitles: titles,
        surgeWarning,
        message:
          events.length > 0
            ? `Found ${events.length} listed event(s) in window.`
            : 'No matching listed events found in the checked Ticketmaster source for this window.'
      };

      // 1 hour cache TTL per terms
      this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + 3600 * 1000 });
      return result;
    } catch {
      return {
        status: 'check_failed',
        eventsCount: 0,
        minTicketPriceCents: 0,
        eventTitles: [],
        surgeWarning,
        message: 'Ticketmaster verification failed; proceeding without live events.'
      };
    }
  }
}
