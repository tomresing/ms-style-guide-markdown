import { checkForUpdates } from './update-check.js';
import { scrape } from './scrape.js';

const command = process.argv[2];
const force = process.argv.includes('--force');

try {
  if (command === 'scrape') console.log(JSON.stringify(await scrape()));
  else if (command === 'check-updates') console.log(JSON.stringify(await checkForUpdates({ force })));
  else {
    console.log('Usage: node src/cli.js <scrape|check-updates> [--force]');
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}