
import fs from 'fs';
import path from 'path';

const BASE_URL = "http://localhost:5000";
const LOCALES_DIR = "src/i18n/locales";
const TARGET_LANGS = ["hi", "mr", "ta"];

async function translateText(text, targetLang) {
    try {
        const response = await fetch(`${BASE_URL}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, target_lang: targetLang })
        });
        const data = await response.json();
        return data.translated_text;
    } catch (error) {
        console.error(`- Error translating to ${targetLang}:`, error.message);
        return null;
    }
}

async function processFile(filename) {
    console.log(`\nProcessing: ${filename}`);
    const enFilePath = path.join(LOCALES_DIR, 'en', filename);
    const enData = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));

    for (const lang of TARGET_LANGS) {
        const targetDirPath = path.join(LOCALES_DIR, lang);
        const targetFilePath = path.join(targetDirPath, filename);

        if (!fs.existsSync(targetDirPath)) fs.mkdirSync(targetDirPath, { recursive: true });

        let targetData = {};
        if (fs.existsSync(targetFilePath)) {
            targetData = JSON.parse(fs.readFileSync(targetFilePath, 'utf8'));
        }

        console.log(`- Language: ${lang}`);
        let updated = false;

        async function deepTranslate(source, target) {
            for (const key in source) {
                if (typeof source[key] === 'object' && source[key] !== null) {
                    if (!target[key]) target[key] = Array.isArray(source[key]) ? [] : {};
                    await deepTranslate(source[key], target[key]);
                } else if (!target[key]) {
                    console.log(`  * Translating new key: "${key}"`);
                    const translation = await translateText(source[key], lang);
                    if (translation) {
                        target[key] = translation;
                        updated = true;
                    }
                }
            }
        }

        await deepTranslate(enData, targetData);

        if (updated) {
            fs.writeFileSync(targetFilePath, JSON.stringify(targetData, null, 4), 'utf8');
            console.log(`  ✅ Updated ${lang}/${filename}`);
        } else {
            console.log(`  ○ ${lang}/${filename} is already up to date.`);
        }
    }
}

async function main() {
    console.log("🚀 STARTING TRANSLATION SYNC...");
    const files = fs.readdirSync(path.join(LOCALES_DIR, 'en')).filter(f => f.endsWith('.json'));

    for (const file of files) {
        await processFile(file);
    }

    console.log("\n✨ ALL LANGUAGES SYNCED.");
}

main();
