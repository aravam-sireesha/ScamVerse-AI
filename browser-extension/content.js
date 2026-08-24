// Lightweight content script: asks the background worker for this tab's
// verdict and shows a dismissible banner if the site is risky.
(function () {
  chrome.runtime.sendMessage({ type: "GET_STATUS_FOR_ACTIVE_TAB" }, (data) => {
    if (!data || data.status !== "dangerous") return;

    const banner = document.createElement("div");
    banner.textContent =
      `⚠️ ScamShield flagged this site as DANGEROUS (risk score: ${data.result?.risk_score ?? "?"}/100). Avoid entering personal or payment details.`;
    banner.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 2147483647;
      background: #ef4444; color: white; font-family: sans-serif;
      font-size: 13px; padding: 10px 16px; text-align: center;
    `;

    const closeBtn = document.createElement("span");
    closeBtn.textContent = " ✕";
    closeBtn.style.cssText = "cursor: pointer; font-weight: bold; margin-left: 12px;";
    closeBtn.onclick = () => banner.remove();
    banner.appendChild(closeBtn);

    document.body?.prepend(banner);
  });
})();
