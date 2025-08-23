The system helps gather links to businesses listed on Google Maps within any city using a grid-based approach. By scanning multiple points across the city, the script collects a large number of business links. This way, you can quickly and efficiently find potential leads, clients, and new opportunities for your marketing campaigns.


Program uses `Google Places API` and `Google Geocoding API`.

**How to set up API:**
1. Create a project in Google Cloud Console.
2. Enable Places API and Geocoding API.
3. Create a .env file and insert your API key in the following format:
```GOOGLE_MAPS_API_KEY=<your_key>```

**How to run:** 

`npx ts-node run.ts "<city>"`.

Example:
```npx ts-node run.ts "Paris"```


This script generates a grid of coordinates within the city boundaries by dividing the area into equal segments based on the specified number of steps. Each point in the grid serves as a target for Nearby Search, enabling filtering by place types and controlling the search scope within the city. This approach ensures comprehensive coverage and bypass the limit of 60/point.

Documentation:
1. [Google Places API](https://developers.google.com/maps/documentation/places/web-service)
2. [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding)
3. [Nearby Search](https://developers.google.com/maps/documentation/places/web-service/nearby-search)
