import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GOOGLE_MAPS_API_KEY!;
const city = process.argv[2];

if (!city) {
  console.error("ERROR: Enter the correct name of the city in English (e.g. Kyiv)");
  process.exit(1);
}

interface LatLng {
  lat: number;
  lng: number;
}

interface Place {
  name: string;
  website?: string;
  place_id: string;
}

// Type of places which program ignore 
const excludedTypes = [
  "restaurant",
  "food",
  "cafe",
  "school",
  "university",
  "shopping_mall",
  "grocery_or_supermarket",
  "bakery",
  "bar",
  "meal_delivery",
  "meal_takeaway",
  "night_club"
];

// Geocoding city
async function geocodeCity(city: string): Promise<{ northeast: LatLng; southwest: LatLng }> {
  const res = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
    params: {
      address: city,
      key: apiKey
    }
  });

  const result = res.data.results[0];
  if (!result || !result.geometry?.bounds) {
    throw new Error("ERROR: Could not find the city or its borders");
  }

  return result.geometry.bounds;
}

function generateGrid(northeast: LatLng, southwest: LatLng, steps = 5): LatLng[] {
  const latStep = (northeast.lat - southwest.lat) / steps;
  const lngStep = (northeast.lng - southwest.lng) / steps;

  const grid: LatLng[] = [];

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      grid.push({
        lat: southwest.lat + latStep * i,
        lng: southwest.lng + lngStep * j
      });
    }
  }

  return grid;
}

async function searchPlaces(location: LatLng, radius = 2000, pagetoken = ""): Promise<Place[]> {
  const params: any = {
    location: `${location.lat},${location.lng}`,
    radius,
    key: apiKey,
    keyword: "store OR construction OR hardware OR building",
    type: "store"
  };

  if (pagetoken) params.pagetoken = pagetoken;

  const res = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", { params });

  const filtered = res.data.results.filter((place: any) => {
    const types = place.types || [];
    return !types.some((type: string) => excludedTypes.includes(type));
  });

  const places = filtered.map((place: any) => ({
    name: place.name,
    place_id: place.place_id
  }));

  if (res.data.next_page_token) {
    await new Promise((r) => setTimeout(r, 2000));
    const more = await searchPlaces(location, radius, res.data.next_page_token);
    return [...places, ...more];
  }

  return places;
}

async function getPlaceDetails(placeId: string): Promise<string | null> {
  try {
    const res = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
      params: {
        place_id: placeId,
        key: apiKey,
        fields: "website"
      }
    });

    return res.data.result.website || null;
  } catch {
    return null;
  }
}

(async () => {
  try {
    console.log(`🔎 City geocoding: ${city}`);
    const { northeast, southwest } = await geocodeCity(city);

    console.log("🧭 Generating a coordinate grid...");
    const gridPoints = generateGrid(northeast, southwest, 6); // can be increased to 8–10 for a denser mesh

    const allPlaces = new Map<string, Place>();

    console.log(`📡 Start search у ${gridPoints.length} at points...`);

    for (let i = 0; i < gridPoints.length; i++) {
      const point = gridPoints[i];
      console.log(`📍 Search (${i + 1}/${gridPoints.length}) in points: ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
      const places = await searchPlaces(point);

      for (const place of places) {
        if (!allPlaces.has(place.place_id)) {
          allPlaces.set(place.place_id, place);
        }
      }
    }

    console.log(`🔍 Unique places found: ${allPlaces.size}`);

    const placeList = Array.from(allPlaces.values());

    for (let i = 0; i < placeList.length; i++) {
      const place = placeList[i];
      const website = await getPlaceDetails(place.place_id);
      if (website) {
        console.log(website);
      }
    }

    console.log("Search complete");
  } catch (err: any) {
    console.error("ERROR: ", err.message);
  }
})();