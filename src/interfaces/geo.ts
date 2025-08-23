export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeocodeResponse {
  results: {
    geometry: {
      bounds: {
        northeast: LatLng;
        southwest: LatLng;
      };
    };
  }[];
}