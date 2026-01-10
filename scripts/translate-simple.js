/**
 * Simple Translation Script using LibreTranslate (Free & No API Key Required)
 * 
 * This is an alternative to Google Cloud Translation API.
 * Uses the free LibreTranslate service.
 * 
 * Usage: node scripts/translate-simple.js
 * 
 * Note: This is slower than Google Translate but completely free and requires no setup.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NAMESPACES = ['common', 'dashboard', 'medical', 'yoga', 'health', 'pages'];
const SOURCE_LANG = 'en';
const TARGET_LANGS = ['mr', 'ta']; // Marathi and Tamil

// LibreTranslate API endpoint (free public instance)
const TRANSLATE_API = 'https://libretranslate.com/translate';

/**
 * Translate text using LibreTranslate API
 */
async function translateText(text, targetLang) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            q: text,
            source: SOURCE_LANG,
            target: targetLang,
            format: 'text'
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(TRANSLATE_API, options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve(result.translatedText || text);
                } catch (error) {
                    console.error('Parse error:', error);
                    resolve(text); // Return original on error
                }
            });
        });

        req.on('error', (error) => {
            console.error('Request error:', error);
            resolve(text); // Return original on error
        });

        req.write(data);
        req.end();
    });
}

/**
 * Add delay to avoid rate limiting
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Recursively translate an object
 */
async function translateObject(obj, targetLang, depth = 0) {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            // Translate string
            try {
                await delay(500); // Rate limiting
                const translation = await translateText(value, targetLang);
                result[key] = translation;
                console.log(`${'  '.repeat(depth)}✓ "${value.substring(0, 40)}..." → "${translation.substring(0, 40)}..."`);
            } catch (error) {
                console.error(`${'  '.repeat(depth)}✗ Error translating "${value}":`, error.message);
                result[key] = value;
            }
        } else if (Array.isArray(value)) {
            // Translate array
            result[key] = [];
            for (const item of value) {
                if (typeof item === 'string') {
                    try {
                        await delay(500);
                        const translation = await translateText(item, targetLang);
                        result[key].push(translation);
                    } catch (error) {
                        result[key].push(item);
                    }
                } else {
                    result[key].push(await translateObject(item, targetLang, depth + 1));
                }
            }
        } else if (typeof value === 'object' && value !== null) {
            // Recursively translate nested object
            result[key] = await translateObject(value, targetLang, depth + 1);
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
    const translatedContent = await translateObject(sourceContent, targetLang);

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
    console.log('🌐 MatriCare Translation Automation (LibreTranslate)');
    console.log('====================================================\n');
    console.log('⚠️  This uses a free public API and may be slow.');
    console.log('   For faster translation, use Google Cloud Translation API.\n');

    for (const targetLang of TARGET_LANGS) {
        const langName = targetLang === 'mr' ? 'Marathi' : 'Tamil';
        console.log(`\n🔄 Starting translation to ${targetLang.toUpperCase()} (${langName})...`);

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
