# Translation & Dark Mode Fix Plan

## Issues Found:

### 1. Missing Translations

#### Marathi (mr) - Missing:
- ✗ Login page (all fields in English)
- ✗ Analytics page (all fields in English)  
- ✗ FindCare page (all fields in English)
- ✗ Chatbot responses (in English)
- ✗ CTA section
- ✗ Trimester pages content

#### Tamil (ta) - Missing:
- ✗ Login page (all fields in English)
- ✗ Analytics page (all fields in English)
- ✗ FindCare page (all fields in English)
- ✗ Chatbot responses (in English)

### 2. Dark Mode Issues
- Dark mode CSS is defined but not applying to all page elements
- Need to add dark mode styles to:
  - Analytics page
  - FindCare page
  - Login page
  - Settings page

## Fix Strategy:

1. Add complete Marathi translations for Login, Analytics, FindCare, Chatbot
2. Add complete Tamil translations for Login, Analytics, FindCare, Chatbot
3. Enhance dark mode CSS coverage for all pages
4. Test and verify

## Files to Modify:
1. `src/translations/translations.js` - Add missing translations
2. `src/pages/Analytics.css` - Add dark mode styles
3. `src/pages/FindCare.css` - Add dark mode styles
4. `src/pages/Login.css` - Enhance dark mode styles
5. `src/pages/Settings.css` - Add dark mode styles
