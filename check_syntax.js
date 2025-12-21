
try {
    const fs = require('fs');
    const content = fs.readFileSync('src/translations/translations.js', 'utf8');
    // Using simple eval/Function to check syntax. Not perfect but catches basic errors.
    // However, since it uses export const, we might need to mock that.
    const mockContent = content.replace('export const translations', 'const translations');
    // Also remove any imports if they exist (none seen so far)
    new Function(mockContent);
    console.log("Syntax OK");
} catch (e) {
    console.error("Syntax Error:", e.message);
}
