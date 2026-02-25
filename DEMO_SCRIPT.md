# 🏆 The Winning Demo Script (3 Minutes)

**Role:** You are not a student. You are a Security Architect pitching to a CISO (the Judge).
**Goal:** Prove "Websites are dead; Browser Layers are the future."

---

## 0:00 - The Hook (30s)
*Show the `LinkDetective` Dashboard running at `http://localhost:3000`.*

**You:** "Judges, phishing isn't a 'link' problem anymore. It's a context problem. A link to `drive.google.com` is safe... until the email says 'URGENT WIRE TRANSFER'. Passive URL checkers fail here."

**You:** "We built **Sentinel**. It’s not a website you visit. It’s an intelligent security layer that lives in your browser, watching over you like a bodyguard."

*(Point to the 'System Vitals' on the dashboard ticking away)*

---

## 0:30 - The Live Fire (90s)
*Click on the **"Financial Fraud"** card in the dashboard.*

**You:** "Let's simulate a real attack. This is a clone of a Bank of America phishing page. It looks perfect. The SSL is valid. The branding is exact."

*(Hover over the 'Sign In' button)*

**You:** "Watch closely. Most tools would let me click this because the domain isn't on a blacklist yet. Sentinel works differently."

*(Click the link. **BOOM.** The screen goes dark with the Red Terminal Overlay.)*

**You:** "Sentinel INTERCEPTED the request before it left the browser. It didn't just check a database. It read the page."

---

## 2:00 - The "Why" (Explainability) (60s)
*Point to the specific reasons on the overlay.*

**You:** "Look at the analysis:"
1.  **URGENCY DETECTED**: It saw 'Suspended Account' text.
2.  **VISUAL DOPPELGANGER**: It recognized the Bank of America favicon but saw the URL was `bit.ly`.
3.  **AI VERDICT**: Our local LLM analyzed the semantic intent and flagged it as 'High Risk Credential Harvesting'."

**You:** "We don't just block; we explain. And we do it locally, preserving privacy."

## 2:50 - The Close
**You:** "Existing tools are reactive. Sentinel is proactive. We are ready to ship this as a browser standard. Thank you."

---

## 🛠️ Setup for Demo
1.  **Backend:** Ensure `uvicorn` is running on port 8000.
2.  **Frontend:** Ensure `npm run dev` is running on port 3000.
3.  **Extension:** Ensure it's loaded in Chrome (`chrome://extensions` -> Load Unpacked -> `extension` folder).
4.  **Open:** `http://localhost:3000` and keep it full screen.
