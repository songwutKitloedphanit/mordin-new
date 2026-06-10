import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import React from 'react';

interface LatLng {
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
}

interface MapWithMarkerProps {
  markerPositions?: LatLng[] | LatLng | undefined;
}

const DEFAULT_CENTER = { lat: 13.736717, lng: 100.523186 };
const DEFAULT_ZOOM = 6;
const MAX_MARKERS = 100;

const MemoizedMarker = React.memo(({ position }: { position: LatLng }) => (
  <Marker
    position={position}
    draggable={false}
    onClick={() => {
      // เปิด Google Maps ในแท็บใหม่เมื่อคลิก Marker
      window.open(
        `https://www.google.com/maps?q=${position.lat},${position.lng}`,
        '_blank'
      );
    }}
  />
));

const defaultMarkerPositions: LatLng[] = [];

const MapMarkerFix = ({
  markerPositions = defaultMarkerPositions,
}: MapWithMarkerProps) => {
  const parsedMarkerPositions = React.useMemo(() => {
    const positions = Array.isArray(markerPositions)
      ? markerPositions
      : [markerPositions].filter(Boolean);

    return positions
      .map(pos => ({
        lat: Number(pos?.lat ?? pos?.latitude ?? 0),
        lng: Number(pos?.lng ?? pos?.longitude ?? 0),
      }))
      .filter(
        pos =>
          !isNaN(pos.lat) &&
          !isNaN(pos.lng) &&
          Math.abs(pos.lat) <= 90 &&
          Math.abs(pos.lng) <= 180
      );
  }, [markerPositions]);

  const isValid = parsedMarkerPositions.length > 0;
  const firstMarker = isValid ? parsedMarkerPositions[0] : DEFAULT_CENTER;
  const zoom = parsedMarkerPositions.length === 1 ? 14 : DEFAULT_ZOOM;

  const containerStyle = {
    width: '100%',
    height: '400px',
  };

  return (
    <APIProvider apiKey="AIzaSyB38ClEA6wcIw-6PEomjW297jb7Rx9GNo4">
      <Map
        style={containerStyle}
        defaultCenter={firstMarker}
        defaultZoom={zoom}
        gestureHandling="greedy"
      >
        {isValid &&
          parsedMarkerPositions
            .slice(0, MAX_MARKERS)
            .map(pos => (
              <MemoizedMarker
                key={`${pos.lat.toFixed(6)}-${pos.lng.toFixed(6)}`}
                position={pos}
              />
            ))}
      </Map>
    </APIProvider>
  );
};

export default React.memo(MapMarkerFix);
