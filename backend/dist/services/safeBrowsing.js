"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSafeBrowsing = checkSafeBrowsing;
const axios_1 = __importDefault(require("axios"));
// Known test phishing URLs to trigger detection without keys
const TEST_PHISHING_URLS = [
    'http://testsafebrowsing.appspot.com/',
    'http://testsafebrowsing.appspot.com/s/phishing.html',
    'http://testsafebrowsing.appspot.com/s/malware.html',
    'https://testsafebrowsing.appspot.com/s/phishing.html',
    'http://ianfette.org',
    'http://www.ianfette.org',
    'http://malware.testing.google.test/testing/malware/',
];
async function checkSafeBrowsing(url) {
    const API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    // Mock detection for test URLs if key is missing or invalid
    if (!API_KEY || API_KEY === 'your_key_here') {
        if (TEST_PHISHING_URLS.some(testUrl => url.includes(testUrl))) {
            return {
                matches: true,
                mock: true,
                details: {
                    threatType: "SOCIAL_ENGINEERING",
                    platformType: "ANY_PLATFORM"
                }
            };
        }
        return { matches: false, skipped: true };
    }
    try {
        const response = await axios_1.default.get(`https://safebrowsing.googleapis.com/v5/urls:search`, {
            params: {
                key: API_KEY,
                urls: url
            }
        });
        // GSB v5 returns { matches: [{ threatType, platformType }] } or empty if clean
        const hasMatches = response.data.matches && response.data.matches.length > 0;
        return {
            matches: hasMatches,
            details: response.data
        };
    }
    catch (error) {
        console.error('GSB v5 Error:', error.response?.data || error.message);
        return { matches: false, error: true };
    }
}
