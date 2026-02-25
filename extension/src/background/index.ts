// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Fish Pish installed');
});

// Replace with your Hugging Face Space URL after deployment
// Example: https://YOUR_USERNAME-fish-pish-api.hf.space
const API_BASE_URL = 'http://localhost:8000';

// Proxy requests to backend to avoid Mixed Content / CORS issues in content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_URL') {
    const endpoint = message.fast ? '/analyze/fast' : '/analyze';
    fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: message.url, linkText: message.linkText })
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));

    return true;
  }
});
