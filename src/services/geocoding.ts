import axios, { AxiosResponse } from "axios";
import { GeocodeResponse, LatLng } from "../interfaces/geo";

export async function geocodeCity(city: string, apiKey: string): Promise<{ northeast: LatLng; southwest: LatLng }> {
  try {
    const res: AxiosResponse<GeocodeResponse> = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: city,
          key: apiKey,
        },
      }
    );

    const result = res.data.results[0];
    if (!result || !result.geometry?.bounds) {
      throw new Error("ERROR: Could not find the city or its borders");
    }

    return result.geometry.bounds;
  } catch (error) {
    throw new Error(`ERROR: Geocoding failed: ${error.message}`);
  }
}