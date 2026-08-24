const API_BASE = "http://localhost:8000/api/v1";

async function checkUrl(url) {
  try {
    const res = await fetch(`${API_BASE}/scan/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "scan failed");
    return json.data; // { risk_score, confidence_score, ai_analysis, ... }
  } catch (err) {
    console.warn("ScamShield: backend unreachable, skipping check.", err);
    return null;
  }
}

function classify(riskScore) {
  if (riskScore == null) return "unknown";
  if (riskScore > 75) return "dangerous";
  if (riskScore > 40) return "suspicious";
  return "safe";
}

// Re-check whenever a tab finishes loading a new page
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url || !tab.url.startsWith("http")) return;

  const result = await checkUrl(tab.url);
  const status = classify(result?.risk_score);

  await chrome.storage.local.set({
    [`scamshield_${tabId}`]: { url: tab.url, status, result }
  });

  // Badge color feedback on the toolbar icon
  const badgeColors = {
    safe: "#10b981",
    suspicious: "#f59e0b",
    dangerous: "#ef4444",
    unknown: "#64748b"
  };
  chrome.action.setBadgeBackgroundColor({ color: badgeColors[status], tabId });
  chrome.action.setBadgeText({ text: status === "unknown" ? "" : status[0].toUpperCase(), tabId });
});

// Respond to popup.js requests for the current tab's latest result
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_STATUS_FOR_ACTIVE_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (!tab) return sendResponse(null);
      const stored = await chrome.storage.local.get(`scamshield_${tab.id}`);
      sendResponse(stored[`scamshield_${tab.id}`] || null);
    });
    return true; // keep the message channel open for the async response
  }
});
