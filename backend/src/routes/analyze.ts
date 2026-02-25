import { Router } from 'express';
import { checkSafeBrowsing } from '../services/safeBrowsing';
import { checkSSL } from '../services/ssl';
import { analyzeWithGroq } from '../services/llm';
import { calculateScore } from '../scoring/scoring';
import { getCachedResult, setCachedResult } from '../utils/cache';

const router = Router();

// --- Fast Technical Analysis ---
router.post('/fast', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const cached = await getCachedResult(url);
    if (cached) return res.json(cached);

    const [safeBrowsing, ssl] = await Promise.all([
      checkSafeBrowsing(url),
      checkSSL(url)
    ]);

    const result = calculateScore({ safeBrowsing, ssl });
    res.json(result);
  } catch (error) {
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
    const cached = await getCachedResult(url);
    if (cached && !cached.details?.llm?.skipped) {
      return res.json(cached);
    }

    // 1. Run Technical Checks First (Fast)
    const [safeBrowsing, ssl] = await Promise.all([
      checkSafeBrowsing(url),
      checkSSL(url)
    ]);

    const technicalSignals = { safeBrowsing, ssl };

    // We pass technical signals to LLM so it can make a better decision
    const { linkText } = req.body;
    const llmResult = await analyzeWithGroq(url, technicalSignals, linkText);

    // 3. Calculate Final Score
    const result = calculateScore(technicalSignals, llmResult);

    // Cache result (24h)
    await setCachedResult(url, result);

    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
