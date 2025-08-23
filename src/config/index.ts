import * as dotenv from "dotenv";
dotenv.config();

export const apiKey: string = process.env.GOOGLE_MAPS_API_KEY!;
export const city: string = process.argv[2];

export const excludedTypes: string[] = [
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
  "night_club",
];