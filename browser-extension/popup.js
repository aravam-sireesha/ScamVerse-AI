const statusEl = document.getElementById("status");
const detailEl = document.getElementById("detail");

const LABELS = {
  safe: "✅ Safe",
  suspicious: "⚠️ Suspicious",
  dangerous: "🚨 Dangerous",
  unknown: "❓ Not checked yet"
};

chrome.runtime.sendMessage({ type: "GET_STATUS_FOR_ACTIVE_TAB" }, (data) => {
  const status = data?.status || "unknown";
  statusEl.className = `status ${status}`;
  statusEl.textContent = LABELS[status];

  if (data?.result) {
    detailEl.textContent =
      `Risk score: ${data.result.risk_score}/100 · Confidence: ${(data.result.confidence_score * 100).toFixed(0)}%\n\n` +
      data.result.ai_analysis.summary;
  } else {
    detailEl.textContent = "Reload the page, or make sure the ScamShield API is running on localhost:8000.";
  }
});
