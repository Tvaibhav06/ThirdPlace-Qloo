// app/components/LeafletMap.tsx
// Interactive Leaflet map with OpenStreetMap tiles, venue pins, and route polyline.

'use client';

import React, { useEffect, useRef } from 'react';

export function LeafletMap({
  venues,
  selectedVenue,
  polylineCoords
}: {
  venues: any[];
  selectedVenue?: any;
  polylineCoords?: Array<[number, number]>;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically load leaflet on client side only
    import('leaflet').then(L => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Center around Chicago
        const centerLat = selectedVenue?.lat || 41.895;
        const centerLon = selectedVenue?.lon || -87.675;

        const map = L.map(mapContainerRef.current).setView([centerLat, centerLon], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing layers other than base tileLayer
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });

      // Custom icon
      const createIcon = (color: string) =>
        L.divIcon({
          className: 'custom-pin',
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

      // Add pins for venues
      venues.forEach(v => {
        const isSelected = selectedVenue && selectedVenue.id === v.id;
        const marker = L.marker([v.lat, v.lon], {
          icon: createIcon(isSelected ? '#6366f1' : '#94a3b8')
        }).addTo(map);

        marker.bindPopup(`<strong>${v.name}</strong><br/>${v.subtype?.replace('_', ' ')}<br/>${v.address}`);
        if (isSelected) marker.openPopup();
      });

      // Draw route polyline if present
      if (polylineCoords && polylineCoords.length > 1) {
        L.polyline(polylineCoords, {
          color: '#6366f1',
          weight: 4,
          opacity: 0.8,
          dashArray: '6, 6'
        }).addTo(map);
      }

      if (selectedVenue) {
        map.setView([selectedVenue.lat, selectedVenue.lon], 13);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [venues, selectedVenue, polylineCoords]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 my-6 overflow-hidden">
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="text-sm font-semibold text-white">Corridor & Venue Geography</h3>
        <span className="text-[10px] font-mono text-slate-400">Chicago Launch Metro • OpenStreetMap</span>
      </div>
      <div ref={mapContainerRef} className="w-full h-72 rounded-xl z-0" />
    </div>
  );
}
