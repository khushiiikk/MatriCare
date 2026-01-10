/**
 * Google Cloud Translation API Script
 * 
 * This script automatically translates missing Marathi (mr) and Tamil (ta) content
 * using Google Cloud Translation API.
 * 
 * Setup Instructions:
 * 1. Create a Google Cloud account at https://console.cloud.google.com
 * 2. Enable Cloud Translation API
 * 3. Create an API key (APIs & Services → Credentials)
 * 4. Add API key to .env file: VITE_GOOGLE_TRANSLATE_API_KEY=your_key_here
 * 5. Run: node scripts/translate.js
 * 
 * Note: Free tier includes 500,000 characters/month
 */

import { Translate } from '@google-cloud/translate/build/src/v2/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google Translate (uses GOOGLE_APPLICATION_CREDENTIALS env variable)
// For API key auth, use: new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });
const translate = new Translate();

const NAMESPACES = ['common', 'dashboard', 'medical', 'yoga', 'health', 'pages'];
const SOURCE_LANG = 'en';
const TARGET_LANGS = ['mr', 'ta']; // Marathi and Tamil

const LANG_CODES = {
    mr: 'mr', // Marathi
    ta: 'ta'  // Tamil
};

/**
 * Recursively translate an object
 */
async function translateObject(obj, targetLang) {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            // Translate string
            try {
                const [translation] = await translate.translate(value, targetLang);
                result[key] = translation;
                console.log(`  ✓ Translated: "${value}" → "${translation}"`);
            } catch (error) {
                console.error(`  ✗ Error translating "${value}":`, error.message);
                result[key] = value; // Keep original on error
            }
        } else if (Array.isArray(value)) {
            // Translate array of strings
            result[key] = [];
            for (const item of value) {
                if (typeof item === 'string') {
                    try {
                        const [translation] = await translate.translate(item, targetLang);
                        result[key].push(translation);
                    } catch (error) {
                        console.error(`  ✗ Error translating array item "${item}":`, error.message);
                        result[key].push(item);
                    }
                } else {
                    result[key].push(await translateObject(item, targetLang));
                }
            }
        } else if (typeof value === 'object' && value !== null) {
            // Recursively translate nested object
            result[key] = await translateObject(value, targetLang);
        } else {
            result[key] = value;
        }
    }

    return result;
}

/**
 * Translate a single namespace file
 */
async function translateNamespace(namespace, targetLang) {
    const sourcePath = path.join(__dirname, '..', 'src', 'i18n', 'locales', SOURCE_LANG, `${namespace}.json`);
    const targetPath = path.join(__dirname, '..', 'src', 'i18n', 'locales', targetLang, `${namespace}.json`);

    console.log(`\n📝 Translating ${namespace}.json to ${targetLang.toUpperCase()}...`);

    // Read source file
    const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

    // Translate
    const translatedContent = await translateObject(sourceContent, LANG_CODES[targetLang]);

    // Ensure target directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // Write translated file
    fs.writeFileSync(targetPath, JSON.stringify(translatedContent, null, 2), 'utf8');
    console.log(`✅ Saved: ${targetPath}`);
}

/**
 * Main translation function
 */
async function translateAll() {
    console.log('🌐 MatriCare Translation Automation');
    console.log('====================================\n');

    for (const targetLang of TARGET_LANGS) {
        console.log(`\n🔄 Starting translation to ${targetLang.toUpperCase()} (${targetLang === 'mr' ? 'Marathi' : 'Tamil'})...`);

        for (const namespace of NAMESPACES) {
            try {
                await translateNamespace(namespace, targetLang);
            } catch (error) {
                console.error(`❌ Error translating ${namespace} to ${targetLang}:`, error.message);
            }
        }
    }

    console.log('\n\n✨ Translation complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Review medical terminology in translated files');
    console.log('2. Update i18n/index.js to import Marathi and Tamil translations');
    console.log('3. Test language switching in the app');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    translateAll().catch(console.error);
}

export { translateAll, translateNamespace };
