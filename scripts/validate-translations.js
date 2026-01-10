/**
 * Translation Validator
 * 
 * Checks that all language files have the same structure and keys.
 * Helps identify missing translations.
 * 
 * Usage: node scripts/validate-translations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NAMESPACES = ['common', 'dashboard', 'medical', 'yoga', 'health', 'pages'];
const LANGUAGES = ['en', 'hi', 'mr', 'ta'];
const BASE_LANG = 'en';

/**
 * Get all keys from a nested object
 */
function getAllKeys(obj, prefix = '') {
    const keys = [];

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            keys.push(...getAllKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }

    return keys;
}

/**
 * Validate a single namespace across all languages
 */
function validateNamespace(namespace) {
    console.log(`\n📄 Validating ${namespace}.json...`);

    const baseFilePath = path.join(__dirname, '..', 'src', 'i18n', 'locales', BASE_LANG, `${namespace}.json`);

    if (!fs.existsSync(baseFilePath)) {
        console.error(`❌ Base file not found: ${baseFilePath}`);
        return false;
    }

    const baseContent = JSON.parse(fs.readFileSync(baseFilePath, 'utf8'));
    const baseKeys = getAllKeys(baseContent).sort();

    console.log(`  Base language (${BASE_LANG}): ${baseKeys.length} keys`);

    let allValid = true;

    for (const lang of LANGUAGES) {
        if (lang === BASE_LANG) continue;

        const langFilePath = path.join(__dirname, '..', 'src', 'i18n', 'locales', lang, `${namespace}.json`);

        if (!fs.existsSync(langFilePath)) {
            console.warn(`  ⚠️  ${lang}: File not found`);
            allValid = false;
            continue;
        }

        const langContent = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
        const langKeys = getAllKeys(langContent).sort();

        // Find missing keys
        const missingKeys = baseKeys.filter(key => !langKeys.includes(key));
        const extraKeys = langKeys.filter(key => !baseKeys.includes(key));

        if (missingKeys.length === 0 && extraKeys.length === 0) {
            console.log(`  ✅ ${lang}: ${langKeys.length} keys (complete)`);
        } else {
            console.log(`  ⚠️  ${lang}: ${langKeys.length} keys`);

            if (missingKeys.length > 0) {
                console.log(`      Missing ${missingKeys.length} keys:`);
                missingKeys.slice(0, 5).forEach(key => console.log(`        - ${key}`));
                if (missingKeys.length > 5) {
                    console.log(`        ... and ${missingKeys.length - 5} more`);
                }
            }

            if (extraKeys.length > 0) {
                console.log(`      Extra ${extraKeys.length} keys:`);
                extraKeys.slice(0, 5).forEach(key => console.log(`        - ${key}`));
                if (extraKeys.length > 5) {
                    console.log(`        ... and ${extraKeys.length - 5} more`);
                }
            }

            allValid = false;
        }
    }

    return allValid;
}

/**
 * Main validation function
 */
function validateAll() {
    console.log('🔍 MatriCare Translation Validator');
    console.log('===================================\n');
    console.log(`Languages: ${LANGUAGES.join(', ')}`);
    console.log(`Namespaces: ${NAMESPACES.join(', ')}`);

    let allValid = true;

    for (const namespace of NAMESPACES) {
        const isValid = validateNamespace(namespace);
        if (!isValid) allValid = false;
    }

    console.log('\n' + '='.repeat(50));

    if (allValid) {
        console.log('✅ All translations are complete and valid!');
    } else {
        console.log('⚠️  Some translations are incomplete or have issues.');
        console.log('   Run the translation script to auto-generate missing content.');
    }

    return allValid;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const isValid = validateAll();
    process.exit(isValid ? 0 : 1);
}

export { validateAll, validateNamespace };
