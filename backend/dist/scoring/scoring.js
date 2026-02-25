"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScore = calculateScore;
function calculateScore(signals, llmResult) {
    let score = 0;
    const { safeBrowsing, ssl } = signals;
    // 1. Google Safe Browsing (+80)
    if (safeBrowsing.matches)
        score += 80;
    // 2. SSL
    if (!ssl.secure)
        score += 20;
    if (ssl.isSelfSigned)
        score += 15;
    if (ssl.ageDays < 7)
        score += 10;
    // 5. LLM Analysis (Higher Priority & Weight)
    if (llmResult && !llmResult.skipped && !llmResult.error) {
        const aiRisk = llmResult.risk_score;
        const techScore = score;
        // AI now gets significantly more weight (70% weight) to prevent empty blacklists 
        // from drowning out high-confidence heuristic detections (like suspicious TLDs).
        if (techScore < 80) {
            score = (techScore * 0.3) + (aiRisk * 0.7);
            // If AI is confident (>75) and we have ANY technical suspicion (like SSL),
            // or if AI is extremely confident (>85), we grant it higher priority.
            if (aiRisk > 75 && (techScore >= 15 || aiRisk > 85)) {
                score = Math.max(score, aiRisk);
            }
        }
        else {
            // If technical signals are already blocking (80+), AI provides secondary verification.
            score = (techScore * 0.8) + (aiRisk * 0.2);
        }
    }
    // Normalize
    const probability = Math.min(Math.round(score), 100);
    // Determine signals summary
    let summary = llmResult?.reasoning || "Safe to visit.";
    let color = "green";
    if (probability > 75) {
        color = "red";
        if (!llmResult?.reasoning)
            summary = "High risk detected! Avoid this link.";
    }
    else if (probability > 40) {
        color = "yellow";
        if (!llmResult?.reasoning)
            summary = "Suspicious indicators found. Proceed with caution.";
    }
    return {
        phishing_probability: probability,
        confidence: llmResult && !llmResult.skipped ? 95 : 90,
        summary,
        color,
        signals: {
            safe_browsing: safeBrowsing.matches,
            safe_browsing_skipped: !!safeBrowsing.skipped,
            ssl_secure: ssl.secure,
            llm_analysis: llmResult ? true : false,
            llm_skipped: llmResult ? !!llmResult.skipped : true
        },
        details: {
            safe_browsing: safeBrowsing,
            ssl_analysis: ssl,
            llm: llmResult
        }
    };
}
