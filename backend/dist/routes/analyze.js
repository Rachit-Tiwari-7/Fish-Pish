"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const safeBrowsing_1 = require("../services/safeBrowsing");
const ssl_1 = require("../services/ssl");
const llm_1 = require("../services/llm");
const scoring_1 = require("../scoring/scoring");
const cache_1 = require("../utils/cache");
const router = (0, express_1.Router)();
// --- Fast Technical Analysis ---
router.post('/fast', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url)
            return res.status(400).json({ error: 'URL is required' });
        const cached = await (0, cache_1.getCachedResult)(url);
        if (cached)
            return res.json(cached);
        const [safeBrowsing, ssl] = await Promise.all([
            (0, safeBrowsing_1.checkSafeBrowsing)(url),
            (0, ssl_1.checkSSL)(url)
        ]);
        const result = (0, scoring_1.calculateScore)({ safeBrowsing, ssl });
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Fast analysis failed' });
    }
});
// --- Full AI-Enhanced Analysis ---
router.post('/', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        // Check cache
        const cached = await (0, cache_1.getCachedResult)(url);
        if (cached && !cached.details?.llm?.skipped) {
            return res.json(cached);
        }
        // 1. Run Technical Checks First (Fast)
        const [safeBrowsing, ssl] = await Promise.all([
            (0, safeBrowsing_1.checkSafeBrowsing)(url),
            (0, ssl_1.checkSSL)(url)
        ]);
        const technicalSignals = { safeBrowsing, ssl };
        // We pass technical signals to LLM so it can make a better decision
        const { linkText } = req.body;
        const llmResult = await (0, llm_1.analyzeWithGroq)(url, technicalSignals, linkText);
        // 3. Calculate Final Score
        const result = (0, scoring_1.calculateScore)(technicalSignals, llmResult);
        // Cache result (24h)
        await (0, cache_1.setCachedResult)(url, result);
        res.json(result);
    }
    catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
