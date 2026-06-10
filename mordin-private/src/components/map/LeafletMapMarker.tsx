import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import Swal from 'sweetalert2';

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
  center?: LatLng | null;
  onChange?: (val: LatLng) => void;
  height?: string;
  enableGeolocation?: boolean;
}

// Moves the map viewport whenever the parent location changes.
const MapController = ({
  center,
}: {
  center: LatLng | null | undefined;
}) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center?.lat, center?.lng, map]);

  return null;
};

// Flies to geolocation on initial load (without placing the marker)
const GeolocationController = ({
  enableGeolocation,
  hasCenter,
}: {
  enableGeolocation: boolean;
  hasCenter: boolean;
}) => {
  const map = useMap();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !enableGeolocation || hasCenter) return;
    done.current = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 15);
        },
        err => {
          console.warn('Geolocation Error:', err);
        }
      );
    }
  }, [map, enableGeolocation, hasCenter]);

  return null;
};

// Handles map click: places marker immediately or asks for confirmation before moving
const ClickHandler = ({
  markerPos,
  onPlace,
}: {
  markerPos: LatLng | null;
  onPlace: (pos: LatLng) => void;
}) => {
  const isConfirming = useRef(false);
  const markerPosRef = useRef(markerPos);
  markerPosRef.current = markerPos;
  const onPlaceRef = useRef(onPlace);
  onPlaceRef.current = onPlace;

  useMapEvents({
    click: async e => {
      if (isConfirming.current) return;
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (markerPosRef.current) {
        isConfirming.current = true;
        const result = await Swal.fire({
          title: 'เปลี่ยนตำแหน่ง?',
          text: 'คุณต้องการย้ายหมุดไปยังตำแหน่งใหม่หรือไม่?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          reverseButtons: true,
        });
        isConfirming.current = false;
        if (result.isConfirmed) {
          onPlaceRef.current(newPos);
        }
      } else {
        onPlaceRef.current(newPos);
      }
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
  const defaultBangkok = { lat: 13.7563, lng: 100.5018 };
  const [markerPos, setMarkerPos] = useState<LatLng | null>(center ?? null);
  const initialCenter = center ?? defaultBangkok;

  useEffect(() => {
    setMarkerPos(center ?? null);
  }, [center?.lat, center?.lng]);

  const handlePlace = (pos: LatLng) => {
    setMarkerPos(pos);
    if (onChange) onChange(pos);
  };

  return (
    <div>
      <p className="text-muted small mb-2">
        <i className="fas fa-map-pin me-1" />
        คลิกบนแผนที่เพื่อปักหมุดตำแหน่ง
        {markerPos && (
          <span className="ms-2 text-success">
            <i className="fas fa-check-circle me-1" />
            ปักหมุดแล้ว ({markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)})
          </span>
        )}
      </p>
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
          center={[initialCenter.lat, initialCenter.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markerPos && (
            <Marker position={[markerPos.lat, markerPos.lng]} />
          )}
          <MapController center={center} />
          <GeolocationController
            enableGeolocation={enableGeolocation}
            hasCenter={!!center}
          />
          <ClickHandler markerPos={markerPos} onPlace={handlePlace} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LeafletMapPicker;
