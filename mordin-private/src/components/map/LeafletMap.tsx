import L from 'leaflet';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

// 1. สร้าง Interface กลาง สำหรับรับข้อมูล Marker
export interface MapMarkerData {
  id: string | number;
  lat: number;
  lng: number;
  title?: string; // ชื่อที่จะแสดงตัวหนา (เช่น ชื่อร้าน)
  subtitle?: string; // ข้อความรอง (เช่น เบอร์โทร)
  link?: string; // ลิงก์ (เช่น Google Maps)
}

const DefaultIcon = L.icon({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component ช่ว»รับ Map ให้พอดีกับทุกจุด (Fit Bounds)
const FitBounds = ({ markers }: { markers: MapMarkerData[] }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const points = markers.map(m => [m.lat, m.lng] as [number, number]);
      const bounds = L.latLngBounds(points);

      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
};

interface MapProps {
  markers: MapMarkerData[];
  height?: string;
}

const LeafletMap = ({ markers, height = '500px' }: MapProps) => {
  const defaultCenter: [number, number] = [13.7563, 100.5018];

  // Filter out markers with invalid coordinates
  const validMarkers = markers.filter(
    marker =>
      marker.lat != null &&
      marker.lng != null &&
      !isNaN(Number(marker.lat)) &&
      !isNaN(Number(marker.lng))
  );

  // If no valid markers, return a message or empty map
  if (validMarkers.length === 0) {
    return (
      <div
        style={{
          height: height,
          width: '100%',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
        }}
      >
        <p style={{ color: '#666', margin: 0 }}>ไม่พบข้อมูลพิกัด</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: height, width: '100%', borderRadius: '8px', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {validMarkers.map(marker => (
        <Marker key={marker.id} position={[marker.lat, marker.lng]}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              {/* แสดง Title */}
              {marker.title && (
                <>
                  <strong style={{ fontSize: '14px' }}>{marker.title}</strong>
                  <br />
                </>
              )}

              {/* แสดง Subtitle (ถ้ามี) */}
              {marker.subtitle && (
                <>
                  <span>{marker.subtitle}</span>
                  <br />
                </>
              )}

              {/* แสดง Link (ถ้ามี) */}
              {marker.link && (
                <a
                  href={marker.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '12px' }}
                >
                  ดูใน Google Maps
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      <FitBounds markers={validMarkers} />
    </MapContainer>
  );
};

export default LeafletMap;
