import * as fs from 'fs';
import * as path from 'path';
import { Place } from "../interfaces/place";

export function writeToCsv(data: Place[], filename: string): void {
  const csvPath = path.join(process.cwd(), filename);
  const header = "PLACE NAME,PLACE WEBSITE\n";
  
  const rows = data.map(place => {
    const name = `"${place.name.replace(/"/g, '""')}"`;
    const website = place.website ? place.website : '';
    // const types = place.types?.join(' | ') || '';
    
    return `${name},${website}`;
  }).join('\n');

  fs.writeFileSync(csvPath, header + rows, 'utf-8');
  console.log(`✅ Search results have been saved to ${csvPath}`);
}