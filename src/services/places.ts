import axios, { AxiosResponse } from "axios";
import { LatLng } from "../interfaces/geo";
import { Place } from "../interfaces/place";
import { NearbySearchResponse } from "../interfaces/api";
import { includedTypes } from "../config/includedTypes";

export async function searchPlacesNew(
  location: LatLng,
  apiKey: string,
  radius = 1000
): Promise<Place[]> {
  try {
    const requestBody = {
      includedTypes: includedTypes,
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng,
          },
          radius: radius,
        },
      },
      rankPreference: "POPULARITY"
    };

    const res: AxiosResponse<NearbySearchResponse> = await axios.post(
      `https://places.googleapis.com/v1/places:searchNearby`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.websiteUri,places.types,places.location'
        }
      }
    );

    if (!res.data.places) {
      return [];
    }

    const places: Place[] = res.data.places.map((place) => ({
      name: place.displayName?.text || 'Unknown',
      place_id: place.id,
      website: place.websiteUri,
      types: place.types || [],
      location: place.location ? {
        lat: place.location.latitude,
        lng: place.location.longitude
      } : undefined
    }));

    return places;
  } catch (error) {
    console.error(`ERROR: Place search failed at ${location.lat}, ${location.lng}:`, error.response?.data?.error || error.message);
    return [];
  }
}
