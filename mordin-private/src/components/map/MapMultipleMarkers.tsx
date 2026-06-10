import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

import { Shop } from '../../types/Shop';

interface MapMultipleMarkersProps {
  shops: Shop[];
}

interface MarkerWithLatLng {
  lat: number;
  lng: number;
  name: string;
  shopAddress: string;
}

const MapMultipleMarkers = ({ shops }: MapMultipleMarkersProps) => {
  const [markers, setMarkers] = useState<MarkerWithLatLng[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerWithLatLng | null>(
    null
  );

  useEffect(() => {
    const parsed: MarkerWithLatLng[] = shops.map(shop => ({
      lat: shop.latitude,
      lng: shop.longitude,
      name: shop.name,
      shopAddress: shop.shopAddress,
    }));
    setMarkers(parsed);
  }, [shops]);

  // Default center: Thailand
  const center =
    markers.length > 0 ? markers[0] : { lat: 15.87, lng: 100.9925 };

  const getGoogleMapsLink = (marker: MarkerWithLatLng) =>
    marker.shopAddress.startsWith('https://maps.app.goo.gl')
      ? marker.shopAddress
      : `https://www.google.com/maps/search/?api=1&query=${marker.lat},${marker.lng}`;

  const closeModal = () => setSelectedMarker(null);

  return (
    <APIProvider apiKey="AIzaSyB38ClEA6wcIw-6PEomjW297jb7Rx9GNo4">
      <Map
        defaultZoom={6}
        defaultCenter={center}
        style={{ height: '450px', width: '100%', borderRadius: '8px' }}
      >
        {markers.map(marker => (
          <Marker
            key={`${marker.lat}-${marker.lng}`}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
            onClick={() => setSelectedMarker(marker)}
          />
        ))}
      </Map>

      {selectedMarker && (
        <>
          <div
            className="modal fade show"
            style={{ display: 'block' }}
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedMarker.name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>ที่อยู่ร้านค้า:</p>
                  <p style={{ wordBreak: 'break-all' }}>
                    {selectedMarker.shopAddress}
                  </p>
                  <a
                    href={getGoogleMapsLink(selectedMarker)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    เปิดใน Google Maps
                  </a>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </APIProvider>
  );
};

export default MapMultipleMarkers;
