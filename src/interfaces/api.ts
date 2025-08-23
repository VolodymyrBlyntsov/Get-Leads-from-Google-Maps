import { Place } from "./place";

export interface NearbySearchRequest {
  includedTypes: string[];
  maxResultCount: number;
  locationRestriction: {
    circle: {
      center: {
        latitude: number;
        longitude: number;
      };
      radius: number;
    };
  };
  languageCode?: string;
  regionCode?: string;
}

export interface NearbySearchResponse {
  places: Array<{
    id: string;
    displayName: {
      text: string;
      languageCode: string;
    };
    websiteUri?: string;
    types: string[];
    location: {
      latitude: number;
      longitude: number;
    };
  }>;
  nextPageToken?: string;
}

export interface SearchResult {
  uniquePlaces: Map<string, Place>;
}
