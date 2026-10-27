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
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 0; border: 2px solid #ffffff; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

      // Add pins for venues
      venues.forEach(v => {
        const isSelected = selectedVenue && selectedVenue.id === v.id;
        const marker = L.marker([v.lat, v.lon], {
          icon: createIcon(isSelected ? '#121212' : '#857f72')
        }).addTo(map);

        marker.bindPopup(`<strong>${v.name}</strong><br/>${v.subtype?.replace('_', ' ')}<br/>${v.address}`);
        if (isSelected) marker.openPopup();
      });

      // Draw route polyline if present
      if (polylineCoords && polylineCoords.length > 1) {
        L.polyline(polylineCoords, {
          color: '#121212',
          weight: 3,
          opacity: 0.9,
          dashArray: '4, 4'
        }).addTo(map);
      }

      if (selectedVenue) {
        map.setView([selectedVenue.lat, selectedVenue.lon], 13);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [venues, selectedVenue, polylineCoords]);

  return (
    <div className="border border-[#1c1917] bg-[#efeae1] p-4 my-6">
      <div className="flex items-center justify-between mb-3 border-b border-[#d4cdbe] pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#18181b] uppercase tracking-wider">
            06 CORRIDOR & VENUE GEOGRAPHY
          </span>
          <span className="text-[10px] font-mono text-[#857f72]">Chicago Launch Metro</span>
        </div>
        <span className="text-[10px] font-mono text-[#57534e]">41.8781° N, 87.6298° W • OpenStreetMap</span>
      </div>
      <div ref={mapContainerRef} className="w-full h-72 border border-[#1c1917] z-0" />
    </div>
  );
}

export default LeafletMap;
