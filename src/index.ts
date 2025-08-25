// src/index.ts
import { geocodeCity } from "./services/geocoding";
import { calculateOptimalGrid, calculateCoverageStats } from "./utils/grid";
import { searchPlacesNew } from "./services/places";
import { Place } from "./interfaces/place";
import { apiKey, city } from "./config/env";
import { excludedLinkTypes } from "./utils/excludedLinksFilter";
import { writeToCsv } from "./utils/export";

function isValidWebsite(website: string): boolean {
  if (!website) return false;
  
  const lowerWebsite = website.toLowerCase();
  
  return !excludedLinkTypes.some(excludedDomain => 
    lowerWebsite.includes(excludedDomain)
  );
}

export async function main(): Promise<void> {
  const isCsvOutput = process.argv.includes('--csv');

  if (!city) {
    console.error("❌ ERROR: Enter city name (e.g., Kyiv)");
    process.exit(1);
  }

  if (!apiKey) {
    console.error("❌ ERROR: GOOGLE_MAPS_API_KEY not found in .env file");
    process.exit(1);
  }

  try {
    console.log(`🔎 Geocoding city: ${city}`);
    const { northeast, southwest } = await geocodeCity(city, apiKey);
    console.log(`📍 City bounds: SW(${southwest.lat.toFixed(4)}, ${southwest.lng.toFixed(4)}) to NE(${northeast.lat.toFixed(4)}, ${northeast.lng.toFixed(4)})`);

    console.log("🧭 Calculating optimal search strategy...");
    const { gridPoints, radius } = calculateOptimalGrid(northeast, southwest);
    calculateCoverageStats(gridPoints, radius);

    const allPlaces = new Map<string, Place>();
    let totalSearches = 0;

    console.log(`\n🔍 Starting grid search with ${gridPoints.length} points...`);
    
    for (let i = 0; i < gridPoints.length; i++) {
      const point = gridPoints[i];
      console.log(`📍 Searching (${i + 1}/${gridPoints.length}) at: ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
      
      const places = await searchPlacesNew(point, apiKey, radius);
      totalSearches++;
      
      for (const place of places) {
        if (!allPlaces.has(place.place_id)) {
          allPlaces.set(place.place_id, place);
        }
      }

      await new Promise(r => setTimeout(r, 500));
      
      if ((i + 1) % 10 === 0) {
        console.log(`   🎯 Current unique places: ${allPlaces.size}`);
      }
    }

    console.log(`\n🎯 Total unique places found: ${allPlaces.size}`);
    console.log(`📊 Total API searches performed: ${totalSearches}`);

    const placesWithWebsites = Array.from(allPlaces.values()).filter(place =>
      place.website && isValidWebsite(place.website)
    );

    if (isCsvOutput) {
      const filename = `${city}_websites.csv`;
      writeToCsv(placesWithWebsites, filename);
    } else {
      console.log("\n🌐 Places with websites:");
      for (const place of placesWithWebsites) {
        // const types = place.types?.join(' | ') || 'N/A';
        console.log(`${place.name}: ${place.website}`);
      }
      console.log(`\n📈 Final statistics:`);
      console.log(`   🏢 Total places found: ${allPlaces.size}`);
      console.log(`   🌐 Places with websites: ${placesWithWebsites.length} (${(placesWithWebsites.length / allPlaces.size * 100).toFixed(1)}%)`);
      console.log(`   🔍 API calls made: ${totalSearches}`);
      console.log("✅ Search complete.");
    }
  } catch (err: any) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}