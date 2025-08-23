import { LatLng } from "./geo";

export interface Place {
  name: string;
  website?: string;
  place_id: string;
  types?: string[];
  location?: LatLng;
}