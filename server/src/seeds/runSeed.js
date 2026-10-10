import { db } from '../config/db.js';

async function runSeed() {
  console.log('Seeding ShopSmart AI enterprise catalog & vector knowledge...');
  await db.init();
  console.log('Enterprise mock data seeded successfully!');
  process.exit(0);
}

runSeed();
