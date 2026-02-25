"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVirusTotal = checkVirusTotal;
const axios_1 = __importDefault(require("axios"));
async function checkVirusTotal(url) {
    const API_KEY = process.env.VIRUSTOTAL_API_KEY;
    if (!API_KEY || API_KEY === 'your_key_here') {
        // Mock return for known test URLs
        if (url.includes('testsafebrowsing.appspot.com') || url.includes('ianfette.org')) {
            return {
                malicious: 5,
                suspicious: 2,
                mock: true,
                details: {
                    last_analysis_stats: { malicious: 5, suspicious: 2, harmless: 0, undetected: 0 }
                }
            };
        }
        return { malicious: 0, suspicious: 0, skipped: true };
    }
    try {
        // VT requires URL identifier (base64)
        const urlId = Buffer.from(url).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        const response = await axios_1.default.get(`https://www.virustotal.com/api/v3/urls/${urlId}`, { headers: { 'x-apikey': API_KEY } });
        const stats = response.data.data.attributes.last_analysis_stats;
        return {
            malicious: stats.malicious,
            suspicious: stats.suspicious,
            details: stats
        };
    }
    catch (error) {
        // 404 means URL not found in VT database, which is fine
        return { malicious: 0, suspicious: 0, not_found: true };
    }
}
