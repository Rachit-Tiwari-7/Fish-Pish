// ─────────────────────────────────────────────
//  Fish-Pish · Content Script (v5)
// ─────────────────────────────────────────────

// ── State ──────────────────────────────────────
let hoverTimer: ReturnType<typeof setTimeout> | null = null;
let expandTimer: ReturnType<typeof setTimeout> | null = null;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;
let currentPopup: HTMLElement | null = null;
let currentUrl: string | null = null;
let analysisData: any = null;
let analysisReady = false;

// ── Constants ──────────────────────────────────
const HOVER_DEBOUNCE = 600;
const EXPAND_DELAY = 1200;
const DISMISS_DELAY = 3000;

const TRUSTED_DOMAINS = [
  'google.com', 'youtube.com', 'wikipedia.org', 'github.com', 'stackoverflow.com',
  'reddit.com', 'twitter.com', 'x.com', 'linkedin.com', 'facebook.com',
  'microsoft.com', 'apple.com', 'amazon.com', 'netflix.com', 'paypal.com'
];

// ── Inject CSS ─────────────────────────────────
function injectStyles() {
  if (document.getElementById('fp-styles')) return;
  const s = document.createElement('style');
  s.id = 'fp-styles';
  s.textContent = `
    @keyframes fp-spin { to { transform: rotate(360deg); } }
    @keyframes fp-fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fp-fade-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-4px); } }
    @keyframes fp-pop-in { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    #fp-popup-container {
      position: absolute;
      z-index: 2147483647;
      pointer-events: auto;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      display: flex; flex-direction: column; align-items: flex-start;
    }
    #fp-popup-container * { box-sizing: border-box; }

    #fp-dot {
      width: 22px; height: 22px;
      border-radius: 50%;
      background: rgba(120,120,140,0.85);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      animation: fp-pop-in 0.25s cubic-bezier(0.175,0.885,0.32,1.275) both;
      transition: background 0.3s, box-shadow 0.3s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    #fp-dot.safe   { background: linear-gradient(135deg,#11998e,#38ef7d); box-shadow: 0 0 0 3px rgba(56,239,125,0.2); }
    #fp-dot.warn   { background: linear-gradient(135deg,#f7971e,#ffd200); box-shadow: 0 0 0 3px rgba(255,210,0,0.2); }
    #fp-dot.danger { background: linear-gradient(135deg,#c0392b,#e74c3c); box-shadow: 0 0 0 3px rgba(231,76,60,0.2); }

    #fp-spinner {
      width: 11px; height: 11px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
      border-radius: 50%; animation: fp-spin 0.7s linear infinite;
    }

    #fp-tooltip {
      margin-top: 6px;
      background: rgba(20,20,35,0.92); backdrop-filter: blur(8px);
      padding: 4px 10px; border-radius: 6px;
      color: #fff; font-size: 10.5px; font-weight: 600; white-space: nowrap;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      animation: fp-fade-in 0.25s ease both;
    }

    #fp-detail-panel {
      margin-top: 8px;
      width: 290px;
      background: rgba(15,15,25,0.96);
      backdrop-filter: blur(16px);
      border-radius: 14px;
      padding: 16px;
      border-left: 5px solid transparent;
      box-shadow: 0 12px 40px rgba(0,0,0,0.45);
      animation: fp-fade-in 0.35s ease both;
      color: #e8e8f0;
      position: relative;
    }
    #fp-detail-panel.border-safe   { border-left-color: #38ef7d; }
    #fp-detail-panel.border-warn   { border-left-color: #ffd200; }
    #fp-detail-panel.border-danger { border-left-color: #e74c3c; }

    #fp-close-btn {
      position: absolute; top: 12px; right: 12px;
      width: 22px; height: 22px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #6a6a8a; font-size: 16px; font-weight: 600;
      border-radius: 50%; background: rgba(255,255,255,0.06);
      transition: all 0.2s; z-index: 10;
    }
    #fp-close-btn:hover { color: #fff; background: rgba(255,255,255,0.12); transform: scale(1.1); }

    .fp-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-right: 30px; }
    .fp-brand { font-size: 13px; font-weight: 700; color: #fff; }
    .fp-risk-badge { margin-left: auto; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
    .fp-risk-badge.safe   { background: rgba(56,239,125,0.15); color: #38ef7d; }
    .fp-risk-badge.danger { background: rgba(231,76,60,0.18);  color: #e74c3c; }
    .fp-risk-badge.warn   { background: rgba(255,210,0,0.15);  color: #ffd200; }

    .fp-info-block { border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; font-size: 11px; line-height: 1.5; }
    .fp-info-label { font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; display: block; }

    .fp-signals { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .fp-signal-item { background: rgba(255,255,255,0.04); border-radius: 8px; padding: 7px 8px; font-size: 10.5px; color: #9999b8; }
    .fp-sig-label { font-weight: 600; color: #c8c8e0; display: block; margin-bottom: 2px; }
  `;
  document.head.appendChild(s);
}

// ── Mouse Handlers ─────────────────────────────
document.addEventListener('mouseover', (e: MouseEvent) => {
  const anchor = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
  if (!anchor || !anchor.href) return;
  clearTimer(hoverTimer);
  hoverTimer = setTimeout(() => spawn(anchor), HOVER_DEBOUNCE);
});

document.addEventListener('mouseout', (e: MouseEvent) => {
  const anchor = (e.target as HTMLElement).closest('a');
  if (!anchor) return;
  clearTimer(hoverTimer); clearTimer(expandTimer);
  if (currentPopup && !currentPopup.dataset.panelOpen) startDismissTimer();
});

function spawn(anchor: HTMLAnchorElement) {
  if (currentUrl === anchor.href && currentPopup) return;
  teardown(); injectStyles();
  currentUrl = anchor.href;

  const rect = anchor.getBoundingClientRect();
  const container = document.createElement('div');
  container.id = 'fp-popup-container';
  container.style.top = `${rect.bottom + window.scrollY + 6}px`;
  container.style.left = `${rect.left + window.scrollX}px`;

  const dot = document.createElement('div');
  dot.id = 'fp-dot';
  dot.innerHTML = '<div id="fp-spinner"></div>';
  container.appendChild(dot);
  document.body.appendChild(container);
  currentPopup = container;

  // Auto-dismiss logic
  container.addEventListener('mouseenter', () => { clearTimer(dismissTimer); container.dataset.hovered = 'true'; });
  container.addEventListener('mouseleave', () => { delete container.dataset.hovered; startDismissTimer(); });

  dot.addEventListener('click', () => {
    if (!analysisReady) return;
    const existing = document.getElementById('fp-detail-panel');
    if (existing) closePanel(); else openPanel();
  });

  fetchProgressive(anchor.href, anchor.textContent || "");
  scheduleTooltip();
}

async function fetchProgressive(url: string, linkText: string) {
  // Stage 1: Fast
  try {
    const fast = await chrome.runtime.sendMessage({ type: 'ANALYZE_URL', url, linkText, fast: true });
    if (fast.success) {
      analysisData = fast.data;

      // Prevent "Green Flash": Only turn green in Stage 1 if it's a known trusted domain.
      // Otherwise, keep it neutral until full AI analysis results are in.
      const domain = new URL(url).hostname.toLowerCase();
      const isTrusted = TRUSTED_DOMAINS.some(d => domain.includes(d));

      if (fast.data.color !== 'green' || isTrusted) {
        updateDot(fast.data.color);
      }
    }
  } catch (e) { }

  // Stage 2: Full (LLM)
  try {
    const full = await chrome.runtime.sendMessage({ type: 'ANALYZE_URL', url, linkText, fast: false });
    if (full.success) {
      analysisData = full.data;
      analysisReady = true;
      updateDot(full.data.color);
      const tip = document.getElementById('fp-tooltip');
      if (tip) tip.textContent = "Analysis Ready · Click Dot";
    }
  } catch (e) { }
}

function updateDot(color: string) {
  const dot = document.getElementById('fp-dot');
  if (!dot) return;
  const spinner = document.getElementById('fp-spinner'); if (spinner) spinner.remove();
  dot.classList.remove('safe', 'warn', 'danger');
  dot.classList.add(color === 'red' ? 'danger' : color === 'yellow' ? 'warn' : 'safe');
}

function openPanel() {
  if (!currentPopup || !analysisData) return;
  currentPopup.dataset.panelOpen = 'true';
  const tooltip = document.getElementById('fp-tooltip'); if (tooltip) tooltip.remove();

  const data = analysisData;
  const colorHex = data.color === 'red' ? '#e74c3c' : data.color === 'yellow' ? '#ffd200' : '#38ef7d';
  const borderCls = data.color === 'red' ? 'border-danger' : data.color === 'yellow' ? 'border-warn' : 'border-safe';

  const panel = document.createElement('div');
  panel.id = 'fp-detail-panel';
  panel.classList.add(borderCls);

  const llm = data.details?.llm;
  const reasoning = llm?.reasoning || "Analyzing psychological intent...";

  panel.innerHTML = `
    <div id="fp-close-btn">&times;</div>
    <div class="fp-header">
      <span class="fp-brand">Fish-Pish Intelligence</span>
      <span class="fp-risk-badge ${data.color === 'red' ? 'danger' : data.color === 'yellow' ? 'warn' : 'safe'}">${data.phishing_probability}% Risk</span>
    </div>
    <div class="fp-bar-track"><div class="fp-bar-fill" style="width:${data.phishing_probability}%;background:${colorHex}"></div></div>
    
    <div class="fp-info-block" style="background:rgba(160,124,255,0.08); border:1px solid rgba(160,124,255,0.2)">
      <span class="fp-info-label" style="color:#a07cff">🤖 AI VERDICT</span>
      <span style="font-style:italic; font-size:11.5px">"${reasoning}"</span>
    </div>

    <div class="fp-signals">
      <div class="fp-signal-item">
        <span class="fp-sig-label">Safe Browsing</span>
        ${data.signals?.safe_browsing_skipped ? '⚠️ Unchecked' : (data.signals?.safe_browsing ? '❌ Flagged' : '✅ Safe')}
      </div>
      <div class="fp-signal-item">
        <span class="fp-sig-label">SSL Layer</span>
        ${data.signals?.ssl_secure ? '🔒 Secure' : '⚠️ Insecure'}
      </div>
    </div>
  `;

  panel.querySelector('#fp-close-btn')?.addEventListener('click', (e) => { e.stopPropagation(); closePanel(); });
  currentPopup.appendChild(panel);
  clearTimer(dismissTimer);
}

function closePanel() {
  const panel = document.getElementById('fp-detail-panel'); if (!panel) return;
  panel.style.animation = 'fp-fade-out 0.2s ease forwards';
  setTimeout(() => { panel.remove(); if (currentPopup) delete currentPopup.dataset.panelOpen; }, 200);
}

function startDismissTimer() {
  clearTimer(dismissTimer);
  dismissTimer = setTimeout(() => { if (currentPopup && !currentPopup.dataset.hovered) teardown(); }, DISMISS_DELAY);
}

function teardown() {
  clearTimer(hoverTimer); clearTimer(expandTimer); clearTimer(dismissTimer);
  if (currentPopup) currentPopup.remove();
  currentPopup = null; currentUrl = null; analysisData = null; analysisReady = false;
}

function scheduleTooltip() {
  clearTimer(expandTimer);
  expandTimer = setTimeout(() => {
    if (!currentPopup || currentPopup.querySelector('#fp-tooltip')) return;
    const t = document.createElement('div'); t.id = 'fp-tooltip';
    t.textContent = analysisReady ? "Report Ready · Click Dot" : "Analysing...";
    currentPopup.appendChild(t);
  }, EXPAND_DELAY);
}

function clearTimer(t: any) { if (t) clearTimeout(t); }
