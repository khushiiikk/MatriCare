# MatriCare i18n System

## Overview

MatriCare now uses a professional internationalization (i18n) system powered by **react-i18next** with automatic translation support for missing content.

## Features

- ✅ **6 Organized Namespaces**: common, dashboard, medical, yoga, health, pages
- ✅ **4 Languages**: English, Hindi, Marathi (auto-translated), Tamil (auto-translated)
- ✅ **Automatic Translation**: Google Cloud Translation API or free LibreTranslate
- ✅ **Language Detection**: Automatically detects user's preferred language
- ✅ **Fallback Support**: Falls back to English if translation missing
- ✅ **Validation Tools**: Check for missing translations

## File Structure

```
src/i18n/
├── index.js                 # i18n configuration
└── locales/
    ├── en/                  # English (complete)
    │   ├── common.json
    │   ├── dashboard.json
    │   ├── medical.json
    │   ├── yoga.json
    │   ├── health.json
    │   └── pages.json
    ├── hi/                  # Hindi (complete)
    │   └── ...
    ├── mr/                  # Marathi (auto-translate)
    │   └── ...
    └── ta/                  # Tamil (auto-translate)
        └── ...
```

## Usage in Components

### Old Way (deprecated)
```javascript
import { useLanguage } from '../context/LanguageContext';
const { language } = useLanguage();
const t = translations[language];
<h1>{t.navbar.home}</h1>
```

### New Way
```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common'); // Specify namespace
  
  return <h1>{t('navbar.home')}</h1>;
}
```

### Multiple Namespaces
```javascript
const { t } = useTranslation(['common', 'dashboard']);

<h1>{t('common:navbar.home')}</h1>
<p>{t('dashboard:greeting')}</p>
```

### With Interpolation
```javascript
// Translation: "Hello {{name}}"
<p>{t('dashboard:greeting', { name: userName })}</p>
```

## Translation Scripts

### Option 1: Free LibreTranslate (No Setup Required)
```bash
cd scripts
npm install
node translate-simple.js
```

**Pros**: Free, no API key needed  
**Cons**: Slower, less accurate

### Option 2: Google Cloud Translation API (Recommended)
```bash
# 1. Set up Google Cloud (see setup guide below)
# 2. Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="path/to/credentials.json"

# 3. Run translation
cd scripts
npm install
node translate.js
```

**Pros**: Fast, highly accurate, free tier (500k chars/month)  
**Cons**: Requires Google Cloud account

### Validate Translations
```bash
cd scripts
node validate-translations.js
```

## Google Cloud Setup (5 minutes)

1. **Create Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project: "MatriCare-Translations"

2. **Enable API**
   - Navigate to "APIs & Services" → "Library"
   - Search "Cloud Translation API"
   - Click "Enable"

3. **Create Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Download JSON key file

4. **Set Environment Variable**
   ```bash
   # Windows PowerShell
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\credentials.json"
   
   # Linux/Mac
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
   ```

## Language Switching

The app automatically detects the user's language from:
1. localStorage (`i18nextLng`)
2. Browser language settings

To change language programmatically:
```javascript
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <button onClick={() => i18n.changeLanguage('hi')}>
      हिंदी
    </button>
  );
}
```

## Adding New Translations

1. **Add to English file** (e.g., `en/common.json`):
   ```json
   {
     "newFeature": {
       "title": "New Feature",
       "description": "This is a new feature"
     }
   }
   ```

2. **Run translation script**:
   ```bash
   node scripts/translate-simple.js
   ```

3. **Use in component**:
   ```javascript
   const { t } = useTranslation('common');
   <h1>{t('newFeature.title')}</h1>
   ```

## Medical Terminology Review

⚠️ **Important**: Auto-translated medical terms should be reviewed by native speakers for accuracy.

Files to review:
- `mr/medical.json` - Marathi medical terms
- `ta/medical.json` - Tamil medical terms

## Troubleshooting

### Translations not loading
- Check browser console for errors
- Verify JSON files are valid (no syntax errors)
- Clear localStorage: `localStorage.removeItem('i18nextLng')`

### Missing translations
- Run validation: `node scripts/validate-translations.js`
- Check namespace is imported in `i18n/index.js`

### Language not switching
- Check `LanguageContext` is still providing language state
- Verify `i18n.changeLanguage()` is being called

## Migration Status

- [x] Create i18n folder structure
- [x] Split translations into namespaces
- [x] Set up i18next configuration
- [x] Create translation automation scripts
- [x] Create validation script
- [ ] Update all components to use `useTranslation`
- [ ] Remove old translation files
- [ ] Test all pages in all languages

## Next Steps

1. Run translation script to generate Marathi and Tamil files
2. Update components to use new i18n system
3. Test language switching
4. Review medical terminology with native speakers
