import { geocodeCity } from "./services/geocoding";
import { calculateOptimalGrid, calculateCoverageStats } from "./utils/grid";
import { searchPlacesNew } from "./services/places";
import { Place } from "./interfaces/place";
import { apiKey, city } from "./config/env";
import { excludedLinkTypes } from "./utils/excludedLinksFilter"

function isValidWebsite(website: string): boolean {
  if (!website) return false;
  
  const lowerWebsite = website.toLowerCase();
  
  return !excludedLinkTypes.some(excludedDomain => 
    lowerWebsite.includes(excludedDomain)
  );
}

export async function main(): Promise<void> {
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

    console.log("\n🌐 Places with websites:");
    let websiteCount = 0;
    
    for (const place of allPlaces.values()) {
      if (place.website && isValidWebsite(place.website)) {
        //const types = place.types?.join(' | ') || 'N/A';
        
        //To find out what type(s) of company on Google Maps, add  `${types}`inside console.log AND uncomment types variable (useful for CSV)
        console.log(`${place.name}: ${place.website}`);
        websiteCount++;
      }
    }

    console.log(`\n📈 Final statistics:`);
    console.log(`   🏢 Total places found: ${allPlaces.size}`);
    console.log(`   🌐 Places with websites: ${websiteCount} (${(websiteCount/allPlaces.size*100).toFixed(1)}%)`);
    console.log(`   🔍 API calls made: ${totalSearches}`);
    console.log("✅ Search complete.");
    
  } catch (err: any) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}