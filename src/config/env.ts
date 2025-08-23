import * as dotenv from "dotenv";
dotenv.config();

export const apiKey: string = process.env.GOOGLE_MAPS_API_KEY!;
export const city: string = process.argv[2];