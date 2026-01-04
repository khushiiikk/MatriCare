/**
 * Utility functions for Pregnancy Risk Analysis
 * Ported from Python model logic
 */

/**
 * Extracts HCG value from text using regex
 * @param {string} text 
 * @returns {number|null}
 */
export const extractHcgValue = (text) => {
    const match = text.match(/(\d+\.?\d*)\s*mIU\/mL/i);
    if (match) {
        return parseFloat(match[1]);
    }
    return null;
};

/**
 * Detects clinical warning terms in the text
 * @param {string} text 
 * @returns {string[]}
 */
export const detectClinicalWarnings = (text) => {
    const lowerText = text.toLowerCase();
    const warningKeywords = [
        "ectopic",
        "abnormal",
        "slow",
        "trophoblastic",
        "molar pregnancy",
        "spontaneous abortion",
        "false negative"
    ];

    return warningKeywords.filter(keyword => lowerText.includes(keyword));
};

/**
 * Calculates risk score based on HCG value and warnings
 * @param {number|null} hcgValue 
 * @param {string[]} warnings 
 * @returns {{score: number, level: string, reasons: string[]}}
 */
export const calculateRiskScore = (hcgValue, warnings) => {
    let score = 0;
    let reasons = [];

    // ---- HCG-based scoring ----
    if (hcgValue === null) {
        score += 4;
        reasons.push("HCG value not detected");
    } else if (hcgValue < 5) {
        score += 4;
        reasons.push("HCG below pregnancy threshold");
    } else if (hcgValue >= 5 && hcgValue <= 25) {
        score += 2;
        reasons.push("Very early or borderline pregnancy");
    } else if (hcgValue > 25 && hcgValue <= 100) {
        score += 1;
        reasons.push("Early pregnancy range");
    } else if (hcgValue > 100000) {
        score += 3;
        reasons.push("Extremely high HCG level");
    }

    // ---- Warning-based scoring ----
    if (warnings.length > 0) {
        score += 3;
        reasons.push("Clinical warning terms detected");
    }

    // ---- Risk level mapping ----
    let riskLevel = "Low";
    if (score <= 2) {
        riskLevel = "Low";
    } else if (score <= 5) {
        riskLevel = "Medium";
    } else {
        riskLevel = "High";
    }

    return { score, level: riskLevel, reasons };
};

/**
 * Generates explanation for the results
 * @param {number|null} hcgValue 
 * @param {string} riskLevel 
 * @param {string[]} reasons 
 * @returns {string[]}
 */
export const explainResult = (hcgValue, riskLevel, reasons) => {
    const explanation = [];

    // Explain HCG
    if (hcgValue !== null) {
        explanation.push(`Your Beta-HCG level is ${hcgValue} mIU/mL, which helps assess early pregnancy status.`);
    } else {
        explanation.push("Beta-HCG value could not be reliably extracted from the report.");
    }

    // Explain risk level
    if (riskLevel === "Low") {
        explanation.push("This result falls under a LOW RISK category, meaning the value is within expected limits.");
    } else if (riskLevel === "Medium") {
        explanation.push("This result falls under a MEDIUM RISK category. This does not indicate a problem, but follow-up testing and medical consultation are recommended.");
    } else {
        explanation.push("This result falls under a HIGH RISK category. Immediate medical consultation is advised.");
    }

    explanation.push(...reasons.map(reason => `• ${reason}`));

    return explanation;
};

/**
 * Generates advice based on risk level
 * @param {string} riskLevel 
 * @returns {string[]}
 */
export const generateAdvice = (riskLevel) => {
    if (riskLevel === "Low") {
        return [
            "Pregnancy indicators appear within expected limits.",
            "Continue routine antenatal care.",
            "Consult a healthcare professional for confirmation and follow-up."
        ];
    }

    if (riskLevel === "Medium") {
        return [
            "Repeat the Beta-HCG test after 48 hours to assess progression.",
            "Monitor for symptoms such as pain or bleeding.",
            "Consult a doctor for clinical correlation."
        ];
    }

    if (riskLevel === "High") {
        return [
            "Immediate medical consultation is strongly recommended.",
            "Further diagnostic tests may be required.",
            "Do not delay professional evaluation."
        ];
    }

    return ["Unable to generate advice due to unknown risk level."];
};
