import { Place } from "./place";

export interface NearbySearchResponse {
  results: {
    name: string;
    place_id: string;
    types?: string[];
  }[];
  next_page_token?: string;
}

export interface PlaceDetailsResponse {
  result: {
    website?: string;
  };
}

export interface SearchResult {
  uniquePlaces: Map<string, Place>;
}
