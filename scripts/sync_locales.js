const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '../messages');
const enPath = path.join(messagesDir, 'en.json');
const locales = ['ar', 'de', 'es', 'fr', 'zh'];

if (!fs.existsSync(enPath)) {
  console.error("en.json not found!");
  process.exit(1);
}

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      if (target[key] === undefined) {
        target[key] = source[key];
      }
    }
  }
}

locales.forEach(locale => {
  const filePath = path.join(messagesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const localeData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    deepMerge(localeData, enData);
    fs.writeFileSync(filePath, JSON.stringify(localeData, null, 2));
    console.log(`Synced missing keys to ${locale}.json`);
  }
});
