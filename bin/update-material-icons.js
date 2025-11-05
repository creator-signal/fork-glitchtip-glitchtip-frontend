const fs = require("fs");
const path = require("path");
const https = require("https");

// --- Configuration ---
const STORYBOOK_FILE = "./src/app/shared/typography.stories.ts";
const OUTPUT_FILE = "./src/assets/fonts/material-symbols.woff2";
const FONT_FAMILY =
  "Material Symbols Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
// ---------------------

function extractIconNames(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/const iconNames = \[([\s\S]*?)\];/);

  if (!match) {
    throw new Error("Could not find iconNames array");
  }

  return match[1].match(/"([^"]+)"/g).map((icon) => icon.replace(/"/g, ""));
}

function buildFontUrl(iconNames) {
  const params = new URLSearchParams({
    family: FONT_FAMILY,
    icon_names: iconNames.sort().join(","),
  });
  return `https://fonts.googleapis.com/css2?${params.toString()}`;
}

function fetchFontUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          // Look for any URL in format('truetype') or format('woff2')
          const match = data.match(/url\((https:\/\/[^)]+)\)\s*format\(/);

          if (!match) {
            reject(new Error("Could not find font URL in CSS"));
            return;
          }

          resolve(match[1]);
        });
      })
      .on("error", reject);
  });
}

function downloadFont(url, outputPath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed: ${res.statusCode}`));
          return;
        }

        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const fileStream = fs.createWriteStream(outputPath);
        res.pipe(fileStream);
        fileStream.on("finish", () => {
          fileStream.close();
          resolve();
        });
        fileStream.on("error", reject);
      })
      .on("error", reject);
  });
}

async function updateMaterialIcons() {
  try {
    console.log("📖 Reading icon names...");
    const iconNames = extractIconNames(STORYBOOK_FILE);
    console.log(`✅ Found ${iconNames.length} icons\n`);

    const cssUrl = buildFontUrl(iconNames);
    const fontUrl = await fetchFontUrl(cssUrl);

    console.log("⬇️  Downloading font...");
    await downloadFont(fontUrl, OUTPUT_FILE);

    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`✅ ${OUTPUT_FILE} (${(stats.size / 1024).toFixed(2)} KB)\n`);
  } catch (error) {
    console.error("❌", error.message);
    process.exit(1);
  }
}

updateMaterialIcons();
