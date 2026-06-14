export const extractLatLngFromGoogleMapsUrl = (
  url: string
): { lat: number; lng: number } | null => {
  const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2]),
    };
  }
  return null;
};
