// lib/providers/osrm.ts
// OSRM route fetcher for polyline drawing on Leaflet map with haversine straight-line fallback.

export interface RouteGeometry {
  coordinates: Array<[number, number]>; // [lat, lon] for Leaflet
  distanceMeters: number;
  durationSeconds: number;
  isFallback: boolean;
}

export async function fetchRoutePolyline(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  mode: 'walk' | 'bike' | 'drive' = 'bike'
): Promise<RouteGeometry> {
  const profileMap = {
    walk: 'foot',
    bike: 'bike',
    drive: 'driving'
  };

  const straightLineFallback: RouteGeometry = {
    coordinates: [
      [fromLat, fromLon],
      [toLat, toLon]
    ],
    distanceMeters: 0,
    durationSeconds: 0,
    isFallback: true
  };

  try {
    const profile = profileMap[mode] || 'driving';
    const url = `https://router.project-osrm.org/route/v1/${profile}/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': process.env.OSRM_USER_AGENT || 'ThirdPlaceSquad-2026Hackathon/1.0'
      },
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) return straightLineFallback;
    const json = await res.json();
    const route = json.routes?.[0];
    if (!route || !route.geometry?.coordinates) return straightLineFallback;

    // GeoJSON is [lon, lat], Leaflet needs [lat, lon]
    const coordinates: Array<[number, number]> = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]]
    );

    return {
      coordinates,
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      isFallback: false
    };
  } catch {
    return straightLineFallback;
  }
}
