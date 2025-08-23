import * as dotenv from "dotenv";
dotenv.config();

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

// All places types provided here: https://developers.google.com/maps/documentation/places/web-service/place-types