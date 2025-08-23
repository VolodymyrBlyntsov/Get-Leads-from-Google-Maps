import axios, { AxiosResponse } from "axios";
import { LatLng } from "../interfaces/geo";
import { Place } from "../interfaces/place";
import { NearbySearchResponse, PlaceDetailsResponse } from "../interfaces/api";
import { excludedTypes } from "../config"; // Import from config file

export async function searchPlaces(
  location: LatLng,
  apiKey: string,
  radius = 2000,
  pagetoken = ""
): Promise<Place[]> {
  try {
    const params: any = {
      location: `${location.lat},${location.lng}`,
      radius,
      key: apiKey,
      keyword: "store OR construction OR hardware OR building",
      type: "store",
    };

    if (pagetoken) params.pagetoken = pagetoken;

    const res: AxiosResponse<NearbySearchResponse> = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      { params }
    );

    const filtered = (res.data.results || []).filter((place) => {
      const types = place.types || [];
      return !types.some((type: string) => excludedTypes.includes(type));
    });

    const places: Place[] = filtered.map((place) => ({
      name: place.name,
      place_id: place.place_id,
    }));

    if (res.data.next_page_token) {
      await new Promise((r) => setTimeout(r, 2000));
      const morePlaces = await searchPlaces(location, apiKey, radius, res.data.next_page_token);
      return [...places, ...morePlaces];
    }

    return places;
  } catch (error) {
    throw new Error(`ERROR: Place search failed: ${error.message}`);
  }
}

export async function getPlaceDetails(placeId: string, apiKey: string): Promise<string | null> {
  try {
    const res: AxiosResponse<PlaceDetailsResponse> = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          key: apiKey,
          fields: "website",
        },
      }
    );
    return res.data.result?.website || null;
  } catch (error) {
    return null;
  }
}