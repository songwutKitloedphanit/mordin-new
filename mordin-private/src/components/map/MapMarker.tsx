import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

import { LatLng } from '@/types/Land';

interface MapWithMarkerProps {
  defaultCenter: LatLng;
  setLand: React.Dispatch<React.SetStateAction<LatLng | undefined>>;
}
const MapMarker = ({ defaultCenter, setLand }: MapWithMarkerProps) => {
  const [mapCenter, setMapCenter] = useState<LatLng>(defaultCenter);
  const [isFirstLoad, setIsFirstLoad] = useState(true); // เพิ่มตัวแปรเช็คว่าโหลดครั้งแรกไหม

  // เรียกตำแหน่งปัจจุบันตอนโหลดครั้งแรก
  useEffect(() => {
    if (isFirstLoad) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const currentPos = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setMapCenter(currentPos);
            setLand(currentPos);
          },
          err => {
            console.warn('ไม่สามารถดึงตำแหน่งได้', err);
            setMapCenter(defaultCenter);
            setLand(defaultCenter);
          }
        );
      } else {
        console.warn('Geolocation ไม่รองรับในเบราว์เซอร์นี้');
        setMapCenter(defaultCenter);
        setLand(defaultCenter);
      }
      setIsFirstLoad(false); // หยุดหลังโหลดครั้งแรก
    }
  }, [isFirstLoad, defaultCenter, setLand]);

  // ถ้ามีการเปลี่ยนจังหวัด
  useEffect(() => {
    if (!isFirstLoad) {
      setMapCenter(defaultCenter);
      setLand(defaultCenter);
    }
  }, [defaultCenter, setLand, isFirstLoad]);

  const handleCameraChanged = (event: { map: google.maps.Map }) => {
    const center = event.map.getCenter?.();
    if (center) {
      const newCenter = {
        lat: center.lat(),
        lng: center.lng(),
      };
      setMapCenter(newCenter);
      setLand(newCenter);
    }
  };

  const containerStyle = {
    width: '100%',
    height: '400px',
  };

  return (
    <APIProvider apiKey="AIzaSyB38ClEA6wcIw-6PEomjW297jb7Rx9GNo4">
      <Map
        style={containerStyle}
        // defaultCenter={mapCenter}
        center={mapCenter}
        defaultZoom={15}
        gestureHandling="greedy"
        onCameraChanged={handleCameraChanged}
      >
        <Marker position={mapCenter} draggable={false} />
      </Map>
    </APIProvider>
  );
};

export default MapMarker;
