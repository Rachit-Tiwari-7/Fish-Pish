function updatePopup(data: any) {
  if (!currentPopup) return;
  
  const { phishing_probability, summary, color } = data;
  
  let colorHex = '#2ecc71'; // Green
  if (color === 'red') colorHex = '#e74c3c';
  else if (color === 'yellow') colorHex = '#f1c40f';
  
  currentPopup.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; font-size: 14px;">Fish Pish</span>
        <span style="font-size: 12px; font-weight: bold; color: ${colorHex};">${phishing_probability}% Risk</span>
      </div>
      <div style="height: 4px; background: #eee; border-radius: 2px; overflow: hidden;">
        <div style="height: 100%; width: ${phishing_probability}%; background: ${colorHex};"></div>
      </div>
      <p style="margin: 0; font-size: 12px; color: #444; line-height: 1.4;">${summary}</p>
      <button id="lg-details-btn" style="background: none; border: none; color: #3498db; font-size: 11px; cursor: pointer; text-align: left; padding: 0;">View Details</button>
      
      <div id="lg-details-panel" style="display: none; margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
         <div style="font-size: 11px; color: #555; display: flex; flex-direction: column; gap: 4px;">
           <div style="font-style: italic; color: #666; margin-bottom: 4px;">AI Analysis: ${data.details.llm?.reasoning || "Unavailable"}</div>
           <div>Safe Browsing: ${data.signals.safe_browsing ? '❌ Match' : '✅ Clean'}</div>
           <div>VirusTotal: ${data.signals.virus_total_malicious} malicious</div>
           <div>SSL: ${data.signals.ssl_secure ? '✅ Secure' : '⚠️ Insecure'}</div>
         </div>
      </div>
    </div>
  `;
  
  const btn = currentPopup.querySelector('#lg-details-btn');
  const panel = currentPopup.querySelector('#lg-details-panel') as HTMLElement;
  
  if (btn && panel) {
    btn.addEventListener('click', () => {
      panel.style.display = 'block';
      currentPopup!.dataset.expanded = 'true';
      btn.remove();
    });
  }

  // Add mouse events to persist popup when interacting with it
  currentPopup.addEventListener('mouseenter', () => {
    currentPopup!.dataset.hovered = 'true';
  });
  
  currentPopup.addEventListener('mouseleave', () => {
    delete currentPopup!.dataset.hovered;
    // If not expanded and mouse leaves, start hide timer
    if (!currentPopup!.dataset.expanded) {
         setTimeout(() => {
             if (!currentPopup?.dataset.hovered) removePopup();
         }, 1000);
    }
  });
}
