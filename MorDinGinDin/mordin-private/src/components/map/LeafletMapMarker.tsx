import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet';

// --- Fix Icon Leaflet ---
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

export interface LatLng {
  lat: number;
  lng: number;
}

interface LeafletMapPickerProps {
  // ค่าพิกัดเริ่มต้น หรือค่าที่ส่งมาจาก Parent
  center?: LatLng | null;
  // ฟังก์ชัน Callback เมื่อพิกัดเปลี่ยน (ใช้แทน setLand)
  onChange?: (val: LatLng) => void;
  // ความสูงของแผนที่ (Optional: default 400px)
  height?: string;
  // เปิดใช้งาน Geolocation ตอนโหลดครั้งแรกหรือไม่ (Optional: default true)
  enableGeolocation?: boolean;
}

const MapController = ({
  center,
  onMoveEnd,
}: {
  center: LatLng | null | undefined;
  onMoveEnd: (pos: LatLng) => void;
}) => {
  const map = useMap();

  // 1. Sync: เมื่อค่า center (จาก Props) เปลี่ยน -> สั่ง Map บินไปที่นั่น
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);

  // 2. Event: เมื่อผู้ใช้ลาก Map เสร็จ -> ส่งค่ากลับ
  useMapEvents({
    moveend: () => {
      const newCenter = map.getCenter();
      onMoveEnd({ lat: newCenter.lat, lng: newCenter.lng });
    },
  });

  return null;
};

const LeafletMapPicker = ({
  center,
  onChange,
  height = '400px',
  enableGeolocation = true,
}: LeafletMapPickerProps) => {
  // State ภายในสำหรับเก็บพิกัดปัจจุบันของ Map
  // ถ้าไม่มี center ส่งมา ให้เริ่มที่กรุงเทพฯ
  const defaultBangkok = { lat: 13.7563, lng: 100.5018 };
  const [mapCenter, setMapCenter] = useState<LatLng>(center || defaultBangkok);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Sync: ถ้า Parent ส่ง center มาใหม่ ให้ update state ภายใน
  useEffect(() => {
    if (center) {
      setMapCenter(center);
    }
  }, [center]);

  // Logic: Geolocation (หาตำแหน่งปัจจุบันตอนโหลดครั้งแรก)
  useEffect(() => {
    if (!hasLoaded && enableGeolocation && !center) {
      // ถ้ายังไม่เคยโหลด และไม่มี center ส่งมา ให้ลองหา Location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const currentPos = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setMapCenter(currentPos);
            // แจ้ง Parent ด้วยว่าเจอตำแหน่งแล้ว
            if (onChange) onChange(currentPos);
          },
          err => {
            console.warn('Geolocation Error:', err);
          }
        );
      }
      setHasLoaded(true);
    }
  }, [hasLoaded, enableGeolocation, center, onChange]);

  // Handle: เมื่อ Map ถูกลาก
  const handleMapMove = (newPos: LatLng) => {
    setMapCenter(newPos); // Update UI ตัวเอง
    if (onChange) {
      onChange(newPos); // ส่งค่ากลับ Parent
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: height,
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #ddd',
        zIndex: 0,
      }}
    >
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker กลางจอ */}
        <Marker position={[mapCenter.lat, mapCenter.lng]} />

        {/* Controller */}
        <MapController center={center} onMoveEnd={handleMapMove} />
      </MapContainer>
    </div>
  );
};

export default LeafletMapPicker;
