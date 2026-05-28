import { useEffect, useRef } from 'react';

// Dynamically import Leaflet so it only loads client-side
let L = null;

const SEVERITY_COLORS = { 5: '#FF4444', 4: '#FF8C00', 3: '#FFD700', 2: '#44BB44', 1: '#4488FF' };

function createIncidentIcon(severity) {
  const color = SEVERITY_COLORS[severity] || '#CC2B2B';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:36px; height:36px;
        background:${color};
        border:3px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 12px rgba(0,0,0,0.5);
      ">
        <div style="
          transform:rotate(45deg);
          width:100%; height:100%;
          display:flex; align-items:center; justify-content:center;
          font-size:14px; font-weight:bold; color:white;
        ">${severity}</div>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

function createHospitalIcon(isFirst) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:32px; height:32px;
        background:${isFirst ? '#22c55e' : '#1e40af'};
        border:2px solid white;
        border-radius:6px;
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
        font-size:16px;
      ">🏥</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

export default function EmergencyMap({ incidentLat, incidentLng, hospitals = [], severityScore = 3 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Dynamically load Leaflet
    import('leaflet').then((leaflet) => {
      L = leaflet.default;

      if (mapInstanceRef.current) return; // already initialised

      const map = L.map(mapRef.current, {
        center: [incidentLat, incidentLng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Incident marker
      L.marker([incidentLat, incidentLng], { icon: createIncidentIcon(severityScore) })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:DM Sans,sans-serif; padding:4px">
            <strong style="color:#CC2B2B">🚨 Incident Location</strong><br/>
            <span style="font-size:12px; color:#aaa">Severity: ${severityScore}/5</span>
          </div>
        `)
        .openPopup();

      // Hospital markers
      hospitals.forEach((h, i) => {
        L.marker([parseFloat(h.lat), parseFloat(h.lng)], { icon: createHospitalIcon(i === 0) })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:DM Sans,sans-serif; padding:4px">
              <strong style="color:${i === 0 ? '#22c55e' : '#93c5fd'}">${i === 0 ? '⭐ NEAREST — ' : ''}${h.name}</strong><br/>
              <span style="font-size:12px; color:#aaa">${h.distance_km} km away · ~${h.estimated_minutes} min</span><br/>
              <span style="font-size:12px; color:#aaa">${h.type} · ${h.operating_hours}</span><br/>
              ${h.phone ? `<span style="font-size:12px; color:#aaa">📞 ${h.phone}</span>` : ''}
            </div>
          `);

        // Draw line from incident to nearest hospital
        if (i === 0) {
          L.polyline(
            [[incidentLat, incidentLng], [parseFloat(h.lat), parseFloat(h.lng)]],
            { color: '#22c55e', weight: 3, dashArray: '8 6', opacity: 0.8 }
          ).addTo(map);
        }
      });

      // Fit bounds to show all markers
      if (hospitals.length > 0) {
        const bounds = L.latLngBounds([
          [incidentLat, incidentLng],
          ...hospitals.map(h => [parseFloat(h.lat), parseFloat(h.lng)]),
        ]);
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [incidentLat, incidentLng, hospitals, severityScore]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '360px', borderRadius: '12px', overflow: 'hidden' }}
    />
  );
}
