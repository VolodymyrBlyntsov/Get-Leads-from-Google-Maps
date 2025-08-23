/**
 * Generates a grid of coordinates within the city limits for more accurate search results.
 * @param northeast - Coordinates of the northeast corner of the city.
 * @param southwest - Coordinates of the southwestern corner of the city.
 * @param steps - Number of steps in latitude and longitude.
 * @returns array of coordinates.
 */

import { LatLng } from "../interfaces/geo";

export function generateGrid(northeast: LatLng, southwest: LatLng, steps = 6): LatLng[] {
  const latStep = (northeast.lat - southwest.lat) / steps;
  const lngStep = (northeast.lng - southwest.lng) / steps;

  const grid: LatLng[] = [];

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      grid.push({
        lat: southwest.lat + latStep * i,
        lng: southwest.lng + lngStep * j,
      });
    }
  }

  return grid;
}
