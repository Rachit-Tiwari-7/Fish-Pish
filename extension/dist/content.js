let p=null,c=null,d=null,n=null,g=null,l=null,f=!1;const C=600,T=1200,I=3e3,z=["google.com","youtube.com","wikipedia.org","github.com","stackoverflow.com","reddit.com","twitter.com","x.com","linkedin.com","facebook.com","microsoft.com","apple.com","amazon.com","netflix.com","paypal.com"];function D(){if(document.getElementById("fp-styles"))return;const e=document.createElement("style");e.id="fp-styles",e.textContent=`
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
  `,document.head.appendChild(e)}document.addEventListener("mouseover",e=>{const t=e.target.closest("a");!t||!t.href||(r(p),p=setTimeout(()=>S(t),C))});document.addEventListener("mouseout",e=>{e.target.closest("a")&&(r(p),r(c),n&&!n.dataset.panelOpen&&v())});function S(e){if(g===e.href&&n)return;k(),D(),g=e.href;const t=e.getBoundingClientRect(),o=document.createElement("div");o.id="fp-popup-container",o.style.top=`${t.bottom+window.scrollY+6}px`,o.style.left=`${t.left+window.scrollX}px`;const a=document.createElement("div");a.id="fp-dot",a.innerHTML='<div id="fp-spinner"></div>',o.appendChild(a),document.body.appendChild(o),n=o,o.addEventListener("mouseenter",()=>{r(d),o.dataset.hovered="true"}),o.addEventListener("mouseleave",()=>{delete o.dataset.hovered,v()}),a.addEventListener("click",()=>{if(!f)return;document.getElementById("fp-detail-panel")?w():R()}),A(e.href,e.textContent||""),_()}async function A(e,t){try{const o=await chrome.runtime.sendMessage({type:"ANALYZE_URL",url:e,linkText:t,fast:!0});if(o.success){l=o.data;const a=new URL(e).hostname.toLowerCase(),i=z.some(s=>a.includes(s));(o.data.color!=="green"||i)&&h(o.data.color)}}catch{}try{const o=await chrome.runtime.sendMessage({type:"ANALYZE_URL",url:e,linkText:t,fast:!1});if(o.success){l=o.data,f=!0,h(o.data.color);const a=document.getElementById("fp-tooltip");a&&(a.textContent="Analysis Ready · Click Dot")}}catch{}}function h(e){const t=document.getElementById("fp-dot");if(!t)return;const o=document.getElementById("fp-spinner");o&&o.remove(),t.classList.remove("safe","warn","danger"),t.classList.add(e==="red"?"danger":e==="yellow"?"warn":"safe")}function R(){var u,m,b,x,y;if(!n||!l)return;n.dataset.panelOpen="true";const e=document.getElementById("fp-tooltip");e&&e.remove();const t=l,o=t.color==="red"?"#e74c3c":t.color==="yellow"?"#ffd200":"#38ef7d",a=t.color==="red"?"border-danger":t.color==="yellow"?"border-warn":"border-safe",i=document.createElement("div");i.id="fp-detail-panel",i.classList.add(a);const s=(u=t.details)==null?void 0:u.llm,E=(s==null?void 0:s.reasoning)||"Analyzing psychological intent...";i.innerHTML=`
    <div id="fp-close-btn">&times;</div>
    <div class="fp-header">
      <span class="fp-brand">Fish-Pish Intelligence</span>
      <span class="fp-risk-badge ${t.color==="red"?"danger":t.color==="yellow"?"warn":"safe"}">${t.phishing_probability}% Risk</span>
    </div>
    <div class="fp-bar-track"><div class="fp-bar-fill" style="width:${t.phishing_probability}%;background:${o}"></div></div>
    
    <div class="fp-info-block" style="background:rgba(160,124,255,0.08); border:1px solid rgba(160,124,255,0.2)">
      <span class="fp-info-label" style="color:#a07cff">🤖 AI VERDICT</span>
      <span style="font-style:italic; font-size:11.5px">"${E}"</span>
    </div>

    <div class="fp-signals">
      <div class="fp-signal-item">
        <span class="fp-sig-label">Safe Browsing</span>
        ${(m=t.signals)!=null&&m.safe_browsing_skipped?"⚠️ Unchecked":(b=t.signals)!=null&&b.safe_browsing?"❌ Flagged":"✅ Safe"}
      </div>
      <div class="fp-signal-item">
        <span class="fp-sig-label">SSL Layer</span>
        ${(x=t.signals)!=null&&x.ssl_secure?"🔒 Secure":"⚠️ Insecure"}
      </div>
    </div>
  `,(y=i.querySelector("#fp-close-btn"))==null||y.addEventListener("click",L=>{L.stopPropagation(),w()}),n.appendChild(i),r(d)}function w(){const e=document.getElementById("fp-detail-panel");e&&(e.style.animation="fp-fade-out 0.2s ease forwards",setTimeout(()=>{e.remove(),n&&delete n.dataset.panelOpen},200))}function v(){r(d),d=setTimeout(()=>{n&&!n.dataset.hovered&&k()},I)}function k(){r(p),r(c),r(d),n&&n.remove(),n=null,g=null,l=null,f=!1}function _(){r(c),c=setTimeout(()=>{if(!n||n.querySelector("#fp-tooltip"))return;const e=document.createElement("div");e.id="fp-tooltip",e.textContent=f?"Report Ready · Click Dot":"Analysing...",n.appendChild(e)},T)}function r(e){e&&clearTimeout(e)}
