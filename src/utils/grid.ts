/**
 * Generates a grid of coordinates within the city limits for more accurate search results.
 * @param northeast - Coordinates of the northeast corner of the city.
 * @param southwest - Coordinates of the southwestern corner of the city.
 * @param steps - Number of steps in latitude and longitude.
 * @returns array of coordinates.
 */
import { LatLng } from "../interfaces/geo";

export function calculateOptimalGrid(northeast: LatLng, southwest: LatLng): { gridPoints: LatLng[]; radius: number } {
  const latDistance = northeast.lat - southwest.lat;
  const lngDistance = northeast.lng - southwest.lng;
  
  const distanceKm = Math.sqrt(latDistance ** 2 + lngDistance ** 2) * 111;
    let steps: number;
  let radius: number;
  
  if (distanceKm < 15) { // small cities
    steps = 4;
    radius = 2000;
  } else if (distanceKm < 40) { //mid-sizes cities
    steps = 6;
    radius = 1800;
  } else { // huge cities
    steps = 8;
    radius = 1500;
  }
  
  const latStep = latDistance / steps;
  const lngStep = lngDistance / steps;

  const gridPoints: LatLng[] = [];

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      gridPoints.push({
        lat: southwest.lat + latStep * i,
        lng: southwest.lng + lngStep * j,
      });
    }
  }

  console.log(`📊 City size: ~${distanceKm.toFixed(1)}km, Grid: ${steps+1}x${steps+1}, Radius: ${radius}m`);
  return { gridPoints, radius };
}
export function calculateCoverageStats(gridPoints: LatLng[], radius: number): void {
  const totalPoints = gridPoints.length;
  const coverageArea = totalPoints * Math.PI * (radius / 1000) ** 2; // km^2
  console.log(`🎯 Search points: ${totalPoints}, Estimated coverage: ~${coverageArea.toFixed(1)}km²`);
}