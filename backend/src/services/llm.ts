import Groq from "groq-sdk";

export async function analyzeWithGroq(url: string, signals: any, linkText: string = "") {
  const API_KEY = process.env.GROQ_API_KEY;
  if (!API_KEY) {
    return {
      risk_score: 0,
      reasoning: "LLM analysis skipped (No API Key)",
      skipped: true
    };
  }

  const groq = new Groq({ apiKey: API_KEY });

  const systemPrompt = `You are an elite Cybersecurity Intelligence Analyst specializing in phishing forensics.
  Your goal is to evaluate a URL for malicious intent by analyzing its anatomy, path behavior, and technical signals.

  --- ANALYSIS PROTOCOL ---
  1. URL ANATOMY: Typosquatting, Homographs, Subdomain abuse, and Risky TLDs (.zip, .mov, .icu, etc.).
  2. PATH BEHAVIOR: Social engineering keywords in path (login, verify, secure, account).
  3. SIGNAL INTEGRATION: SSL status, Safe Browsing lookup results.

  --- OUTPUT REQUIREMENTS ---
  Return a strict JSON object with:
  - "risk_score": (0-100) 0=Legitimate, 40=Suspicious, 75=Danger, 90+=Confirmed Malicious.
  - "reasoning": Sharp, professional verdict (10-15 words).

  Only return JSON. No prose.`;

  const userPrompt = `Analyze this potential phishing link:
  Actual URL: ${url}
  Technical Signals: ${JSON.stringify(signals)}
  (Link text displayed to user: "${linkText}")
  
  Provide your verdict.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from Groq");

    const result = JSON.parse(content);
    return {
      risk_score: result.risk_score || 0,
      reasoning: result.reasoning || "Analysis incomplete.",
      skipped: false
    };
  } catch (error) {
    console.error("Groq Analysis Failed:", error);
    return {
      risk_score: 50,
      reasoning: "AI analysis unavailable.",
      skipped: false,
      error: true
    };
  }
}
