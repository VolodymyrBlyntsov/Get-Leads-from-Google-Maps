import { geocodeCity } from "./services/geocoding";
import { generateGrid } from "./utils/grid";
import { searchPlaces, getPlaceDetails } from "./services/places";
import { Place } from "./interfaces/place";
import { apiKey, city } from "./config/env";

export async function main(): Promise<void> {
  if (!city) {
    console.error("❌ ERROR: Enter city name (e.g., Kyiv)");
    process.exit(1);
  }
  
  // The API key is now checked and loaded in the config file.

  try {
    console.log(`🔎 Geocoding city: ${city}`);
    const { northeast, southwest } = await geocodeCity(city, apiKey);

    console.log("🧭 Generating a coordinate grid...");
    const gridPoints = generateGrid(northeast, southwest);

    const allPlaces = new Map<string, Place>();

    console.log(`📡 Start search ${gridPoints.length} at points...`);
    for (let i = 0; i < gridPoints.length; i++) {
      const point = gridPoints[i];
      console.log(`📍 Search (${i + 1}/${gridPoints.length}) in points: ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
      const places = await searchPlaces(point, apiKey);

      for (const place of places) {
        if (!allPlaces.has(place.place_id)) {
          allPlaces.set(place.place_id, place);
        }
      }
    }

    console.log(`🔍 Unique places found: ${allPlaces.size}`);

    for (const place of allPlaces.values()) {
      const website = await getPlaceDetails(place.place_id, apiKey);
      if (website) {
        console.log(website);
      }
    }

    console.log("✅ Search complete.");
  } catch (err: any) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

main();