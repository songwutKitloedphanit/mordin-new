import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import React, { useEffect, useState } from 'react';
import '../../assets/css/toggle.css';

interface MapPickerInterface {
  /** ถ้า parent ไม่ส่ง location มา จะใช้ defaultCenter แทน */
  defaultCenter?: { lat: number; lng: number };
  location: { lat: number; lng: number } | null;
  setLocation: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | null>
  >;
  locationError: string | null;
  setLocationError: React.Dispatch<React.SetStateAction<string | null>>;
  readOnly?: boolean;
}

const MapPicker: React.FC<MapPickerInterface> = ({
  location,
  defaultCenter,
  setLocation,
  locationError,
  setLocationError,
  readOnly = false,
}) => {
  const [editMode, setEditMode] = useState(false);

  // กำหนด center ของแผนที่: location > defaultCenter > กรุงเทพ
  const center = location ?? defaultCenter ?? { lat: 13.7563, lng: 100.5018 };

  useEffect(() => {
    if (readOnly) {
      setEditMode(false);
    }
  }, [readOnly]);

  useEffect(() => {
    if (readOnly || location) return;
    if (!navigator.geolocation) {
      setLocationError('เบราว์เซอร์ไม่รองรับการใช้ GPS');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
      },
      err => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError(
            'ไม่สามารถดึงตำแหน่งได้: ผู้ใช้ปฏิเสธการเข้าถึงตำแหน่ง'
          );
        } else {
          setLocationError(`ไม่สามารถดึงตำแหน่งได้: ${err.message}`);
        }
      },
      { timeout: 10000 }
    );
  }, [readOnly, location, setLocation, setLocationError]);

  return (
    <>
      {locationError ? (
        <div className="text-danger">{locationError}</div>
      ) : (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            style={{ width: '100%', height: '50vh' }}
            center={center}
            defaultZoom={17}
            // ถ้า editMode=false ปิดการลาก/ซูม
            gestureHandling={editMode ? 'greedy' : 'none'}
            disableDefaultUI
            draggable={editMode}
            zoomControl={editMode}
            onCameraChanged={e => {
              const c = e.map.getCenter();
              if (editMode && c) {
                const newLoc = { lat: c.lat(), lng: c.lng() };
                setLocation(newLoc);
              }
            }}
          >
            <Marker position={center} />

            {/* Toggle edit mode */}
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'white',
                padding: '6px 10px',
                borderRadius: '8px',
                boxShadow: '0 0 6px rgba(0,0,0,0.1)',
              }}
            >
              <span style={{ fontSize: '14px' }}>แก้ไขตำแหน่ง</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={editMode}
                  onChange={() => {
                    setEditMode(prev => !prev);
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </Map>
        </APIProvider>
      )}
    </>
  );
};

export default MapPicker;
