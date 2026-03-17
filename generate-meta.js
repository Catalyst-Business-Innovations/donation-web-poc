const fs = require('fs');
const path = require('path');

// Define the meta data
const meta = {
  buildDate: Date.now()
};

// Output path: place it in the `src` folder so it's copied to `dist` during build
const outputPath = path.join(__dirname, 'src', 'meta.json');
const packageJsonPath = path.resolve(__dirname, 'package.json');

// Read and parse package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update buildDate
packageJson.buildDate = meta.buildDate;

// Write updated package.json back to file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

// Write the meta.json file
fs.writeFileSync(outputPath, JSON.stringify(meta, null, 2));

console.log(`✅ meta.json generated at ${outputPath}`);
